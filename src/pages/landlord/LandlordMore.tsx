import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { FileText, Bell, AlertTriangle, Package, Wallet, ClipboardList, Building2, Users } from "lucide-react";

const menuItems = [
  { icon: FileText, label: "Hợp đồng", path: "/landlord/contracts", desc: "Quản lý hợp đồng thuê" },
  { icon: Users, label: "Khách thuê", path: "/landlord/tenants", desc: "Xem & quản lý khách thuê" },
  { icon: Building2, label: "Khu trọ", path: "/landlord/buildings", desc: "Quản lý khu trọ & cấu hình phí" },
  { icon: Bell, label: "Thông báo khách", path: "/landlord/notifications", desc: "Gửi thông báo cho khách" },
  { icon: AlertTriangle, label: "Sự cố", path: "/landlord/incidents", desc: "Xem & xử lý báo cáo sự cố" },
  { icon: Package, label: "Tài sản", path: "/landlord/assets", desc: "Thiết bị trong phòng" },
  { icon: Wallet, label: "Thu chi", path: "/landlord/finance", desc: "Quản lý dòng tiền" },
  { icon: ClipboardList, label: "Gói dịch vụ", path: "/landlord/subscription", desc: "Xem & đăng ký gói dịch vụ" },
];

const LandlordMore = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Tiện ích" showLogout showBuildingSelector />
      <div className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full glass-card rounded-xl p-4 flex items-center gap-4 text-left hover:shadow-lg transition"
          >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default LandlordMore;
