import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, type Room } from "@/data/mockData";
import { getBuildings, getRooms, addRoom, updateRoom, deleteRoom, getContracts, updateBuildingFee, syncContractFees } from "@/data/buildingStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { Plus, Search, Settings, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CreateContractForm from "@/components/CreateContractForm";

const statusFilters = [
  { key: "all", label: "Tất cả" },
  { key: "vacant", label: "Trống" },
  { key: "occupied", label: "Đang thuê" },
  { key: "maintenance", label: "Bảo trì" },
] as const;

const RoomManagement = () => {
  const navigate = useNavigate();
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractRoomId, setContractRoomId] = useState("");
  const [roomList, setRoomList] = useState<Room[]>(() => getRooms());
  const { selectedBuildingId } = useBuilding();
  const [statusFilter, setStatusFilter] = useState<"all" | Room["status"]>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addBuildingId, setAddBuildingId] = useState("");
  const [addForm, setAddForm] = useState({ name: "", area: "", price: "", floor: "", maxOccupants: "", note: "" });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", area: "", price: "", floor: "", maxOccupants: "", status: "vacant" as Room["status"], note: "" });
  const [showFeeConfig, setShowFeeConfig] = useState(false);
  const [feeForm, setFeeForm] = useState({ electricPrice: "", waterPrice: "", garbageFee: "", wifiFee: "", parkingFee: "", serviceFee: "" });

  const buildings = getBuildings();
  const refresh = () => setRoomList([...getRooms()]);

  const filtered = roomList.filter(r => {
    if (selectedBuildingId !== "all" && r.buildingId !== selectedBuildingId) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ── Add room ──
  const openAdd = () => {
    setAddBuildingId(selectedBuildingId === "all" ? "" : selectedBuildingId);
    setAddForm({ name: "", area: "", price: "", floor: "", maxOccupants: "", note: "" });
    setShowAdd(true);
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addBuildingId) { toast.error("Vui lòng chọn khu trọ"); return; }
    if (!addForm.name) { toast.error("Vui lòng nhập tên phòng"); return; }
    // Kiểm tra tên phòng trùng trong cùng khu
    const dup = getRooms().find(r => r.buildingId === addBuildingId && r.name.toLowerCase() === addForm.name.toLowerCase());
    if (dup) { toast.error("Tên phòng đã tồn tại trong khu này"); return; }

    addRoom({
      id: `r${Date.now()}`,
      buildingId: addBuildingId,
      name: addForm.name,
      area: Number(addForm.area) || 0,
      price: Number(addForm.price) || 0,
      floor: Number(addForm.floor) || 1,
      maxOccupants: Number(addForm.maxOccupants) || 2,
      status: "vacant",
      note: addForm.note || undefined,
    });
    refresh();
    toast.success("Đã thêm phòng mới");
    setShowAdd(false);
  };

  // ── Edit room ──
  const openEdit = (room: Room) => {
    setEditForm({ name: room.name, area: String(room.area), price: String(room.price), floor: String(room.floor), maxOccupants: String(room.maxOccupants), status: room.status, note: room.note ?? "" });
    setEditMode(true);
  };

  const handleEditRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const data = { name: editForm.name, area: Number(editForm.area), price: Number(editForm.price), floor: Number(editForm.floor), maxOccupants: Number(editForm.maxOccupants), status: editForm.status, note: editForm.note || undefined };
    updateRoom(selectedRoom.id, data);
    refresh();
    setSelectedRoom(prev => prev ? { ...prev, ...data } : null);
    toast.success("Đã cập nhật phòng");
    setEditMode(false);
  };

  // ── Delete room ──
  const handleDeleteRoom = (id: string) => {
    const room = getRooms().find(r => r.id === id);
    if (room?.status === "occupied") { toast.error("Phòng đang có người thuê. Thanh lý hợp đồng trước."); return; }
    if (getContracts().some(c => c.roomId === id && c.status === "active")) { toast.error("Phòng có hợp đồng active. Thanh lý hợp đồng trước."); return; }
    deleteRoom(id);
    refresh();
    setSelectedRoom(null);
    toast.success("Đã xóa phòng");
  };

  // ── Fee config ──
  const openFeeConfig = () => {
    if (selectedBuildingId === "all") { toast.error("Chọn một khu trọ cụ thể để cấu hình phí"); return; }
    const b = buildings.find(b => b.id === selectedBuildingId);
    if (!b) return;
    setFeeForm({
      electricPrice: String(b.feeConfig.electricPrice),
      waterPrice: String(b.feeConfig.waterPrice),
      garbageFee: String(b.feeConfig.garbageFee || ""),
      wifiFee: String(b.feeConfig.wifiFee || ""),
      parkingFee: String(b.feeConfig.parkingFee || ""),
      serviceFee: String(b.feeConfig.serviceFee || ""),
    });
    setShowFeeConfig(true);
  };

  const handleSaveFee = () => {
    if (!feeForm.electricPrice || !feeForm.waterPrice) { toast.error("Giá điện và nước không được để trống"); return; }
    updateBuildingFee(selectedBuildingId, {
      electricPrice: Number(feeForm.electricPrice),
      waterPrice: Number(feeForm.waterPrice),
      garbageFee: feeForm.garbageFee ? Number(feeForm.garbageFee) : undefined,
      wifiFee: feeForm.wifiFee ? Number(feeForm.wifiFee) : undefined,
      parkingFee: feeForm.parkingFee ? Number(feeForm.parkingFee) : undefined,
      serviceFee: feeForm.serviceFee ? Number(feeForm.serviceFee) : undefined,
    });
    syncContractFees(selectedBuildingId, {
      electricPrice: Number(feeForm.electricPrice),
      waterPrice: Number(feeForm.waterPrice),
      garbageFee: feeForm.garbageFee ? Number(feeForm.garbageFee) : undefined,
      wifiFee: feeForm.wifiFee ? Number(feeForm.wifiFee) : undefined,
      parkingFee: feeForm.parkingFee ? Number(feeForm.parkingFee) : undefined,
      serviceFee: feeForm.serviceFee ? Number(feeForm.serviceFee) : undefined,
    });
    toast.success("Đã lưu và cập nhật vào tất cả hợp đồng đang thuê");
    setShowFeeConfig(false);
  };

  const currentBuilding = selectedBuildingId !== "all" ? buildings.find(b => b.id === selectedBuildingId) : null;
  const ff = (field: keyof typeof feeForm) => (e: React.ChangeEvent<HTMLInputElement>) => setFeeForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Quản lý phòng" showLogout showBuildingSelector
        rightAction={
          <div className="flex items-center gap-1">
            <button onClick={openFeeConfig} className="p-2 rounded-full hover:bg-primary-foreground/10">
              <Settings className="h-5 w-5" />
            </button>
            <button onClick={openAdd} className="p-2 rounded-full hover:bg-primary-foreground/10">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm phòng..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="flex gap-2">
          {statusFilters.map(f => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition",
              statusFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            )}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Không có phòng nào</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {filtered.map(room => {
            const bldName = selectedBuildingId === "all"
              ? buildings.find(b => b.id === room.buildingId)?.name
              : null;
            return (
              <button key={room.id} onClick={() => { setSelectedRoom(room); setEditMode(false); }} className="glass-card rounded-xl p-4 text-left transition hover:shadow-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{room.name}</span>
                  <StatusBadge status={room.status} />
                </div>
                {bldName && <p className="text-[10px] text-primary mb-1 truncate">{bldName}</p>}
                <p className="text-base font-bold text-primary">{formatCurrency(room.price)}</p>
                <p className="text-xs text-muted-foreground mt-1">{room.area}m² • {room.maxOccupants} người</p>
                {room.currentTenant && <p className="text-xs text-foreground mt-1 truncate">👤 {room.currentTenant}</p>}
                {room.note && <p className="text-xs text-muted-foreground mt-1 truncate italic">{room.note}</p>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room detail / edit */}
      <Dialog open={!!selectedRoom} onOpenChange={() => { setSelectedRoom(null); setEditMode(false); }}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Sửa phòng" : selectedRoom?.name}
              {!editMode && selectedBuildingId === "all" && selectedRoom && (
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  — {buildings.find(b => b.id === selectedRoom.buildingId)?.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedRoom && !editMode && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Trạng thái</span><StatusBadge status={selectedRoom.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Giá thuê</span><span className="font-semibold text-sm">{formatCurrency(selectedRoom.price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Diện tích</span><span className="text-sm">{selectedRoom.area}m²</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Tầng</span><span className="text-sm">{selectedRoom.floor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Tối đa</span><span className="text-sm">{selectedRoom.maxOccupants} người</span></div>
              {selectedRoom.currentTenant && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Người thuê</span><span className="text-sm font-medium text-primary">{selectedRoom.currentTenant}</span></div>}
              {selectedRoom.note && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Ghi chú</span><span className="text-sm italic">{selectedRoom.note}</span></div>}
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(selectedRoom)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Sửa</button>
                <button onClick={() => handleDeleteRoom(selectedRoom.id)} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Xóa</button>
              </div>
              {selectedRoom.status === "vacant" && (
                <button
                  onClick={() => {
                    setContractRoomId(selectedRoom.id);
                    setSelectedRoom(null);
                    setShowContractForm(true);
                  }}
                  className="w-full mt-2 py-2 rounded-lg bg-success/10 text-success text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Tạo hợp đồng cho phòng này
                </button>
              )}
            </div>
          )}
          {selectedRoom && editMode && (
            <form className="space-y-3" onSubmit={handleEditRoom}>
              <input placeholder="Tên phòng" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Diện tích (m²)" type="number" value={editForm.area} onChange={e => setEditForm(p => ({ ...p, area: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
                <input placeholder="Giá thuê" type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Tầng" type="number" value={editForm.floor} onChange={e => setEditForm(p => ({ ...p, floor: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
                <input placeholder="Số người tối đa" type="number" value={editForm.maxOccupants} onChange={e => setEditForm(p => ({ ...p, maxOccupants: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <select value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Room["status"] }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                <option value="vacant">Trống</option>
                <option value="occupied">Đang thuê</option>
                <option value="maintenance">Bảo trì</option>
              </select>
              <textarea placeholder="Ghi chú (tuỳ chọn)" value={editForm.note} onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Lưu</button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add room */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>
              Thêm phòng{currentBuilding ? ` — ${currentBuilding.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleAddRoom}>
            {/* Chỉ hiện dropdown khu khi đang ở "Tất cả" */}
            {selectedBuildingId === "all" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Khu trọ *</label>
                <select value={addBuildingId} onChange={e => setAddBuildingId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                  <option value="">-- Chọn khu trọ --</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}
            <input placeholder="Tên phòng (VD: Phòng 401) *" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Diện tích (m²)" type="number" value={addForm.area} onChange={e => setAddForm(p => ({ ...p, area: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Giá thuê" type="number" value={addForm.price} onChange={e => setAddForm(p => ({ ...p, price: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Tầng" type="number" value={addForm.floor} onChange={e => setAddForm(p => ({ ...p, floor: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              <input placeholder="Số người tối đa" type="number" value={addForm.maxOccupants} onChange={e => setAddForm(p => ({ ...p, maxOccupants: e.target.value }))} className="px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>
            <textarea placeholder="Ghi chú (tuỳ chọn, VD: có ban công, view đẹp...)" value={addForm.note} onChange={e => setAddForm(p => ({ ...p, note: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Thêm phòng</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fee config */}
      <Dialog open={showFeeConfig} onOpenChange={setShowFeeConfig}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Cấu hình phí — {currentBuilding?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Bỏ trống các khoản phí không thu.</p>
            <div className="space-y-2">
              <div><label className="text-xs font-medium text-muted-foreground">Giá điện (VND/kWh) *</label><input type="number" value={feeForm.electricPrice} onChange={ff("electricPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Giá nước (VND/m³) *</label><input type="number" value={feeForm.waterPrice} onChange={ff("waterPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Phí rác</label><input type="number" placeholder="Không thu" value={feeForm.garbageFee} onChange={ff("garbageFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Phí Wi-Fi</label><input type="number" placeholder="Không thu" value={feeForm.wifiFee} onChange={ff("wifiFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Phí giữ xe</label><input type="number" placeholder="Không thu" value={feeForm.parkingFee} onChange={ff("parkingFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Phí dịch vụ</label><input type="number" placeholder="Không thu" value={feeForm.serviceFee} onChange={ff("serviceFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" /></div>
            </div>
            <button onClick={handleSaveFee} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Lưu cấu hình</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract form dialog */}
      <Dialog open={showContractForm} onOpenChange={setShowContractForm}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tạo hợp đồng</DialogTitle></DialogHeader>
          <CreateContractForm
            initialBuildingId={getRooms().find(r => r.id === contractRoomId)?.buildingId}
            initialRoomId={contractRoomId}
            onSuccess={() => { setShowContractForm(false); refresh(); }}
            onCancel={() => setShowContractForm(false)}
          />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default RoomManagement;
