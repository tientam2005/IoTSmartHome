import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Shield, Building2, User, Plus, Pencil, Trash2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Permission { id: string; label: string; }
interface Role { id: string; name: string; icon: React.ElementType; color: string; permissions: string[]; users: number; editable: boolean; }

const ALL_PERMISSIONS: Permission[] = [
  { id: "manage_rooms",     label: "Quản lý phòng trọ" },
  { id: "manage_tenants",   label: "Quản lý khách thuê" },
  { id: "manage_contracts", label: "Quản lý hợp đồng" },
  { id: "manage_invoices",  label: "Tạo & quản lý hóa đơn" },
  { id: "manage_incidents", label: "Xử lý sự cố" },
  { id: "manage_finance",   label: "Thu chi tài chính" },
  { id: "manage_assets",    label: "Quản lý tài sản" },
  { id: "send_notifs",      label: "Gửi thông báo" },
  { id: "view_invoices",    label: "Xem hóa đơn" },
  { id: "report_incident",  label: "Báo cáo sự cố" },
  { id: "view_notifs",      label: "Xem thông báo" },
  { id: "update_profile",   label: "Cập nhật hồ sơ cá nhân" },
  { id: "manage_users",     label: "Quản lý người dùng" },
  { id: "manage_packages",  label: "Quản lý gói dịch vụ" },
  { id: "view_stats",       label: "Xem thống kê toàn cục" },
];

const initRoles: Role[] = [
  {
    id: "admin", name: "Admin", icon: Shield, color: "bg-destructive/10 text-destructive", editable: false, users: 2,
    permissions: ["manage_users", "manage_packages", "view_stats"],
  },
  {
    id: "landlord", name: "Chủ trọ", icon: Building2, color: "bg-primary/10 text-primary", editable: true, users: 12,
    permissions: ["manage_rooms", "manage_tenants", "manage_contracts", "manage_invoices", "manage_incidents", "manage_finance", "manage_assets", "send_notifs"],
  },
  {
    id: "tenant", name: "Người thuê", icon: User, color: "bg-success/10 text-success", editable: true, users: 156,
    permissions: ["view_invoices", "report_incident", "view_notifs", "update_profile"],
  },
];

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>(initRoles);
  const [editing, setEditing] = useState<Role | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const openEdit = (role: Role) => {
    setEditing(role);
    setEditPerms([...role.permissions]);
  };

  const togglePerm = (id: string) => {
    setEditPerms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const saveEdit = () => {
    if (!editing) return;
    setRoles(prev => prev.map(r => r.id === editing.id ? { ...r, permissions: editPerms } : r));
    toast.success(`Đã cập nhật quyền cho vai trò "${editing.name}"`);
    setEditing(null);
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
    toast.success("Đã xóa vai trò");
  };

  const addRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: newRoleName.trim(),
      icon: Shield,
      color: "bg-accent/10 text-accent-foreground",
      editable: true,
      users: 0,
      permissions: [],
    };
    setRoles(prev => [...prev, newRole]);
    toast.success(`Đã thêm vai trò "${newRoleName}"`);
    setNewRoleName("");
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Phân quyền" rightAction={
        <button onClick={() => setShowAdd(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-3">
        {roles.map(role => (
          <div key={role.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${role.color}`}>
                  <role.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{role.users} người dùng</p>
                </div>
              </div>
              {role.editable && (
                <div className="flex gap-1">
                  <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteRole(role.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map(pid => {
                const perm = ALL_PERMISSIONS.find(p => p.id === pid);
                return perm ? (
                  <span key={pid} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {perm.label}
                  </span>
                ) : null;
              })}
              {role.permissions.length === 0 && (
                <span className="text-xs text-muted-foreground italic">Chưa có quyền nào</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit permissions */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chỉnh sửa quyền — {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map(perm => (
              <label key={perm.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 cursor-pointer">
                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition ${
                  editPerms.includes(perm.id) ? "bg-primary border-primary" : "border-border"
                }`} onClick={() => togglePerm(perm.id)}>
                  {editPerms.includes(perm.id) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-sm">{perm.label}</span>
              </label>
            ))}
          </div>
          <button onClick={saveEdit} className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
            Lưu thay đổi
          </button>
        </DialogContent>
      </Dialog>

      {/* Add role */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Thêm vai trò mới</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={addRole}>
            <input
              placeholder="Tên vai trò *"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <p className="text-xs text-muted-foreground">Sau khi tạo, bạn có thể chỉnh sửa quyền cho vai trò này.</p>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Thêm vai trò</button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default AdminRoles;
