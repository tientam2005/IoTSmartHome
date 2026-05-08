import { useState, useRef } from "react";
import { formatCurrency, type Contract } from "@/data/mockData";
import {
  getBuildings, getRooms, getTenants, getContracts,
  addContract, addTenant, updateTenant, updateRoom,
} from "@/data/buildingStore";
import { addTransaction } from "@/data/financeStore";
import { createTenantAccount } from "@/data/accountStore";
import { ocrMeterImage } from "@/lib/ocrMeter";
import { toast } from "sonner";
import { Copy, CheckCircle, Camera, Loader2, ScanLine } from "lucide-react";

interface Props {
  initialBuildingId?: string;
  initialRoomId?: string;
  onSuccess?: (contract: Contract) => void;
  onCancel?: () => void;
}

// Simulate OCR CCCD — trả về thông tin giả lập
const ocrCccd = async (_file: File, side: "front" | "back"): Promise<{
  cccd?: string; name?: string; dob?: string; hometown?: string;
} | null> => {
  return new Promise(resolve =>
    setTimeout(() => {
      if (side === "front") {
        resolve({ cccd: "079201001234", name: "NGUYỄN VĂN A", dob: "01/01/1995", hometown: "Hà Nội" });
      } else {
        resolve({});
      }
    }, 1500)
  );
};

