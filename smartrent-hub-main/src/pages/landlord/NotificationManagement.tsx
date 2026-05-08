import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { type Notification } from "@/data/mockData";
import { getNotifications, addNotification, deleteNotification, markNotificationRead, getRooms } from "@/data/buildingStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NotificationManagement = () => {
  const [list, setList] = useState<Notification[]>(() => getNotifications());
  const refresh = () => setList([...getNotifications()]);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [form, setForm] = useState({ title: "", content: "", target: "all" });
  const { selectedBuildingId } = useBuilding();

  // Phòng đang thuê theo khu đang chọn
  const occupiedRooms = getRooms().filter(r =>
    r.status === "occupied" &&
    (selectedBuildingId === "all" || r.buildingId === selectedBuildingId)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    const newN: Notification = {
      id: `n${Date.now()}`,
      title: form.title,
      content: form.content,
      target: form.target,
      createdAt: new Date().toISOString().slice(0, 10),
      isRead: false,
    };
    addNotification(newN);
    refresh();
    toast.success("Đã gửi thông báo");
    setShowAdd(false);
    setForm({ title: "", content: "", target: "all" });
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    refresh();
    setSelected(null);
    toast.success("Đã xóa thông báo");
  };

  const markRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Thông báo" showBack showBuildingSelector rightAction={
        <button onClick={() => setShowAdd(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />
      <div className="p-4 space-y-2">
        {list.map((n) => (
          <button key={n.id} onClick={() => { setSelected(n); markRead(n.id); }} className={cn("w-full glass-card rounded-xl p-4 text-left", !n.isRead && "border-l-4 border-l-primary")}>
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm">{n.title}</p>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
            <p className="text-sm mt-1 text-foreground line-clamp-2">{n.content}</p>
          </button>
        ))}
        {list.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Chưa có thông báo nào</p>
        )}
      </div>

      {/* Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {selected.createdAt} • {selected.target === "all" ? "Tất cả khách thuê" : `Phòng: ${getRooms().find(r => r.id === selected.target)?.name || selected.target}`}
              </p>
              <p className="text-sm text-foreground">{selected.content}</p>
              <button onClick={() => handleDelete(selected.id)} className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Xóa thông báo</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Gửi thông báo mới</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleAdd}>
            <input
              placeholder="Tiêu đề *"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
            <textarea
              placeholder="Nội dung thông báo *"
              value={form.content}
              onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none"
            />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Gửi đến</label>
              <select
                value={form.target}
                onChange={e => setForm(p => ({ ...p, target: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="all">Tất cả khách thuê</option>
                {occupiedRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}{r.currentTenant ? ` — ${r.currentTenant}` : ""}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Gửi thông báo</button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default NotificationManagement;
