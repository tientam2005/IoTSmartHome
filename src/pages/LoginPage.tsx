import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Building2, User, Shield, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

const roles: { value: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "landlord", label: "Chủ trọ", desc: "Quản lý phòng, khách thuê, hóa đơn", icon: Building2 },
  { value: "tenant", label: "Người thuê", desc: "Xem hóa đơn, báo sự cố", icon: User },
  { value: "admin", label: "Admin", desc: "Quản trị hệ thống", icon: Shield },
];

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("landlord");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, selectedRole);
    navigate(`/${selectedRole}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4 shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Quản Lý Phòng Trọ</h1>
          <p className="text-muted-foreground text-sm mt-1">Thông minh • Tiện lợi • Minh bạch</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all",
                selectedRole === role.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              )}
            >
              <role.icon className="h-5 w-5" />
              <span className="text-xs font-semibold">{role.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@example.com"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:opacity-90 transition"
          >
            <LogIn className="h-5 w-5" />
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo mode — chọn vai trò và bấm đăng nhập
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
