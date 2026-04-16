import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getPackages, getMySubscription, upsertSubscription } from "@/data/packageStore";
import { formatCurrency, type ServicePackage } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Star, Crown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [packages] = useState(() => getPackages());
  const [mySub, setMySub] = useState(() => getMySubscription(user?.id ?? "l1"));
  const [selected, setSelected] = useState<ServicePackage | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const currentPkg = packages.find(p => p.id === mySub?.packageId);

  const handleRegister = (pkg: ServicePackage) => {
    setSelected(pkg);
    setShowConfirm(true);
  };

  const confirmRegister = () => {
    if (!selected || !user) return;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    upsertSubscription({
      landlordId: user.id,
      landlordName: user.name,
      email: user.email,
      packageId: selected.id,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      status: "pending",
      rooms: 0,
    });
    setMySub(getMySubscription(user.id));
    toast.success(`Đã đăng ký ${selected.name}. Chờ admin xác nhận.`);
    setShowConfirm(false);
  };

  const isCurrentPkg = (pkgId: string) => mySub?.packageId === pkgId;
  const isActive = mySub?.status === "active";

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Gói dịch vụ" showBack />

      <div className="p-4 space-y-4">
        {/* Gói hiện tại */}
        {mySub && currentPkg && (
          <div className="glass-card rounded-2xl p-4 border-l-4 border-l-primary">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-primary">Gói đang dùng</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{currentPkg.name}</p>
                <p className="text-xs text-muted-foreground">Tối đa {currentPkg.maxRooms} phòng</p>
              </div>
              <div className="text-right">
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                  mySub.status === "active" ? "bg-success/10 text-success" :
                  mySub.status === "expired" ? "bg-destructive/10 text-destructive" :
                  "bg-warning/10 text-warning"
                )}>
                  {mySub.status === "active" ? "Đang hoạt động" : mySub.status === "expired" ? "Hết hạn" : "Chờ xác nhận"}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Hết hạn: {mySub.endDate}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm font-semibold text-muted-foreground">Chọn gói phù hợp</p>

        {/* Danh sách gói */}
        {packages.map((pkg) => {
          const isCurrent = isCurrentPkg(pkg.id);
          return (
            <div key={pkg.id} className={cn(
              "glass-card rounded-2xl p-5 relative",
              pkg.isPopular && "border-2 border-primary shadow-xl",
              isCurrent && "ring-2 ring-success"
            )}>
              {pkg.isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                  <Star className="h-3 w-3" /> Phổ biến
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-success text-white text-xs font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Đang dùng
                </div>
              )}
              <h3 className="font-bold text-base">{pkg.name}</h3>
              <p className="text-2xl font-bold text-primary mt-1">
                {formatCurrency(pkg.price)}<span className="text-sm text-muted-foreground font-normal">/tháng</span>
              </p>
              <p className="text-xs text-muted-foreground mb-3">Tối đa {pkg.maxRooms} phòng</p>
              <ul className="space-y-1.5 mb-4">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => !isCurrent && handleRegister(pkg)}
                disabled={isCurrent && isActive}
                className={cn(
                  "w-full py-2.5 rounded-xl font-medium text-sm transition",
                  isCurrent && isActive
                    ? "bg-success/10 text-success cursor-default"
                    : pkg.isPopular
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {isCurrent && isActive ? "Gói hiện tại" : isCurrent ? "Gia hạn" : "Đăng ký"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Xác nhận đăng ký</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="glass-card rounded-xl p-4 space-y-2">
                <p className="font-bold">{selected.name}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(selected.price)}<span className="text-sm text-muted-foreground font-normal">/tháng</span></p>
                <p className="text-xs text-muted-foreground">Tối đa {selected.maxRooms} phòng</p>
              </div>
              <p className="text-xs text-muted-foreground">Sau khi đăng ký, admin sẽ xác nhận và kích hoạt gói cho bạn.</p>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Hủy</button>
                <button onClick={confirmRegister} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Xác nhận</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default SubscriptionPage;
