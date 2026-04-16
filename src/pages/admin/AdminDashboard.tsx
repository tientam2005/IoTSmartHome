import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import { Users, Building2, Package, TrendingUp } from "lucide-react";

const AdminDashboard = () => (
  <div className="min-h-screen bg-background bottom-nav-safe">
    <PageHeader title="Admin Dashboard" showLogout />
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Chủ trọ" value={12} subtitle="đang hoạt động" />
        <StatCard icon={<Users className="h-5 w-5" />} label="Người thuê" value={156} subtitle="tổng cộng" variant="success" />
        <StatCard icon={<Package className="h-5 w-5" />} label="Gói dịch vụ" value={3} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Doanh thu" value="15.8M" subtitle="tháng này" variant="success" />
      </div>

      <section>
        <h2 className="font-bold mb-3">Chủ trọ mới đăng ký</h2>
        {["Nguyễn Thanh Hùng", "Lê Thị Mai", "Phạm Quốc Bảo"].map((name, i) => (
          <div key={i} className="glass-card rounded-xl p-3 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{name.charAt(0)}</div>
              <div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-muted-foreground">{10 + i} phòng • Gói {i === 2 ? "Cao Cấp" : "Tiêu Chuẩn"}</p>
              </div>
            </div>
            <span className="status-badge bg-success/15 text-success">Active</span>
          </div>
        ))}
      </section>
    </div>
    <BottomNav />
  </div>
);

export default AdminDashboard;
