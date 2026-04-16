import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency } from "@/data/mockData";
import { getInvoices, getNotifications } from "@/data/buildingStore";
import { getIncidents } from "@/data/incidentStore";
import { getMembersByRoom } from "@/data/roomMemberStore";
import { useTenant } from "@/contexts/TenantContext";
import { Receipt, AlertTriangle, Bell, ChevronRight, FileText, Home, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { tenant, room, building, contract } = useTenant();

  const myInvoices = tenant ? getInvoices().filter(i => i.tenantId === tenant.id) : [];
  const unpaidInvoices = myInvoices.filter(i => i.status === "unpaid" || i.status === "overdue" || i.status === "pending");
  const latestInvoice = myInvoices[0] ?? null;
  // Badge hoá đơn: chỉ khi có hoá đơn mới chủ tạo mà khách chưa xem
  const unreadInvoices = myInvoices.filter(i => !i.isReadByTenant);

  const openIncidents = tenant
    ? getIncidents().filter(i => i.tenantName === tenant.name && i.status !== "resolved")
    : [];

  // Badge: chỉ đếm sự cố có cập nhật mới từ chủ mà khách chưa xem
  const unreadIncidents = tenant
    ? getIncidents().filter(i => i.tenantName === tenant.name && !i.isReadByTenant)
    : [];

  const unreadNotifs = getNotifications().filter(n =>
    !n.isRead && (n.target === "all" || n.target === room?.id)
  ).length;

  const daysLeft = contract
    ? Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const members = room ? getMembersByRoom(room.id) : [];

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Trang chủ" showLogout />

      <div className="p-4 space-y-4">

        {/* Hero — thông tin phòng */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-28 h-28 rounded-full bg-white/5 -translate-y-6 translate-x-6" />
          <p className="text-sm opacity-75">Xin chào,</p>
          <p className="text-xl font-bold mt-0.5">{tenant?.name ?? "Khách thuê"} 👋</p>
          {room && (
            <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80">
              <Home className="h-3.5 w-3.5 shrink-0" />
              <span>{room.name} • {room.area}m² • Tầng {room.floor}</span>
            </div>
          )}
          {building && <p className="text-[11px] opacity-60 mt-0.5">{building.name}</p>}

          {/* Hợp đồng inline */}
          {contract && daysLeft !== null && (
            <div className={cn(
              "mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium",
              daysLeft < 0 ? "bg-destructive/30 text-white" :
              daysLeft <= 30 ? "bg-warning/30 text-white" :
              "bg-white/15 text-white"
            )}>
              <FileText className="h-3 w-3" />
              {daysLeft < 0 ? "Hợp đồng đã hết hạn" :
               daysLeft === 0 ? "Hết hạn hôm nay" :
               `Hợp đồng còn ${daysLeft} ngày`}
            </div>
          )}
        </div>

        {/* 4 nút hành động chính */}
        <div className="grid grid-cols-4 gap-2">
          <button onClick={() => navigate("/tenant/invoices")} className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 relative">
            {unreadInvoices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-warning text-white text-[9px] font-bold flex items-center justify-center">{unreadInvoices.length}</span>
            )}
            <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-warning" />
            </div>
            <p className="text-[10px] font-semibold text-center">Hoá đơn</p>
          </button>

          <button onClick={() => navigate("/tenant/incidents")} className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 relative">
            {unreadIncidents.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">{unreadIncidents.length}</span>
            )}
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-[10px] font-semibold text-center">Sự cố</p>
          </button>

          <button onClick={() => navigate("/tenant/notifications")} className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 relative">
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">{unreadNotifs}</span>
            )}
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[10px] font-semibold text-center">Thông báo</p>
          </button>

          <button onClick={() => navigate("/tenant/members")} className="glass-card rounded-2xl p-3 flex flex-col items-center gap-1.5 relative">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-success" />
            </div>
            <p className="text-[10px] font-semibold text-center">Thành viên</p>
          </button>
        </div>

        {/* Hoá đơn cần thanh toán */}
        {unpaidInvoices.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm">Cần thanh toán</p>
              <button onClick={() => navigate("/tenant/invoices")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {unpaidInvoices.slice(0, 2).map(inv => (
                <button key={inv.id} onClick={() => navigate("/tenant/invoices")} className="w-full glass-card rounded-xl p-4 text-left flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">Tháng {inv.month}</p>
                    <p className="text-xs text-muted-foreground">{inv.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">{formatCurrency(inv.total)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Hoá đơn gần nhất nếu không có unpaid */}
        {unpaidInvoices.length === 0 && latestInvoice && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm">Hoá đơn gần nhất</p>
              <button onClick={() => navigate("/tenant/invoices")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <button onClick={() => navigate("/tenant/invoices")} className="w-full glass-card rounded-xl p-4 text-left flex justify-between items-center">
              <div>
                <p className="font-semibold text-sm">Tháng {latestInvoice.month}</p>
                <p className="text-xs text-muted-foreground">{latestInvoice.createdAt}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-primary">{formatCurrency(latestInvoice.total)}</p>
                <StatusBadge status={latestInvoice.status} />
              </div>
            </button>
          </section>
        )}

        {/* Sự cố đang xử lý */}
        {openIncidents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm">Sự cố đang xử lý</p>
              <button onClick={() => navigate("/tenant/incidents")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {openIncidents.slice(0, 2).map(inc => (
                <div key={inc.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">{inc.category} • {inc.createdAt}</p>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Báo sự cố nhanh */}
        <button
          onClick={() => navigate("/tenant/incidents")}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" /> Báo sự cố mới
        </button>

      </div>
      <BottomNav />
    </div>
  );
};

export default TenantDashboard;
