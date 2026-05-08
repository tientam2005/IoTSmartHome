import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { type Tenant } from "@/data/mockData";
import { getTenants, updateTenant, deleteTenant, getBuildings, getContracts } from "@/data/buildingStore";
import { getMembersByRoom } from "@/data/roomMemberStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { Search, Phone, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const TenantManagement = () => {
  const [list, setList] = useState<Tenant[]>(() => getTenants());
  const refresh = () => setList([...getTenants()]);
  const [search, setSearch] = useState("");
  const { selectedBuildingId } = useBuilding();
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", cccd: "", phone: "", hometown: "", email: "" });

  const buildings = getBuildings();

  const filtered = list.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search);
    const matchBuilding = selectedBuildingId === "all" || t.buildingId === selectedBuildingId;
    return matchSearch && matchBuilding;
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    updateTenant(selected.id, form);
    refresh();
    setSelected(prev => prev ? { ...prev, ...form } : null);
    toast.success("Đã cập nhật thông tin");
    setEditMode(false);
  };

  const handleDelete = (id: string) => {
    const hasActive = getContracts().some(c => c.tenantId === id && c.status === "active");
    if (hasActive) {
      toast.error("Không thể xóa khách đang có hợp đồng active. Vui lòng thanh lý hợp đồng trước.");
      return;
    }
    deleteTenant(id);
    refresh();
    setSelected(null);
    toast.success("Đã xóa khách thuê");
  };

  const openEdit = (t: Tenant) => {
    setForm({ name: t.name, cccd: t.cccd, phone: t.phone, hometown: t.hometown, email: t.email || "" });
    setEditMode(true);
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Khách thuê" showLogout showBuildingSelector />

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc SĐT..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="space-y-2">
          {filtered.map(t => (
            <button key={t.id} onClick={() => { setSelected(t); setEditMode(false); }} className="w-full glass-card rounded-xl p-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{t.phone}</span>
                    {t.roomName && <span className="text-xs text-primary font-medium">{t.roomName}</span>}
                    {t.buildingId && <span className="text-xs text-muted-foreground">{buildings.find(b => b.id === t.buildingId)?.name}</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Không có khách thuê nào</p>
          )}
        </div>
      </div>

      {/* Detail / Edit dialog */}
      <Dialog open={!!selected} onOpenChange={() => { setSelected(null); setEditMode(false); }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>{editMode ? "Sửa thông tin" : selected?.name}</DialogTitle></DialogHeader>
          {selected && !editMode && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">CCCD</span><span className="text-sm">{selected.cccd || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">SĐT</span><span className="text-sm">{selected.phone}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Quê quán</span><span className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" />{selected.hometown || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Khu trọ</span><span className="text-sm">{buildings.find(b => b.id === selected.buildingId)?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Phòng</span><span className="text-sm font-medium text-primary">{selected.roomName || "Chưa có phòng"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Ngày vào</span><span className="text-sm">{selected.moveInDate}</span></div>
              {(selected.cccdFront || selected.cccdBack) && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground">Ảnh CCCD</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.cccdFront ? (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img src={selected.cccdFront} alt="Mặt trước" className="w-full object-cover aspect-video" />
                        <p className="text-[10px] text-center text-muted-foreground py-1">Mặt trước</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border aspect-video flex items-center justify-center">
                        <p className="text-[10px] text-muted-foreground">Chưa có</p>
                      </div>
                    )}
                    {selected.cccdBack ? (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <img src={selected.cccdBack} alt="Mặt sau" className="w-full object-cover aspect-video" />
                        <p className="text-[10px] text-center text-muted-foreground py-1">Mặt sau</p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border aspect-video flex items-center justify-center">
                        <p className="text-[10px] text-muted-foreground">Chưa có</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(selected)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Sửa</button>
                <button onClick={() => handleDelete(selected.id)} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Xóa</button>
              </div>
              {/* Thành viên cùng phòng */}
              {selected.roomId && (() => {
                const members = getMembersByRoom(selected.roomId);
                return members.length > 0 ? (
                  <div className="pt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground">Thành viên cùng phòng ({members.length})</p>
                    {members.map(m => (
                      <div key={m.id} className="flex justify-between items-center text-xs bg-secondary/40 rounded-lg px-3 py-2">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-muted-foreground">{m.relation} • {m.cccd || m.phone || "—"}</span>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}
          {selected && editMode && (
            <form className="space-y-3" onSubmit={handleEdit}>
              <input placeholder="Họ và tên" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Số CCCD" value={form.cccd} onChange={e => setForm(p => ({ ...p, cccd: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Quê quán" value={form.hometown} onChange={e => setForm(p => ({ ...p, hometown: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Lưu</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default TenantManagement;
