import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { getAssetsByRoom } from "@/data/assetStore";
import { useTenant } from "@/contexts/TenantContext";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

const conditionLabel = { good: "Tốt", worn: "Cũ", broken: "Hỏng" };
const conditionColor = {
  good: "text-success bg-success/10",
  worn: "text-warning bg-warning/10",
  broken: "text-destructive bg-destructive/10",
};

const TenantAssets = () => {
  const { room } = useTenant();
  const assets = room ? getAssetsByRoom(room.id) : [];

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Tài sản phòng" showBack />
      <div className="p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Danh sách tài sản trong {room?.name ?? "phòng của bạn"} do chủ trọ bàn giao
        </p>

        {assets.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm">Chưa có tài sản nào được ghi nhận</p>
          </div>
        )}

        {assets.map(a => (
          <div key={a.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{a.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Số lượng: {a.quantity}{a.note ? ` • ${a.note}` : ""}
              </p>
            </div>
            <span className={cn("text-xs px-2 py-1 rounded-full font-medium", conditionColor[a.condition])}>
              {conditionLabel[a.condition]}
            </span>
          </div>
        ))}

        {assets.length > 0 && (
          <p className="text-[11px] text-muted-foreground text-center pt-2">
            Nếu có tài sản hỏng hóc, vui lòng báo cáo qua mục Sự cố
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default TenantAssets;
