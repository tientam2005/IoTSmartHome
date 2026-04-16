import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useTenant } from "@/contexts/TenantContext";
import { getInvoices } from "@/data/buildingStore";
import { formatCurrency } from "@/data/mockData";
import { Zap, Droplets, Home, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const TenantUsageHistory = () => {
  const { tenant, contract } = useTenant();

  const invoices = tenant
    ? getInvoices()
        .filter(i => i.tenantId === tenant.id)
        .sort((a, b) => b.month.localeCompare(a.month))
    : [];

  // Tính trung bình
  const avgElec = invoices.length
    ? Math.round(invoices.reduce((s, i) => s + (i.electricNew - i.electricOld), 0) / invoices.length)
    : 0;
  const avgWater = invoices.length
    ? Math.round(invoices.reduce((s, i) => s + (i.waterNew - i.waterOld), 0) / invoices.length)
    : 0;

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Nhật ký sử dụng" showBack />

      <div className="p-4 space-y-4">
        {/* Tóm tắt trung bình */}
        {invoices.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-xl p-3 text-center">
              <Zap className="h-5 w-5 text-warning mx-auto mb-1" />
              <p className="text-lg font-bold">{avgElec} kWh</p>
              <p className="text-[10px] text-muted-foreground">TB điện/tháng</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Droplets className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{avgWater} m³</p>
              <p className="text-[10px] text-muted-foreground">TB nước/tháng</p>
            </div>
          </div>
        )}

        {/* Danh sách theo tháng */}
        {invoices.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
            <TrendingUp className="h-10 w-10 opacity-20" />
            <p className="text-sm">Chưa có dữ liệu sử dụng</p>
          </div>
        )}

        <div className="space-y-3">
          {invoices.map(inv => {
            const elecUsage = inv.electricNew - inv.electricOld;
            const waterUsage = inv.waterNew - inv.waterOld;
            const elecAmt = elecUsage * inv.electricPrice;
            const waterAmt = waterUsage * inv.waterPrice;

            // So sánh với tháng trước
            const idx = invoices.indexOf(inv);
            const prev = invoices[idx + 1];
            const elecDiff = prev ? elecUsage - (prev.electricNew - prev.electricOld) : null;
            const waterDiff = prev ? waterUsage - (prev.waterNew - prev.waterOld) : null;

            return (
              <div key={inv.id} className="glass-card rounded-xl p-4 space-y-3">
                {/* Header tháng */}
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm">Tháng {inv.month}</p>
                  <span className="text-xs text-muted-foreground">{inv.createdAt}</span>
                </div>

                {/* Điện */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Điện</span>
                      {elecDiff !== null && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          elecDiff > 0 ? "bg-destructive/10 text-destructive" :
                          elecDiff < 0 ? "bg-success/10 text-success" :
                          "bg-secondary text-muted-foreground"
                        )}>
                          {elecDiff > 0 ? `+${elecDiff}` : elecDiff} kWh
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(elecAmt)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-6">
                    <span>{inv.electricOld} → {inv.electricNew} kWh ({elecUsage} kWh × {formatCurrency(inv.electricPrice)})</span>
                  </div>
                  {/* Progress bar */}
                  <div className="pl-6">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all"
                        style={{ width: `${Math.min((elecUsage / Math.max(avgElec * 1.5, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Nước */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium">Nước</span>
                      {waterDiff !== null && (
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          waterDiff > 0 ? "bg-destructive/10 text-destructive" :
                          waterDiff < 0 ? "bg-success/10 text-success" :
                          "bg-secondary text-muted-foreground"
                        )}>
                          {waterDiff > 0 ? `+${waterDiff}` : waterDiff} m³
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(waterAmt)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground pl-6">
                    <span>{inv.waterOld} → {inv.waterNew} m³ ({waterUsage} m³ × {formatCurrency(inv.waterPrice)})</span>
                  </div>
                  <div className="pl-6">
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${Math.min((waterUsage / Math.max(avgWater * 1.5, 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Tiền phòng + phí khác */}
                <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1"><Home className="h-3 w-3" /> Tiền phòng</span>
                    <span>{formatCurrency(inv.roomFee)}</span>
                  </div>
                  {inv.fees.map((f, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{f.name}</span>
                      <span>{formatCurrency(f.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border">
                    <span>Tổng</span>
                    <span className="text-primary">{formatCurrency(inv.total)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default TenantUsageHistory;
