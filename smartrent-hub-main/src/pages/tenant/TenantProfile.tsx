import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useNavigate } from "react-router-dom";
import { Camera, Package, FileText, ChevronRight, Pencil, MapPin, Phone, Mail, CreditCard, Home, Building2, ScanLine, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateTenant } from "@/data/buildingStore";
import { formatCurrency } from "@/data/mockData";
import { toast } from "sonner";
import CccdScanner from "@/components/CccdScanner";

const TenantProfile = () => {
  const { user } = useAuth();
  const { tenant, contract, room, building, refreshTenant } = useTenant();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [showContract, setShowContract] = useState(false);
  const [showCccd, setShowCccd] = useState(false);
  // Ảnh CCCD: ưu tiên local state (vừa chụp), fallback về store
  const [cccdFrontLocal, setCccdFrontLocal] = useState<string | null>(null);
  const [cccdBackLocal, setCccdBackLocal] = useState<string | null>(null);
  const cccdFront = cccdFrontLocal ?? tenant?.cccdFront ?? null;
  const cccdBack = cccdBackLocal ?? tenant?.cccdBack ?? null;
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  // Local state để hiển thị ngay sau khi cập nhật (không cần re-mount context)
  const [localInfo, setLocalInfo] = useState({
    phone: tenant?.phone ?? user?.phone ?? "",
    email: tenant?.email ?? user?.email ?? "",
    hometown: tenant?.hometown ?? "",
    cccd: tenant?.cccd ?? "",
  });
  const [editForm, setEditForm] = useState({ ...localInfo });

  const handleFile = (side: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setCccdFrontLocal(url);
      if (tenant) updateTenant(tenant.id, { cccdFront: url });
    } else {
      setCccdBackLocal(url);
      if (tenant) updateTenant(tenant.id, { cccdBack: url });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenant) {
      updateTenant(tenant.id, editForm);
      setLocalInfo(prev => ({ ...prev, ...editForm }));
      toast.success("Đã cập nhật thông tin");
    }
    setShowEdit(false);
  };

  // Sync editForm khi mở dialog
  const openEdit = () => {
    setEditForm({ ...localInfo });
    setShowEdit(true);
  };

  const name = tenant?.name ?? user?.name ?? "?";

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Cá nhân" />

      <div className="p-4 space-y-3">
        {/* Profile hero card */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base">{name}</p>
            {room && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Home className="h-3 w-3" />
                <span>{room.name} • Tầng {room.floor} • {room.area}m²</span>
              </div>
            )}
            {building && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Building2 className="h-3 w-3" />
                <span>{building.name}</span>
              </div>
            )}
          </div>
          <button onClick={openEdit} className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        {/* Info grid */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {[
            { icon: Phone, label: "SĐT", value: localInfo.phone },
            { icon: Mail, label: "Email", value: localInfo.email },
            { icon: MapPin, label: "Quê quán", value: localInfo.hometown },
            { icon: CreditCard, label: "CCCD", value: localInfo.cccd },
          ].filter(f => f.value).map((f, i, arr) => (
            <div key={f.label} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <f.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">{f.label}</p>
                <p className="text-sm font-medium">{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CCCD upload section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm">Giấy tờ tùy thân</p>
            <button
              onClick={() => setShowCccd(true)}
              className="flex items-center gap-1 text-xs text-primary font-medium"
            >
              <ScanLine className="h-3.5 w-3.5" /> Quét tự động
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Mặt trước */}
            <button
              onClick={() => frontRef.current?.click()}
              className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition overflow-hidden bg-secondary/30"
            >
              {cccdFront ? (
                <img src={cccdFront} alt="Mặt trước" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Mặt trước</p>
                </div>
              )}
              {cccdFront && (
                <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 text-center">
                  <p className="text-[10px] text-white font-medium">Mặt trước ✓</p>
                </div>
              )}
            </button>
            <input ref={frontRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile("front")} />

            {/* Mặt sau */}
            <button
              onClick={() => backRef.current?.click()}
              className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition overflow-hidden bg-secondary/30"
            >
              {cccdBack ? (
                <img src={cccdBack} alt="Mặt sau" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Mặt sau</p>
                </div>
              )}
              {cccdBack && (
                <div className="absolute bottom-0 inset-x-0 bg-black/40 py-1 text-center">
                  <p className="text-[10px] text-white font-medium">Mặt sau ✓</p>
                </div>
              )}
            </button>
            <input ref={backRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile("back")} />
          </div>
          {(cccdFront || cccdBack) && (
            <p className="text-[10px] text-muted-foreground text-center">Nhấn vào ảnh để chụp lại</p>
          )}
        </div>

        {/* Actions */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <button onClick={() => navigate("/tenant/assets")} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-secondary/40 transition text-left">
            <div className="p-1.5 rounded-lg bg-warning/10"><Package className="h-4 w-4 text-warning" /></div>
            <span className="text-sm font-medium flex-1">Tài sản phòng</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <button onClick={() => navigate("/tenant/usage")} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-secondary/40 transition text-left">
            <div className="p-1.5 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
            <div className="flex-1">
              <span className="text-sm font-medium block">Nhật ký điện nước</span>
              <span className="text-xs text-muted-foreground">Lịch sử sử dụng theo tháng</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          {contract && (
            <button onClick={() => setShowContract(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/40 transition text-left">
              <div className="p-1.5 rounded-lg bg-success/10"><FileText className="h-4 w-4 text-success" /></div>
              <span className="text-sm font-medium flex-1">Xem hợp đồng</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Chỉnh sửa thông tin</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSave}>
            <input placeholder="Số điện thoại" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Quê quán" value={editForm.hometown} onChange={e => setEditForm(p => ({ ...p, hometown: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Lưu thay đổi</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contract dialog */}
      <Dialog open={showContract} onOpenChange={setShowContract}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Hợp đồng thuê phòng</DialogTitle></DialogHeader>
          {contract && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span className="font-medium">{contract.roomName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Khu trọ</span><span>{building?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thời hạn</span><span>{contract.startDate} → {contract.endDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền thuê</span><span className="font-bold text-primary">{formatCurrency(contract.monthlyRent)}/tháng</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền cọc</span><span>{formatCurrency(contract.deposit)}</span></div>
              <hr className="border-border" />
              <p className="text-xs font-semibold">Phí dịch vụ:</p>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Điện</span><span>{formatCurrency(contract.feeConfig.electricPrice)}/kWh</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Nước</span><span>{formatCurrency(contract.feeConfig.waterPrice)}/m³</span></div>
              {contract.feeConfig.garbageFee && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Rác</span><span>{formatCurrency(contract.feeConfig.garbageFee)}/tháng</span></div>}
              {contract.feeConfig.wifiFee && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Wi-Fi</span><span>{formatCurrency(contract.feeConfig.wifiFee)}/tháng</span></div>}
              {contract.feeConfig.parkingFee && <div className="flex justify-between text-xs"><span className="text-muted-foreground">Giữ xe</span><span>{formatCurrency(contract.feeConfig.parkingFee)}/tháng</span></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />

      <CccdScanner
        open={showCccd}
        onClose={() => setShowCccd(false)}
        onResult={result => {
          if (tenant) {
            updateTenant(tenant.id, {
              cccd: result.cccd,
              ...(result.hometown && { hometown: result.hometown }),
            });
          }
          setLocalInfo(prev => ({
            ...prev,
            cccd: result.cccd,
            ...(result.hometown && { hometown: result.hometown }),
          }));
          setEditForm(prev => ({
            ...prev,
            cccd: result.cccd,
            ...(result.hometown && { hometown: result.hometown }),
          }));
        }}
      />
    </div>
  );
};

export default TenantProfile;
