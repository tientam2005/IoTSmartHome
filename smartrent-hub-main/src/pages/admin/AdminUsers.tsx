import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Search, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface User { id: string; name: string; email: string; role: string; status: "active" | "suspended"; rooms: number; }

const initUsers: User[] = [
  { id: "1", name: "Nguyễn Văn An",    email: "an@demo.com",   role: "landlord", status: "active",    rooms: 8 },
  { id: "2", name: "Trần Thị Bình",    email: "binh@demo.com", role: "tenant",   status: "active",    rooms: 0 },
  { id: "3", name: "Lê Văn Cường",     email: "cuong@demo.com",role: "tenant",   status: "active",    rooms: 0 },
  { id: "4", name: "Nguyễn Thanh Hùng",email: "hung@demo.com", role: "landlord", status: "active",    rooms: 15 },
  { id: "5", name: "Phạm Quốc Bảo",   email: "bao@demo.com",  role: "landlord", status: "suspended", rooms: 5 },
];

const roleLabels: Record<string, string> = { landlord: "Chủ trọ", tenant: "Người thuê", admin: "Admin" };
const roleOptions = ["landlord", "tenant", "admin"];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(initUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selected, setSelected] = useState<User | null>(null);

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.includes(search)) return false;
    return true;
  });

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
    const u = users.find(x => x.id === id);
    toast.success(u?.status === "active" ? "Đã tạm khóa tài khoản" : "Đã kích hoạt tài khoản");
    setSelected(prev => prev ? { ...prev, status: prev.status === "active" ? "suspended" : "active" } : null);
  };

  const changeRole = (id: string, role: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    setSelected(prev => prev ? { ...prev, role } : null);
    toast.success(`Đã đổi vai trò thành "${roleLabels[role]}"`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSelected(null);
    toast.success("Đã xóa người dùng");
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Người dùng" />
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên hoặc email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="flex gap-2">
          {["all", "landlord", "tenant"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium", roleFilter === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
              {r === "all" ? "Tất cả" : roleLabels[r]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(u => (
            <button key={u.id} onClick={() => setSelected(u)} className="w-full glass-card rounded-xl p-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">{u.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[u.role]} • {u.email}</p>
                </div>
              </div>
              <span className={cn("status-badge shrink-0", u.status === "active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                {u.status === "active" ? "Active" : "Suspended"}
              </span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Không tìm thấy người dùng</p>}
        </div>
      </div>

      {/* User detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selected.email}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <span className={cn("status-badge", selected.status === "active" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
                    {selected.status === "active" ? "Active" : "Suspended"}
                  </span>
                </div>
                {selected.rooms > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Số phòng</span><span>{selected.rooms}</span></div>}
              </div>

              {/* Đổi vai trò */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Vai trò</label>
                <div className="relative">
                  <select
                    value={selected.role}
                    onChange={e => changeRole(selected.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none appearance-none"
                  >
                    {roleOptions.map(r => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(selected.id)}
                  className={cn("flex-1 py-2 rounded-lg text-sm font-medium", selected.status === "active" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}
                >
                  {selected.status === "active" ? "Tạm khóa" : "Kích hoạt"}
                </button>
                <button onClick={() => deleteUser(selected.id)} className="flex-1 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                  Xóa
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default AdminUsers;
