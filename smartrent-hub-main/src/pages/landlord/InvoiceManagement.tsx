import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, type Room, type Building, type FeeConfig, type MeterReading, type Invoice, type InvoiceFeeItem } from "@/data/mockData";
import {
  getBuildings, getRooms, getTenants, getContracts, getMeterReadings,
  getInvoices, addInvoices, updateInvoiceStatus, addNotification,
} from "@/data/buildingStore";
import { addTransaction } from "@/data/financeStore";
import { ocrMeterImage } from "@/lib/ocrMeter";
import { useBuilding } from "@/contexts/BuildingContext";
import { Plus, Search, ChevronRight, Zap, Droplets, FileText, Send, Check, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

type Step = "select-building" | "meter-input" | "review" | "done";

interface MeterInput {
  roomId: string;
  roomName: string;
  tenantName: string;
  tenantId: string;
  electricReading: string;
  waterReading: string;
  previousElectric: number;
  previousWater: number;
  roomFee: number;
  feeConfig: FeeConfig;
}

const InvoiceManagement = () => {
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid" | "overdue" | "pending">("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(() => getInvoices());

  const refreshInvoices = () => setInvoiceList([...getInvoices()]);

  // === Invoice creation flow ===
  const [step, setStep] = useState<Step>("select-building");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [currentMonth] = useState(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  });
  const [meterInputs, setMeterInputs] = useState<MeterInput[]>([]);
  const [generatedInvoices, setGeneratedInvoices] = useState<Invoice[]>([]);
  // Ảnh minh chứng: key = roomId, value = { electric?: string, water?: string }
  const [meterPhotos, setMeterPhotos] = useState<Record<string, { electric?: string; water?: string }>>({});
  // OCR loading: key = `${roomId}-electric` hoặc `${roomId}-water`
  const [ocrLoading, setOcrLoading] = useState<Record<string, boolean>>({});

  const { selectedBuildingId, setSelectedBuildingId } = useBuilding();

  const filtered = invoiceList
    .filter(i => selectedBuildingId === "all" || i.buildingId === selectedBuildingId)
    .filter(i => filter === "all" || i.status === filter);

  const startCreation = (building: Building) => {
    setSelectedBuilding(building);
    const occupiedRooms = getRooms().filter(r => r.buildingId === building.id && r.status === "occupied");
    const inputs: MeterInput[] = occupiedRooms.map(room => {
      const contract = getContracts().find(c => c.roomId === room.id && c.status === "active");
      const tenant = getTenants().find(t => t.id === room.currentTenantId);
      const prevReadings = getMeterReadings()
        .filter(mr => mr.roomId === room.id)
        .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
      const lastReading = prevReadings[0];

      return {
        roomId: room.id,
        roomName: room.name,
        tenantName: tenant?.name || room.currentTenant || "",
        tenantId: tenant?.id || "",
        electricReading: "",
        waterReading: "",
        previousElectric: lastReading?.electricReading || 0,
        previousWater: lastReading?.waterReading || 0,
        roomFee: contract?.monthlyRent || room.price,
        feeConfig: contract?.feeConfig || building.feeConfig,
      };
    });
    setMeterInputs(inputs);
    setStep("meter-input");
  };

  const updateMeterInput = (index: number, field: "electricReading" | "waterReading", value: string) => {
    setMeterInputs(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleMeterPhoto = async (roomId: string, type: "electric" | "water", file: File, idx: number) => {
    const url = URL.createObjectURL(file);
    setMeterPhotos(prev => ({ ...prev, [roomId]: { ...prev[roomId], [type]: url } }));

    const key = `${roomId}-${type}`;
    setOcrLoading(prev => ({ ...prev, [key]: true }));
    try {
      const m = meterInputs[idx];
      const previousValue = type === "electric" ? m.previousElectric : m.previousWater;
      // Điện tối đa 500 kWh/tháng, nước tối đa 30 m³/tháng
      const maxUsage = type === "electric" ? 500 : 30;
      const result = await ocrMeterImage(file, previousValue, maxUsage);
      if (result) {
        const field = type === "electric" ? "electricReading" : "waterReading";
        updateMeterInput(idx, field, String(result.value));
        toast.success(`Đọc chỉ số ${type === "electric" ? "điện" : "nước"}: ${result.value}`);
      } else {
        toast.error("Không đọc được chỉ số hợp lệ, vui lòng nhập tay");
      }
    } finally {
      setOcrLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const buildFeeItems = (config: FeeConfig): InvoiceFeeItem[] => {
    const items: InvoiceFeeItem[] = [];
    if (config.garbageFee) items.push({ name: "Rác", amount: config.garbageFee });
    if (config.wifiFee) items.push({ name: "Wi-Fi", amount: config.wifiFee });
    if (config.parkingFee) items.push({ name: "Giữ xe", amount: config.parkingFee });
    if (config.serviceFee) items.push({ name: "Dịch vụ", amount: config.serviceFee });
    if (config.otherFees) config.otherFees.forEach(f => items.push(f));
    return items;
  };

  const generateInvoices = () => {
    // Validate: chỉ số mới phải >= chỉ số cũ (chỉ với phòng đã nhập)
    const invalid = meterInputs.filter(m => {
      if (!m.electricReading && !m.waterReading) return false;
      return (m.electricReading && parseInt(m.electricReading) < m.previousElectric) ||
             (m.waterReading && parseInt(m.waterReading) < m.previousWater);
    });
    if (invalid.length > 0) {
      toast.error(`${invalid.map(m => m.roomName).join(", ")}: Chỉ số mới không được nhỏ hơn chỉ số cũ`);
      return;
    }
    const ready = meterInputs.filter(m => m.electricReading && m.waterReading);
    if (ready.length === 0) {
      toast.error("Chưa nhập chỉ số cho phòng nào");
      return;
    }
    const invs: Invoice[] = ready
      .map((m, idx) => {
        const elecNew = parseInt(m.electricReading);
        const waterNew = parseInt(m.waterReading);
        const elecUsage = (elecNew - m.previousElectric) * m.feeConfig.electricPrice;
        const waterUsage = (waterNew - m.previousWater) * m.feeConfig.waterPrice;
        const fees = buildFeeItems(m.feeConfig);
        const feesTotal = fees.reduce((s, f) => s + f.amount, 0);
        const total = m.roomFee + elecUsage + waterUsage + feesTotal;
        const qrData = `PHONGTRO|${m.roomName}|${currentMonth}|${total}|${m.tenantName}`;

        return {
          id: `new-${idx}`,
          roomId: m.roomId,
          roomName: m.roomName,
          buildingId: selectedBuilding!.id,
          tenantId: m.tenantId,
          tenantName: m.tenantName,
          month: currentMonth,
          roomFee: m.roomFee,
          electricOld: m.previousElectric,
          electricNew: elecNew,
          electricPrice: m.feeConfig.electricPrice,
          waterOld: m.previousWater,
          waterNew: waterNew,
          waterPrice: m.feeConfig.waterPrice,
          fees,
          total,
          status: "unpaid" as const,
          createdAt: new Date().toISOString().slice(0, 10),
          qrData,
          meterPhotos: meterPhotos[m.roomId] ?? undefined,
          isReadByTenant: false, // khách chưa xem
        };
      });
    setGeneratedInvoices(invs);
    setStep("review");
  };

  const confirmAndSend = () => {
    addInvoices(generatedInvoices);
    refreshInvoices();

    // Gửi thông báo cho từng khách thuê
    generatedInvoices.forEach(inv => {
      addNotification({
        id: `n${Date.now()}-${inv.roomId}`,
        title: `Hoá đơn tháng ${inv.month} — ${inv.roomName}`,
        content: `Hoá đơn tháng ${inv.month} của bạn đã được lập. Tổng cộng: ${formatCurrency(inv.total)}. Vui lòng thanh toán trước ngày 05 tháng sau.`,
        createdAt: new Date().toISOString().slice(0, 10),
        isRead: false,
        target: inv.roomId,
      });
    });
    toast.success(`Đã tạo ${generatedInvoices.length} hoá đơn và gửi cho khách thuê!`);
    setStep("done");
    setTimeout(() => {
      setShowCreate(false);
      setStep("select-building");
      setGeneratedInvoices([]);
    }, 1500);
  };

  const resetCreation = () => {
    setStep("select-building");
    setSelectedBuilding(null);
    setMeterInputs([]);
    setGeneratedInvoices([]);
    setMeterPhotos({});
    setShowCreate(false);
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Hóa đơn" showLogout showBuildingSelector rightAction={
        <button onClick={() => setShowCreate(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-3">
        {/* Status filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "unpaid", "pending", "paid", "overdue"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap",
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              {f === "all" ? "Tất cả" : f === "unpaid" ? "Chưa TT" : f === "pending" ? (
                <span className="flex items-center gap-1">
                  Chờ XN
                  {invoiceList.filter(i => i.status === "pending" && (selectedBuildingId === "all" || i.buildingId === selectedBuildingId)).length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  )}
                </span>
              ) : f === "paid" ? "Đã TT" : "Quá hạn"}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((inv) => (
            <button key={inv.id} onClick={() => setSelected(inv)} className="w-full glass-card rounded-xl p-4 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{inv.roomName}</p>
                  <p className="text-xs text-muted-foreground">{inv.tenantName} • {inv.month}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(inv.total)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Không có hoá đơn nào</p>
          )}
        </div>
      </div>

      {/* === INVOICE DETAIL === */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Hóa đơn {selected?.month}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span className="font-medium">{selected.roomName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Khách thuê</span><span>{selected.tenantName}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền phòng</span><span>{formatCurrency(selected.roomFee)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Điện ({selected.electricNew - selected.electricOld} kWh)</span><span>{formatCurrency((selected.electricNew - selected.electricOld) * selected.electricPrice)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Nước ({selected.waterNew - selected.waterOld} m³)</span><span>{formatCurrency((selected.waterNew - selected.waterOld) * selected.waterPrice)}</span></div>
              {selected.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between"><span className="text-muted-foreground">{fee.name}</span><span>{formatCurrency(fee.amount)}</span></div>
              ))}
              <hr className="border-border" />
              <div className="flex justify-between font-bold text-base"><span>Tổng cộng</span><span className="text-primary">{formatCurrency(selected.total)}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Trạng thái</span><StatusBadge status={selected.status} /></div>

              {/* Xác nhận thanh toán — chủ nhà không cần QR */}
              {selected.status === "pending" && (
                <div className="pt-2 space-y-2">
                  <div className="py-2.5 px-3 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium text-center">
                    Khách đã xác nhận chuyển khoản — chờ bạn xác nhận
                  </div>
                  {/* Ảnh minh chứng từ khách */}
                  {selected.paymentProof && (
                    <div className="rounded-xl overflow-hidden border border-border">
                      <img src={selected.paymentProof} alt="Minh chứng" className="w-full object-cover max-h-48" />
                      <p className="text-[10px] text-center text-muted-foreground py-1">📎 Ảnh minh chứng từ khách</p>
                    </div>
                  )}
                  <button onClick={() => {
                    updateInvoiceStatus(selected.id, "paid");
                    addTransaction({
                      id: `tr${Date.now()}`,
                      buildingId: selected.buildingId,
                      roomId: selected.roomId,
                      type: "income",
                      category: "rent",
                      amount: selected.total,
                      description: `Hoá đơn tháng ${selected.month} — ${selected.roomName} (${selected.tenantName})`,
                      date: new Date().toISOString().slice(0, 10),
                      createdBy: "l1",
                    });
                    refreshInvoices();
                    setSelected(null);
                    toast.success("Đã xác nhận thanh toán và ghi nhận vào thu chi");
                  }} className="w-full py-2.5 rounded-lg bg-success text-success-foreground font-medium text-sm">
                    <Check className="h-4 w-4 inline mr-1" />Xác nhận đã nhận tiền
                  </button>
                  <button onClick={() => {
                    updateInvoiceStatus(selected.id, "unpaid");
                    refreshInvoices();
                    setSelected(prev => prev ? { ...prev, status: "unpaid" } : null);
                    toast.info("Đã từ chối — hoá đơn trở về chưa thanh toán");
                  }} className="w-full py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                    Từ chối (chưa nhận được tiền)
                  </button>
                </div>
              )}
              {selected.status !== "paid" && selected.status !== "pending" && (
                <div className="pt-2 space-y-2">
                  <button onClick={() => {
                    updateInvoiceStatus(selected.id, "paid");
                    addTransaction({
                      id: `tr${Date.now()}`,
                      buildingId: selected.buildingId,
                      roomId: selected.roomId,
                      type: "income",
                      category: "rent",
                      amount: selected.total,
                      description: `Hoá đơn tháng ${selected.month} — ${selected.roomName} (${selected.tenantName})`,
                      date: new Date().toISOString().slice(0, 10),
                      createdBy: "l1",
                    });
                    refreshInvoices();
                    setSelected(null);
                    toast.success("Đã xác nhận thanh toán và ghi nhận vào thu chi");
                  }} className="w-full py-2.5 rounded-lg bg-success text-success-foreground font-medium text-sm">
                    <Check className="h-4 w-4 inline mr-1" />Xác nhận đã thanh toán
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === CREATE INVOICE FLOW === */}
      <Dialog open={showCreate} onOpenChange={resetCreation}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          {step === "select-building" && (
            <>
              <DialogHeader><DialogTitle>Lập hoá đơn tháng {currentMonth}</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground mb-3">Chọn khu trọ để chốt chỉ số</p>
              <div className="space-y-2">
                {getBuildings().map(b => {
                  const occupied = getRooms().filter(r => r.buildingId === b.id && r.status === "occupied").length;
                  return (
                    <button
                      key={b.id}
                      onClick={() => startCreation(b)}
                      className="w-full glass-card rounded-xl p-4 text-left flex items-center justify-between active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <p className="font-semibold text-sm">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.address}</p>
                        <p className="text-xs text-primary mt-1">{occupied} phòng đang thuê</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "meter-input" && (
            <>
              <DialogHeader>
                <DialogTitle>Nhập chỉ số — {selectedBuilding?.name}</DialogTitle>
              </DialogHeader>
              <p className="text-xs text-muted-foreground mb-2">Chỉ nhập chỉ số <b>hiện tại</b>. Hệ thống tự lấy chỉ số tháng trước.</p>
              <p className="text-xs text-muted-foreground mb-3">
                Phòng nào chưa nhập sẽ <b>không</b> được xuất hoá đơn lần này.
              </p>
              <div className="space-y-4">
                {meterInputs.map((m, idx) => (
                  <div key={m.roomId} className="glass-card rounded-xl p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-sm">{m.roomName}</p>
                      <p className="text-xs text-muted-foreground">{m.tenantName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Zap className="h-3 w-3" /> Điện hiện tại (kWh)
                        </label>
                        <input
                          type="number"
                          placeholder={`Cũ: ${m.previousElectric}`}
                          value={m.electricReading}
                          onChange={e => updateMeterInput(idx, "electricReading", e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-ring focus:outline-none ${
                            m.electricReading && parseInt(m.electricReading) < m.previousElectric
                              ? "border-destructive bg-destructive/5"
                              : "border-input bg-card"
                          }`}
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Tháng trước: {m.previousElectric} kWh</p>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Droplets className="h-3 w-3" /> Nước hiện tại (m³)
                        </label>
                        <input
                          type="number"
                          placeholder={`Cũ: ${m.previousWater}`}
                          value={m.waterReading}
                          onChange={e => updateMeterInput(idx, "waterReading", e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-ring focus:outline-none ${
                            m.waterReading && parseInt(m.waterReading) < m.previousWater
                              ? "border-destructive bg-destructive/5"
                              : "border-input bg-card"
                          }`}
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Tháng trước: {m.previousWater} m³</p>
                      </div>
                    </div>

                    {/* Preview tính tiền realtime */}
                    {(m.electricReading || m.waterReading) && (() => {
                      const eNew = parseInt(m.electricReading || "0");
                      const wNew = parseInt(m.waterReading || "0");
                      const eUsage = Math.max(0, eNew - m.previousElectric);
                      const wUsage = Math.max(0, wNew - m.previousWater);
                      const eAmt = eUsage * m.feeConfig.electricPrice;
                      const wAmt = wUsage * m.feeConfig.waterPrice;
                      const fees = [
                        m.feeConfig.garbageFee, m.feeConfig.wifiFee,
                        m.feeConfig.parkingFee, m.feeConfig.serviceFee,
                      ].filter(Boolean).reduce((s, v) => s + (v ?? 0), 0);
                      const total = m.roomFee + eAmt + wAmt + fees;
                      const eError = m.electricReading && eNew < m.previousElectric;
                      const wError = m.waterReading && wNew < m.previousWater;
                      return (
                        <div className="rounded-lg bg-secondary/50 p-2 text-xs space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tiền phòng</span>
                            <span>{formatCurrency(m.roomFee)}</span>
                          </div>
                          <div className={`flex justify-between ${eError ? "text-destructive" : ""}`}>
                            <span className="text-muted-foreground">Điện ({eUsage} kWh)</span>
                            <span>{eError ? "⚠ Sai chỉ số" : formatCurrency(eAmt)}</span>
                          </div>
                          <div className={`flex justify-between ${wError ? "text-destructive" : ""}`}>
                            <span className="text-muted-foreground">Nước ({wUsage} m³)</span>
                            <span>{wError ? "⚠ Sai chỉ số" : formatCurrency(wAmt)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t border-border pt-0.5 mt-0.5">
                            <span>Dự kiến</span>
                            <span className="text-primary">{formatCurrency(total)}</span>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Show fee preview */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Phòng: {formatCurrency(m.roomFee)}</span>
                      {m.feeConfig.garbageFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Rác: {formatCurrency(m.feeConfig.garbageFee)}</span>}
                      {m.feeConfig.wifiFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Wi-Fi: {formatCurrency(m.feeConfig.wifiFee)}</span>}
                      {m.feeConfig.parkingFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">Xe: {formatCurrency(m.feeConfig.parkingFee)}</span>}
                      {m.feeConfig.serviceFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">DV: {formatCurrency(m.feeConfig.serviceFee)}</span>}
                    </div>

                    {/* Ảnh minh chứng */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5">Ảnh minh chứng (tuỳ chọn)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Ảnh điện */}
                        <label className="relative cursor-pointer">
                          <input type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={e => e.target.files?.[0] && handleMeterPhoto(m.roomId, "electric", e.target.files[0], idx)} />
                          <div className="rounded-lg border border-dashed border-border overflow-hidden aspect-video flex items-center justify-center bg-secondary/30">
                            {meterPhotos[m.roomId]?.electric ? (
                              <img src={meterPhotos[m.roomId].electric} alt="Điện" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1 py-2">
                                <Zap className="h-4 w-4 text-warning" />
                                <span className="text-[10px] text-muted-foreground">Chụp đồng hồ điện</span>
                              </div>
                            )}
                            {ocrLoading[`${m.roomId}-electric`] && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <span className="text-white text-[10px]">Đang đọc...</span>
                              </div>
                            )}
                          </div>
                          {meterPhotos[m.roomId]?.electric && !ocrLoading[`${m.roomId}-electric`] && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-center py-0.5">
                              <span className="text-[9px] text-white">⚡ Đã chụp ✓</span>
                            </div>
                          )}
                        </label>

                        {/* Ảnh nước */}
                        <label className="relative cursor-pointer">
                          <input type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={e => e.target.files?.[0] && handleMeterPhoto(m.roomId, "water", e.target.files[0], idx)} />
                          <div className="rounded-lg border border-dashed border-border overflow-hidden aspect-video flex items-center justify-center bg-secondary/30">
                            {meterPhotos[m.roomId]?.water ? (
                              <img src={meterPhotos[m.roomId].water} alt="Nước" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1 py-2">
                                <Droplets className="h-4 w-4 text-blue-400" />
                                <span className="text-[10px] text-muted-foreground">Chụp đồng hồ nước</span>
                              </div>
                            )}
                            {ocrLoading[`${m.roomId}-water`] && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <span className="text-white text-[10px]">Đang đọc...</span>
                              </div>
                            )}
                          </div>
                          {meterPhotos[m.roomId]?.water && !ocrLoading[`${m.roomId}-water`] && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-center py-0.5">
                              <span className="text-[9px] text-white">💧 Đã chụp ✓</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep("select-building")} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Quay lại</button>
                <button onClick={generateInvoices} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  Xuất {meterInputs.filter(m => m.electricReading && m.waterReading).length > 0
                    ? `${meterInputs.filter(m => m.electricReading && m.waterReading).length} hoá đơn`
                    : "hoá đơn"}
                </button>
              </div>
            </>
          )}

          {step === "review" && (
            <>
              <DialogHeader><DialogTitle>Xác nhận hoá đơn</DialogTitle></DialogHeader>
              <p className="text-xs text-muted-foreground mb-3">{generatedInvoices.length} hoá đơn sẽ được tạo và gửi cho khách thuê</p>
              <div className="space-y-3">
                {generatedInvoices.map((inv) => (
                  <div key={inv.id} className="glass-card rounded-xl p-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{inv.roomName} — {inv.tenantName}</span>
                    </div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Tiền phòng</span><span>{formatCurrency(inv.roomFee)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Điện ({inv.electricNew - inv.electricOld} kWh × {formatCurrency(inv.electricPrice)})</span><span>{formatCurrency((inv.electricNew - inv.electricOld) * inv.electricPrice)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-muted-foreground">Nước ({inv.waterNew - inv.waterOld} m³ × {formatCurrency(inv.waterPrice)})</span><span>{formatCurrency((inv.waterNew - inv.waterOld) * inv.waterPrice)}</span></div>
                    {inv.fees.map((f, i) => (
                      <div key={i} className="flex justify-between text-xs"><span className="text-muted-foreground">{f.name}</span><span>{formatCurrency(f.amount)}</span></div>
                    ))}
                    <hr className="border-border" />
                    <div className="flex justify-between font-bold"><span>Tổng</span><span className="text-primary">{formatCurrency(inv.total)}</span></div>

                    <div className="flex justify-center pt-2">
                      <div className="bg-card p-2 rounded-lg border border-border">
                        <QRCodeSVG value={inv.qrData || ""} size={100} />
                      </div>
                    </div>
                    {/* Ảnh minh chứng trong review */}
                    {(meterPhotos[inv.roomId]?.electric || meterPhotos[inv.roomId]?.water) && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {meterPhotos[inv.roomId]?.electric && (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img src={meterPhotos[inv.roomId].electric} alt="Điện" className="w-full object-cover aspect-video" />
                            <p className="text-[9px] text-center text-muted-foreground py-0.5">⚡ Đồng hồ điện</p>
                          </div>
                        )}
                        {meterPhotos[inv.roomId]?.water && (
                          <div className="rounded-lg overflow-hidden border border-border">
                            <img src={meterPhotos[inv.roomId].water} alt="Nước" className="w-full object-cover aspect-video" />
                            <p className="text-[9px] text-center text-muted-foreground py-0.5">💧 Đồng hồ nước</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setStep("meter-input")} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Sửa lại</button>
                <button onClick={confirmAndSend} className="flex-1 py-2.5 rounded-lg bg-success text-success-foreground text-sm font-medium flex items-center justify-center gap-1">
                  <Send className="h-4 w-4" /> Gửi cho khách
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="p-4 rounded-full bg-success/10">
                <Check className="h-8 w-8 text-success" />
              </div>
              <p className="font-bold text-lg">Hoàn tất!</p>
              <p className="text-sm text-muted-foreground text-center">Đã tạo {generatedInvoices.length} hoá đơn và thông báo cho khách thuê</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default InvoiceManagement;
