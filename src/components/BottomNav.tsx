import { useLocation, useNavigate } from "react-router-dom";
import { Home, DoorOpen, FileText, Receipt, MoreHorizontal, LayoutDashboard, Users, Package, Shield, AlertTriangle, Bell, User } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getInvoices } from "@/data/buildingStore";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: Record<UserRole, NavItem[]> = {
  landlord: [
    { icon: Home,           label: "Tổng quan",  path: "/landlord" },
    { icon: DoorOpen,       label: "Phòng",       path: "/landlord/rooms" },
    { icon: Users,          label: "Khách thuê",  path: "/landlord/tenants" },
    { icon: Receipt,        label: "Hoá đơn",     path: "/landlord/invoices" },
    { icon: MoreHorizontal, label: "Thêm",        path: "/landlord/more" },
  ],
  tenant: [
    { icon: Home,          label: "Trang chủ",  path: "/tenant" },
    { icon: Receipt,       label: "Hóa đơn",    path: "/tenant/invoices" },
    { icon: AlertTriangle, label: "Sự cố",      path: "/tenant/incidents" },
    { icon: Bell,          label: "Thông báo",  path: "/tenant/notifications" },
    { icon: User,          label: "Cá nhân",    path: "/tenant/profile" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Dashboard",    path: "/admin" },
    { icon: Users,           label: "Người dùng",  path: "/admin/users" },
    { icon: Package,         label: "Gói dịch vụ", path: "/admin/packages" },
    { icon: Shield,          label: "Phân quyền",  path: "/admin/roles" },
  ],
};

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = navItems[user.role];

  // Badge counts cho landlord — chỉ hiện khi thực sự có việc cần làm
  const pendingInvoices = user.role === "landlord"
    ? getInvoices().filter(i => i.status === "pending").length
    : 0;

  const badges: Record<string, number> = {
    "/landlord/invoices": pendingInvoices,
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/${user.role}` && location.pathname.startsWith(item.path));
          const badge = badges[item.path] ?? 0;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 px-3 min-w-[3.5rem] transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5 transition-all", isActive && "stroke-[2.5]")} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium transition-all", isActive && "font-semibold")}>{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
