import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, type Invoice } from "@/data/mockData";
import { getInvoices, updateInvoiceStatus, updateInvoiceProof, markInvoiceReadByTenant } from "@/data/buildingStore";
import { addLandlordNotif } from "@/data/landlordNotifStore";
import { useTenant } from "@/contexts/TenantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TenantInvoices = () => {
  const { tenant } = useTenant();
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid" | "overdue" | "pending">("all");
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(() =>
    tenant ? getInvoices().filter(i => i.tenantId === tenant.id) : []
  );
  const [proofFile, setProofFile] = useState<string | null>(null);
  const proofRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    if (tenant) setInvoiceList(getInvoices().filter(i => i.tenantId === tenant.id));
  };

  const handleConfirmTransfer = (inv: Invoice) => {
    if (!proofFile) { toast.error("Vui lòng tải ảnh minh chứng chuyển khoản"); return; }
    updateInvoiceProof(inv.id, proofFile);
    updateInvoiceStatus(inv.id, "pending");
    // Thông báo cho chủ nhà
    addLandlordNotif({
      type: "payment_pending",
      title: "Khách xác nhận chuyển khoản",
      body: `${inv.tenantName} đã gửi minh chứng thanh toán hoá đơn tháng ${inv.month} — ${formatCurrency(inv.total)}`,
      roomName: inv.roomName,
      tenantName: inv.tenantName,
      refId: inv.id,
    });
    refresh();
    setSelected(null);
    setProofFile(null);
    toast.success("Đã gửi xác nhận chuyển khoản. Chờ chủ trọ xác nhận.");
  };

  const filtered = invoiceList.filter(i => filter === "all" || i.status === filter);

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Hóa đơn" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "unpaid", "pending", "paid", "overdue"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition",
              filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>
              {f === "all" ? "Tất cả" : f === "unpaid" ? "Chưa TT" : f === "pending" ? "Chờ XN" : f === "paid" ? "Đã TT" : "Quá hạn"}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Chưa có hoá đơn nào</p>
        )}

        <div className="space-y-2">
          {filtered.map(inv => (
            <button key={inv.id} onClick={() => { setSelected(inv); markInvoiceReadByTenant(inv.id); refresh(); }} className="w-full glass-card rounded-xl p-4 text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">Tháng {inv.month}</p>
                  <p className="text-xs text-muted-foreground">{inv.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(inv.total)}</p>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chi tiết hóa đơn {selected?.month}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span className="font-medium">{selected.roomName}</span></div>
              <hr className="border-border" />
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền phòng</span><span>{formatCurrency(selected.roomFee)}</span></div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Điện ({selected.electricNew - selected.electricOld} kWh)</span>
                <span>{formatCurrency((selected.electricNew - selected.electricOld) * selected.electricPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nước ({selected.waterNew - selected.waterOld} m³)</span>
                <span>{formatCurrency((selected.waterNew - selected.waterOld) * selected.waterPrice)}</span>
              </div>
              {selected.fees.map((fee, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground">{fee.name}</span>
                  <span>{formatCurrency(fee.amount)}</span>
                </div>
              ))}
              <hr className="border-border" />
              <div className="flex justify-between font-bold text-base">
                <span>Tổng</span><span className="text-primary">{formatCurrency(selected.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trạng thái</span>
                <StatusBadge status={selected.status} />
              </div>

              {selected.status !== "paid" && (
                <div className="flex flex-col items-center gap-2 pt-3">
                  {selected.status === "pending" ? (
                    <div className="space-y-2 w-full">
                      <div className="py-3 rounded-xl bg-blue-500/10 text-blue-500 text-sm font-medium text-center">
                        ⏳ Đã gửi xác nhận — đang chờ chủ trọ xác nhận
                      </div>
                      {selected.paymentProof && (
                        <div className="rounded-xl overflow-hidden border border-border">
                          <img src={selected.paymentProof} alt="Minh chứng" className="w-full object-cover max-h-40" />
                          <p className="text-[10px] text-center text-muted-foreground py-1">Ảnh minh chứng đã gửi</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="bg-card p-3 rounded-xl border border-border">
                        <QRCodeSVG value={selected.qrData || `PHONGTRO|${selected.roomName}|${selected.month}|${selected.total}`} size={140} />
                      </div>
                      <p className="text-xs text-muted-foreground">Quét mã để chuyển khoản</p>

                      {/* Upload minh chứng */}
                      <div className="w-full space-y-2">
                        <p className="text-xs font-semibold text-left">Ảnh minh chứng chuyển khoản</p>
                        <input ref={proofRef} type="file" accept="image/*" className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) setProofFile(URL.createObjectURL(f));
                          }} />
                        {proofFile ? (
                          <div className="relative rounded-xl overflow-hidden border border-border">
                            <img src={proofFile} alt="Minh chứng" className="w-full object-cover max-h-40" />
                            <button
                              onClick={() => setProofFile(null)}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center"
                            >✕</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => proofRef.current?.click()}
                            className="w-full py-3 rounded-xl border-2 border-dashed border-border flex items-center justify-center gap-2 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            📎 Tải ảnh chụp màn hình / biên lai
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleConfirmTransfer(selected)}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm"
                      >
                        Xác nhận đã chuyển khoản
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Ảnh minh chứng chỉ số */}
              {selected.meterPhotos && (selected.meterPhotos.electric || selected.meterPhotos.water) && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Ảnh chỉ số đồng hồ</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.meterPhotos.electric && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img src={selected.meterPhotos.electric} alt="Đồng hồ điện" className="w-full object-cover aspect-video" />
                        <p className="text-[10px] text-center text-muted-foreground py-1">⚡ Đồng hồ điện</p>
                      </div>
                    )}
                    {selected.meterPhotos.water && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img src={selected.meterPhotos.water} alt="Đồng hồ nước" className="w-full object-cover aspect-video" />
                        <p className="text-[10px] text-center text-muted-foreground py-1">💧 Đồng hồ nước</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
  );
};

export default TenantInvoices;
