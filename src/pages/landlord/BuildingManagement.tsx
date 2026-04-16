import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { formatCurrency, type Building } from "@/data/mockData";
import { getBuildings, addBuilding, updateBuildingFee, getRooms, syncContractFees, deleteBuilding } from "@/data/buildingStore";
import { Plus, MapPin, Home, Settings, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const emptyFee = { electricPrice: "", waterPrice: "", garbageFee: "", wifiFee: "", parkingFee: "", serviceFee: "" };
const emptyAdd = { name: "", address: "", totalFloors: "", ...emptyFee };

const BuildingManagement = () => {
  const [buildingList, setBuildingList] = useState<Building[]>(() => getBuildings());
  const [selected, setSelected] = useState<Building | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showFeeConfig, setShowFeeConfig] = useState(false);
  const [addForm, setAddForm] = useState(emptyAdd);
  const [feeForm, setFeeForm] = useState(emptyFee);

  const refresh = () => setBuildingList([...getBuildings()]);

  const openFeeConfig = (b: Building) => {
    setSelected(b);
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.electricPrice || !addForm.waterPrice) {
      toast.error("Vui lòng nhập tên khu trọ và giá điện/nước");
      return;
    }
    const newBuilding: Building = {
      id: `b${Date.now()}`,
      name: addForm.name,
      address: addForm.address,
      totalFloors: Number(addForm.totalFloors) || 1,
      feeConfig: {
        electricPrice: Number(addForm.electricPrice),
        waterPrice: Number(addForm.waterPrice),
        garbageFee: addForm.garbageFee ? Number(addForm.garbageFee) : undefined,
        wifiFee: addForm.wifiFee ? Number(addForm.wifiFee) : undefined,
        parkingFee: addForm.parkingFee ? Number(addForm.parkingFee) : undefined,
        serviceFee: addForm.serviceFee ? Number(addForm.serviceFee) : undefined,
      },
    };
    addBuilding(newBuilding);
    refresh();
    toast.success("Đã thêm khu trọ");
    setShowAdd(false);
    setAddForm(emptyAdd);
  };

  const handleDeleteBuilding = (id: string, name: string) => {
    const bRooms = getRooms().filter(r => r.buildingId === id);
    const occupied = bRooms.filter(r => r.status === "occupied").length;
    if (occupied > 0) {
      toast.error(`Không thể xóa "${name}" vì còn ${occupied} phòng đang có người thuê`);
      return;
    }
    const hasRooms = bRooms.length > 0;
    if (hasRooms) {
      toast.error(`Không thể xóa "${name}" vì còn ${bRooms.length} phòng. Xóa hết phòng trước.`);
      return;
    }
    deleteBuilding(id);
    refresh();
    toast.success(`Đã xóa khu trọ "${name}"`);
  };

  const handleSaveFee = () => {
    if (!selected) return;
    if (!feeForm.electricPrice || !feeForm.waterPrice) {
      toast.error("Giá điện và nước không được để trống");
      return;
    }
    const newFee = {
      electricPrice: Number(feeForm.electricPrice),
      waterPrice: Number(feeForm.waterPrice),
      garbageFee: feeForm.garbageFee ? Number(feeForm.garbageFee) : undefined,
      wifiFee: feeForm.wifiFee ? Number(feeForm.wifiFee) : undefined,
      parkingFee: feeForm.parkingFee ? Number(feeForm.parkingFee) : undefined,
      serviceFee: feeForm.serviceFee ? Number(feeForm.serviceFee) : undefined,
    };
    updateBuildingFee(selected.id, newFee);
    // Tự động cập nhật vào tất cả hợp đồng active của khu này
    syncContractFees(selected.id, newFee);
    refresh();
    toast.success("Đã lưu và cập nhật vào tất cả hợp đồng đang thuê");
    setShowFeeConfig(false);
  };

  const af = (field: keyof typeof emptyAdd) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddForm(p => ({ ...p, [field]: e.target.value }));
  const ff = (field: keyof typeof emptyFee) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFeeForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Khu trọ" showBack rightAction={
        <button onClick={() => setShowAdd(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-3">
        {buildingList.map(b => {
          const bRooms = getRooms().filter(r => r.buildingId === b.id);
          const occupied = bRooms.filter(r => r.status === "occupied").length;
          const vacant = bRooms.filter(r => r.status === "vacant").length;
          return (
            <div key={b.id} className="glass-card rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {b.address}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openFeeConfig(b)} className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteBuilding(b.id, b.name)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{bRooms.length} phòng</span>
                </div>
                <span className="text-xs text-success font-medium">{occupied} đang thuê</span>
                <span className="text-xs text-primary font-medium">{vacant} trống</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">⚡ {formatCurrency(b.feeConfig.electricPrice)}/kWh</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">💧 {formatCurrency(b.feeConfig.waterPrice)}/m³</span>
                {b.feeConfig.garbageFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">🗑 {formatCurrency(b.feeConfig.garbageFee)}</span>}
                {b.feeConfig.wifiFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">📶 {formatCurrency(b.feeConfig.wifiFee)}</span>}
                {b.feeConfig.parkingFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">🏍 {formatCurrency(b.feeConfig.parkingFee)}</span>}
                {b.feeConfig.serviceFee && <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground">🔧 {formatCurrency(b.feeConfig.serviceFee)}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add building */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Thêm khu trọ mới</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleAdd}>
            <input placeholder="Tên khu trọ *" value={addForm.name} onChange={af("name")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Địa chỉ" value={addForm.address} onChange={af("address")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Số tầng" type="number" value={addForm.totalFloors} onChange={af("totalFloors")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <p className="text-xs font-semibold text-muted-foreground pt-1">Cấu hình phí dịch vụ</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Giá điện/kWh *</label>
                <input placeholder="VD: 3500" type="number" value={addForm.electricPrice} onChange={af("electricPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Giá nước/m³ *</label>
                <input placeholder="VD: 15000" type="number" value={addForm.waterPrice} onChange={af("waterPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
            </div>
            <input placeholder="Phí rác/tháng (bỏ trống nếu không thu)" type="number" value={addForm.garbageFee} onChange={af("garbageFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Phí Wi-Fi/tháng (bỏ trống nếu không thu)" type="number" value={addForm.wifiFee} onChange={af("wifiFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Phí giữ xe/tháng (bỏ trống nếu không thu)" type="number" value={addForm.parkingFee} onChange={af("parkingFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <input placeholder="Phí dịch vụ/tháng (bỏ trống nếu không thu)" type="number" value={addForm.serviceFee} onChange={af("serviceFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Thêm khu trọ</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fee config edit */}
      <Dialog open={showFeeConfig} onOpenChange={setShowFeeConfig}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Cấu hình phí — {selected?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Bỏ trống các khoản phí không thu.</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Giá điện (VND/kWh) *</label>
                <input type="number" value={feeForm.electricPrice} onChange={ff("electricPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Giá nước (VND/m³) *</label>
                <input type="number" value={feeForm.waterPrice} onChange={ff("waterPrice")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phí rác</label>
                <input type="number" placeholder="Không thu" value={feeForm.garbageFee} onChange={ff("garbageFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phí Wi-Fi</label>
                <input type="number" placeholder="Không thu" value={feeForm.wifiFee} onChange={ff("wifiFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phí giữ xe</label>
                <input type="number" placeholder="Không thu" value={feeForm.parkingFee} onChange={ff("parkingFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phí dịch vụ</label>
                <input type="number" placeholder="Không thu" value={feeForm.serviceFee} onChange={ff("serviceFee")} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
            </div>
            <button onClick={handleSaveFee} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Lưu cấu hình</button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default BuildingManagement;
