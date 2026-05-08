import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { type ServicePackage } from "@/data/mockData";
import { getPackages, addPackage, updatePackage, deletePackage, getSubscriptions, upsertSubscription } from "@/data/packageStore";
import { formatCurrency } from "@/data/mockData";
import { Check, Star, Plus, Pencil, Trash2, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const emptyForm = { name: "", price: "", maxRooms: "", features: "", isPopular: false };

const AdminPackages = () => {
  const [packages, setPackages] = useState<ServicePackage[]>(() => getPackages());
  const [subscriptions, setSubscriptions] = useState(() => getSubscriptions());
  const [tab, setTab] = useState<"packages" | "subscribers">("packages");

  const [showForm, setShowForm] = useState(false);
  const [editPkg, setEditPkg] = useState<ServicePackage | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [showAssign, setShowAssign] = useState(false);
  const [assignSub, setAssignSub] = useState<typeof subscriptions[0] | null>(null);
  const [assignPackageId, setAssignPackageId] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");

  const refreshPkgs = () => setPackages([...getPackages()]);
  const refreshSubs = () => setSubscriptions([...getSubscriptions()]);

  const openAdd = () => {
    setEditPkg(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pkg: ServicePackage) => {
    setEditPkg(pkg);
    setForm({
      name: pkg.name,
      price: String(pkg.price),
      maxRooms: String(pkg.maxRooms),
      features: pkg.features.join("\n"),
      isPopular: pkg.isPopular ?? false,
    });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.maxRooms) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    const data: ServicePackage = {
      id: editPkg?.id ?? `sp${Date.now()}`,
      name: form.name,
      price: Number(form.price),
      maxRooms: Number(form.maxRooms),
      features: form.features.split("\n").map(f => f.trim()).filter(Boolean),
      isPopular: form.isPopular,
    };
    if (editPkg) {
      updatePackage(editPkg.id, data);
      toast.success("Đã cập nhật gói");
    } else {
      addPackage(data);
      toast.success("Đã thêm gói mới");
    }
    refreshPkgs();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deletePackage(id);
    refreshPkgs();
    toast.success("Đã xóa gói");
  };

  const openAssign = (sub: typeof subscriptions[0]) => {
    setAssignSub(sub);
    setAssignPackageId(sub.packageId);
    setAssignEndDate(sub.endDate);
    setShowAssign(true);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSub || !assignPackageId || !assignEndDate) return;
    upsertSubscription({
      ...assignSub,
      packageId: assignPackageId,
      endDate: assignEndDate,
      status: "active",
      startDate: new Date().toISOString().slice(0, 10),
    });
    refreshSubs();
    toast.success(`Đã cập nhật gói cho ${assignSub.landlordName}`);
    setShowAssign(false);
  };

  const getPkgName = (id: string) => packages.find(p => p.id === id)?.name ?? "—";

  const statusColor = (s: string) =>
    s === "active" ? "text-success bg-success/10" :
    s === "expired" ? "text-destructive bg-destructive/10" :
    "text-warning bg-warning/10";

  const statusLabel = (s: string) =>
    s === "active" ? "Đang dùng" : s === "expired" ? "Hết hạn" : "Chờ duyệt";

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Gói dịch vụ" showLogout rightAction={
        tab === "packages" ? (
          <button onClick={openAdd} className="p-2 rounded-full hover:bg-primary-foreground/10">
            <Plus className="h-5 w-5" />
          </button>
        ) : undefined
      } />

      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-2">
          <button onClick={() => setTab("packages")} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition", tab === "packages" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
            Danh sách gói
          </button>
          <button onClick={() => setTab("subscribers")} className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition", tab === "subscribers" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
            Chủ trọ đăng ký
          </button>
        </div>

        {/* Packages list */}
        {tab === "packages" && (
          <div className="space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className={cn("glass-card rounded-2xl p-5 relative", pkg.isPopular && "border-2 border-primary shadow-xl")}>
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" /> Phổ biến
                  </div>
                )}
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-base">{pkg.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(pkg)} className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(pkg.price)}<span className="text-sm text-muted-foreground font-normal">/tháng</span></p>
                <p className="text-xs text-muted-foreground mb-3">Tối đa {pkg.maxRooms} phòng</p>
                <ul className="space-y-1.5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {subscriptions.filter(s => s.packageId === pkg.id && s.status === "active").length} chủ trọ đang dùng
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribers list */}
        {tab === "subscribers" && (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div key={sub.landlordId} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm">{sub.landlordName}</p>
                    <p className="text-xs text-muted-foreground">{sub.email}</p>
                  </div>
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", statusColor(sub.status))}>
                    {statusLabel(sub.status)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-3">
                  <span>Gói: <span className="font-medium text-foreground">{getPkgName(sub.packageId)}</span></span>
                  <span>Hết hạn: {sub.endDate}</span>
                </div>
                <button onClick={() => openAssign(sub)} className="w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                  Đổi gói / Gia hạn
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit package */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editPkg ? "Sửa gói" : "Thêm gói mới"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSave}>
            <input placeholder="Tên gói *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Giá/tháng *</label>
                <input type="number" placeholder="VD: 399000" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Số phòng tối đa *</label>
                <input type="number" placeholder="VD: 30" value={form.maxRooms} onChange={e => setForm(p => ({ ...p, maxRooms: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Tính năng (mỗi dòng 1 tính năng)</label>
              <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} rows={4} placeholder={"Quản lý tối đa 30 phòng\nHóa đơn & hợp đồng\n3 tài khoản quản lý"} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={e => setForm(p => ({ ...p, isPopular: e.target.checked }))} className="rounded" />
              Đánh dấu là gói phổ biến
            </label>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
              {editPkg ? "Lưu thay đổi" : "Thêm gói"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign package */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Đổi gói — {assignSub?.landlordName}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleAssign}>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gói dịch vụ</label>
              <select value={assignPackageId} onChange={e => setAssignPackageId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">-- Chọn gói --</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.price)}/tháng (tối đa {p.maxRooms} phòng)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ngày hết hạn</label>
              <input type="date" value={assignEndDate} onChange={e => setAssignEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            {assignPackageId && (
              <div className="glass-card rounded-xl p-3 text-xs space-y-1">
                {(() => {
                  const pkg = packages.find(p => p.id === assignPackageId);
                  return pkg ? (
                    <>
                      <p className="font-semibold">{pkg.name}</p>
                      <p className="text-muted-foreground">Tối đa {pkg.maxRooms} phòng • {formatCurrency(pkg.price)}/tháng</p>
                      {pkg.features.map((f, i) => <p key={i} className="text-muted-foreground">• {f}</p>)}
                    </>
                  ) : null;
                })()}
              </div>
            )}
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Xác nhận</button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default AdminPackages;
