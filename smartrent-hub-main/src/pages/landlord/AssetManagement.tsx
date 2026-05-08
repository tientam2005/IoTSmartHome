import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { type Asset } from "@/data/mockData";
import { getAssets, addAsset, updateAsset, deleteAsset } from "@/data/assetStore";
import { getRooms, getBuildings } from "@/data/buildingStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { Plus, Search, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const conditionLabel = { good: "Tốt", worn: "Cũ", broken: "Hỏng" };
const conditionColor = { good: "text-success bg-success/10", worn: "text-warning bg-warning/10", broken: "text-destructive bg-destructive/10" };

const emptyForm = { name: "", quantity: "1", condition: "good" as Asset["condition"], note: "" };

const AssetManagement = () => {
  const [assets, setAssets] = useState<Asset[]>(() => getAssets());
  const { selectedBuildingId } = useBuilding();
  const [search, setSearch] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formRoomId, setFormRoomId] = useState("");

  const refresh = () => setAssets([...getAssets()]);

  const rooms = getRooms().filter(r =>
    selectedBuildingId === "all" || r.buildingId === selectedBuildingId
  );

  const filtered = assets.filter(a => {
    const room = getRooms().find(r => r.id === a.roomId);
    const inBuilding = selectedBuildingId === "all" || room?.buildingId === selectedBuildingId;
    const inRoom = selectedRoomId === "all" || a.roomId === selectedRoomId;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return inBuilding && inRoom && matchSearch;
  });

  const openAdd = () => {
    setEditAsset(null);
    setForm(emptyForm);
    setFormRoomId(rooms[0]?.id ?? "");
    setShowAdd(true);
  };

  const openEdit = (a: Asset) => {
    setEditAsset(a);
    setForm({ name: a.name, quantity: String(a.quantity), condition: a.condition, note: a.note ?? "" });
    setFormRoomId(a.roomId);
    setShowAdd(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !formRoomId) { toast.error("Vui lòng điền tên tài sản và chọn phòng"); return; }
    if (editAsset) {
      updateAsset(editAsset.id, { name: form.name, quantity: Number(form.quantity), condition: form.condition, note: form.note, roomId: formRoomId });
      toast.success("Đã cập nhật tài sản");
    } else {
      addAsset({ id: `a${Date.now()}`, roomId: formRoomId, name: form.name, quantity: Number(form.quantity), condition: form.condition, note: form.note });
      toast.success("Đã thêm tài sản");
    }
    refresh();
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    refresh();
    toast.success("Đã xóa tài sản");
  };

  // Group by room
  const grouped = rooms
    .filter(r => selectedRoomId === "all" || r.id === selectedRoomId)
    .map(r => ({ room: r, items: filtered.filter(a => a.roomId === r.id) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Tài sản" showBack showBuildingSelector rightAction={
        <button onClick={openAdd} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tài sản..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Room filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setSelectedRoomId("all")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition", selectedRoomId === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
            Tất cả phòng
          </button>
          {rooms.map(r => (
            <button key={r.id} onClick={() => setSelectedRoomId(r.id)} className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition", selectedRoomId === r.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
              {r.name}
            </button>
          ))}
        </div>

        {grouped.length === 0 && (
          <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
            <Package className="h-10 w-10 opacity-30" />
            <p className="text-sm">Chưa có tài sản nào</p>
          </div>
        )}

        {grouped.map(({ room, items }) => (
          <div key={room.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-muted-foreground">{room.name}</p>
              {room.currentTenant && <span className="text-xs text-primary">— {room.currentTenant}</span>}
            </div>
            {items.map(a => (
              <div key={a.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{a.name}</p>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", conditionColor[a.condition])}>
                      {conditionLabel[a.condition]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Số lượng: {a.quantity}{a.note ? ` • ${a.note}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(a)} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">Sửa</button>
                  <button onClick={() => handleDelete(a.id)} className="px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>{editAsset ? "Sửa tài sản" : "Thêm tài sản"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSave}>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phòng</label>
              <select value={formRoomId} onChange={e => setFormRoomId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="">-- Chọn phòng --</option>
                {getRooms().filter(r => selectedBuildingId === "all" || r.buildingId === selectedBuildingId).map(r => (
                  <option key={r.id} value={r.id}>{r.name}{r.currentTenant ? ` — ${r.currentTenant}` : ""}</option>
                ))}
              </select>
            </div>
            <input placeholder="Tên tài sản *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Số lượng</label>
                <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tình trạng</label>
                <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value as Asset["condition"] }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                  <option value="good">Tốt</option>
                  <option value="worn">Cũ</option>
                  <option value="broken">Hỏng</option>
                </select>
              </div>
            </div>
            <input placeholder="Ghi chú (tuỳ chọn)" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
              {editAsset ? "Lưu thay đổi" : "Thêm tài sản"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default AssetManagement;