const CreateContractForm = ({ initialBuildingId = "", initialRoomId = "", onSuccess, onCancel }: Props) => {
  const [formBuildingId, setFormBuildingId] = useState(initialBuildingId);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [createMode, setCreateMode] = useState<"new" | "existing">("new");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [newTenant, setNewTenant] = useState({ name: "", phone: "", cccd: "", hometown: "", email: "" });
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createdAccount, setCreatedAccount] = useState<{ phone: string; password: string; name: string } | null>(null);

  // CCCD photos
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState<"front" | "back" | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const buildings = getBuildings();
  const vacantRooms = getRooms().filter(r => r.buildingId === formBuildingId && r.status === "vacant");
  const selectedRoom = getRooms().find(r => r.id === selectedRoomId);
  const selectedBuilding = buildings.find(b => b.id === formBuildingId);

  const handleCccdPhoto = async (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") setCccdFront(url);
    else setCccdBack(url);

    setOcrLoading(side);
    try {
      const result = await ocrCccd(file, side);
      if (result && side === "front") {
        setNewTenant(p => ({
          ...p,
          ...(result.cccd && { cccd: result.cccd }),
          ...(result.name && { name: result.name }),
          ...(result.hometown && { hometown: result.hometown }),
        }));
        if (result.cccd || result.name) {
          toast.success("Đã đọc thông tin từ CCCD");
        }
      }
    } finally {
      setOcrLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existingTenant = getTenants().find(t => t.id === selectedTenantId);
    const tenantName = createMode === "new" ? newTenant.name : existingTenant?.name || "";

    if (!tenantName || !selectedRoomId || !startDate || !endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin"); return;
    }
    if (!selectedRoom || !selectedBuilding) return;
    if (selectedRoom.status !== "vacant") { toast.error(`Phòng ${selectedRoom.name} hiện không trống`); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error("Ngày kết thúc phải sau ngày bắt đầu"); return; }
    if (createMode === "existing") {
      const active = getContracts().find(c => c.tenantId === selectedTenantId && c.status === "active");
      if (active) { toast.error(`Khách đang có hợp đồng tại ${active.roomName}`); return; }
    }
    if (createMode === "new" && newTenant.cccd) {
      const dup = getTenants().find(t => t.cccd === newTenant.cccd);
      if (dup) { toast.error(`CCCD đã tồn tại (${dup.name})`); return; }
    }

    let tenantId = selectedTenantId;
    if (createMode === "new") {
      tenantId = `t${Date.now()}`;
      // Lưu ảnh CCCD vào hồ sơ khách
      addTenant({
        id: tenantId,
        name: newTenant.name, phone: newTenant.phone, cccd: newTenant.cccd,
        hometown: newTenant.hometown, email: newTenant.email,
        roomId: selectedRoomId, roomName: selectedRoom.name,
        buildingId: formBuildingId, moveInDate: startDate,
        cccdFront: cccdFront ?? undefined,
        cccdBack: cccdBack ?? undefined,
      });
      const account = createTenantAccount(tenantId, newTenant.name, newTenant.phone, newTenant.email);
      setCreatedAccount({ phone: account.phone, password: account.password, name: account.name });
    } else {
      updateTenant(tenantId, { roomId: selectedRoomId, roomName: selectedRoom.name, buildingId: formBuildingId, moveInDate: startDate });
    }

    const newContract: Contract = {
      id: `c${Date.now()}`, tenantId, tenantName,
      roomId: selectedRoomId, roomName: selectedRoom.name,
      buildingId: formBuildingId, startDate, endDate,
      deposit: Number(deposit) || 0,
      monthlyRent: selectedRoom.price,
      feeConfig: { ...selectedBuilding.feeConfig },
      status: "active",
    };
    addContract(newContract);

    if (Number(deposit) > 0) {
      addTransaction({ id: `tr${Date.now()}`, buildingId: formBuildingId, roomId: selectedRoomId, type: "income", category: "deposit", amount: Number(deposit), description: `Tiền cọc — ${selectedRoom.name} (${tenantName})`, date: startDate || new Date().toISOString().slice(0, 10), createdBy: "l1" });
    }

    updateRoom(selectedRoomId, { status: "occupied", currentTenantId: tenantId, currentTenant: tenantName });
    toast.success(`Đã tạo hợp đồng cho ${tenantName} tại ${selectedRoom.name}`);
    if (createMode !== "new") onSuccess?.(newContract);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none";

  if (createdAccount) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="p-3 rounded-full bg-success/10"><CheckCircle className="h-8 w-8 text-success" /></div>
          <p className="font-bold text-base">Tạo hợp đồng thành công!</p>
          <p className="text-xs text-muted-foreground text-center">Tài khoản đăng nhập đã được tạo cho khách thuê</p>
        </div>
        <div className="glass-card rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin đăng nhập</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tên đăng nhập</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{createdAccount.phone}</span>
                <button onClick={() => { navigator.clipboard.writeText(createdAccount.phone); toast.success("Đã copy"); }} className="p-1 rounded hover:bg-secondary"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Mật khẩu</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm tracking-widest">{createdAccount.password}</span>
                <button onClick={() => { navigator.clipboard.writeText(createdAccount.password); toast.success("Đã copy"); }} className="p-1 rounded hover:bg-secondary"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">Mật khẩu mặc định là 6 số cuối số điện thoại.</p>
        </div>
        <button onClick={() => { setCreatedAccount(null); onSuccess?.(null as any); }} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Hoàn tất</button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!initialBuildingId && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Khu trọ</label>
          <select value={formBuildingId} onChange={e => { setFormBuildingId(e.target.value); setSelectedRoomId(""); }} className={inputCls}>
            <option value="">-- Chọn khu trọ --</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {formBuildingId && !initialRoomId && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Phòng trống</label>
          {vacantRooms.length === 0
            ? <p className="text-xs text-destructive">Không có phòng trống trong khu này</p>
            : <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className={inputCls}>
                <option value="">-- Chọn phòng --</option>
                {vacantRooms.map(r => <option key={r.id} value={r.id}>{r.name} — {formatCurrency(r.price)}/th</option>)}
              </select>
          }
        </div>
      )}

      {selectedRoom && (
        <div className="glass-card rounded-xl p-3 text-xs space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span className="font-semibold">{selectedRoom.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Giá thuê</span><span className="font-semibold text-primary">{formatCurrency(selectedRoom.price)}/tháng</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Diện tích</span><span>{selectedRoom.area}m²</span></div>
        </div>
      )}

      {(selectedRoomId || initialRoomId) && (
        <>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Khách thuê</label>
            <div className="flex gap-2 mb-3">
              <button type="button" onClick={() => setCreateMode("new")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${createMode === "new" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Khách mới</button>
              <button type="button" onClick={() => setCreateMode("existing")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${createMode === "existing" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Thuê lại</button>
            </div>

            {createMode === "new" ? (
              <div className="space-y-3">
                {/* Quét CCCD */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">Chụp CCCD để tự điền thông tin</p>
                    <span className="text-[10px] text-muted-foreground">Tuỳ chọn</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Mặt trước */}
                    <label className="relative cursor-pointer">
                      <input ref={frontRef} type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={e => e.target.files?.[0] && handleCccdPhoto("front", e.target.files[0])} />
                      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden aspect-[1.6/1] flex items-center justify-center bg-secondary/30 hover:border-primary/50 transition">
                        {cccdFront ? (
                          <img src={cccdFront} alt="Mặt trước" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-medium">MẶT TRƯỚC</span>
                          </div>
                        )}
                        {ocrLoading === "front" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      {cccdFront && ocrLoading !== "front" && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/40 text-center py-0.5 rounded-b-xl">
                          <span className="text-[9px] text-white">✓ Đã chụp</span>
                        </div>
                      )}
                    </label>

                    {/* Mặt sau */}
                    <label className="relative cursor-pointer">
                      <input ref={backRef} type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={e => e.target.files?.[0] && handleCccdPhoto("back", e.target.files[0])} />
                      <div className="rounded-xl border-2 border-dashed border-border overflow-hidden aspect-[1.6/1] flex items-center justify-center bg-secondary/30 hover:border-primary/50 transition">
                        {cccdBack ? (
                          <img src={cccdBack} alt="Mặt sau" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera className="h-5 w-5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-medium">MẶT SAU</span>
                          </div>
                        )}
                        {ocrLoading === "back" && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      {cccdBack && ocrLoading !== "back" && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/40 text-center py-0.5 rounded-b-xl">
                          <span className="text-[9px] text-white">✓ Đã chụp</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {(cccdFront || cccdBack) && (
                    <p className="text-[10px] text-muted-foreground text-center">Ảnh sẽ lưu vào hồ sơ khách thuê</p>
                  )}
                </div>

                {/* Form thông tin — tự điền từ OCR */}
                <input placeholder="Họ và tên *" value={newTenant.name} onChange={e => setNewTenant(p => ({ ...p, name: e.target.value }))} className={inputCls} />
                <input placeholder="Số CCCD" value={newTenant.cccd} onChange={e => setNewTenant(p => ({ ...p, cccd: e.target.value }))} className={inputCls} />
                <input placeholder="Số điện thoại *" value={newTenant.phone} onChange={e => setNewTenant(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
                <input placeholder="Quê quán" value={newTenant.hometown} onChange={e => setNewTenant(p => ({ ...p, hometown: e.target.value }))} className={inputCls} />
                <input placeholder="Email" type="email" value={newTenant.email} onChange={e => setNewTenant(p => ({ ...p, email: e.target.value }))} className={inputCls} />
              </div>
            ) : (
              <div className="space-y-2">
                <select value={selectedTenantId} onChange={e => setSelectedTenantId(e.target.value)} className={inputCls}>
                  <option value="">-- Chọn khách --</option>
                  {getTenants().filter(t => !getContracts().some(c => c.tenantId === t.id && c.status === "active"))
                    .map(t => <option key={t.id} value={t.id}>{t.name} — {t.phone}{t.roomName ? ` (cũ: ${t.roomName})` : ""}</option>)}
                </select>
                {getTenants().filter(t => !getContracts().some(c => c.tenantId === t.id && c.status === "active")).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">Không có khách nào chưa có hợp đồng</p>
                )}
                {selectedTenantId && (() => {
                  const t = getTenants().find(x => x.id === selectedTenantId);
                  return t ? (
                    <div className="glass-card rounded-xl p-3 text-xs space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">CCCD</span><span>{t.cccd}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">SĐT</span><span>{t.phone}</span></div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ngày bắt đầu</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ngày kết thúc</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tiền cọc</label>
            <input type="number" placeholder="VD: 6000000" value={deposit} onChange={e => setDeposit(e.target.value)} className={inputCls} />
          </div>

          {selectedBuilding && (
            <div className="glass-card rounded-xl p-3">
              <p className="text-xs font-semibold mb-2">Phí dịch vụ (theo khu trọ)</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Điện</span><span>{formatCurrency(selectedBuilding.feeConfig.electricPrice)}/kWh</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Nước</span><span>{formatCurrency(selectedBuilding.feeConfig.waterPrice)}/m³</span></div>
                {selectedBuilding.feeConfig.garbageFee && <div className="flex justify-between"><span className="text-muted-foreground">Rác</span><span>{formatCurrency(selectedBuilding.feeConfig.garbageFee)}/th</span></div>}
                {selectedBuilding.feeConfig.wifiFee && <div className="flex justify-between"><span className="text-muted-foreground">Wi-Fi</span><span>{formatCurrency(selectedBuilding.feeConfig.wifiFee)}/th</span></div>}
                {selectedBuilding.feeConfig.parkingFee && <div className="flex justify-between"><span className="text-muted-foreground">Giữ xe</span><span>{formatCurrency(selectedBuilding.feeConfig.parkingFee)}/th</span></div>}
                {selectedBuilding.feeConfig.serviceFee && <div className="flex justify-between"><span className="text-muted-foreground">Dịch vụ</span><span>{formatCurrency(selectedBuilding.feeConfig.serviceFee)}/th</span></div>}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">Hủy</button>
            )}
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Tạo hợp đồng</button>
          </div>
        </>
      )}
    </form>
  );
};

export default CreateContractForm;
