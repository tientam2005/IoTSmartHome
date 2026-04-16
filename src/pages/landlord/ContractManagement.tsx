import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, type Contract, type FeeConfig } from "@/data/mockData";
import {
  getBuildings, getRooms, getTenants, getContracts,
  addContract, updateContract, addTenant, updateTenant, updateRoom, getInvoices,
} from "@/data/buildingStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { addTransaction } from "@/data/financeStore";
import { printContract } from "@/lib/printContract";
import { Plus, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import CreateContractForm from "@/components/CreateContractForm";
import RenewContractForm from "@/components/RenewContractForm";

const ContractManagement = () => {
  const [contracts, setContracts] = useState<Contract[]>(() => getContracts());
  const [selected, setSelected] = useState<Contract | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const { selectedBuildingId: contextBuildingId } = useBuilding();

  // buildingId dùng trong form tạo hợp đồng (riêng, không ảnh hưởng context)
  const [formBuildingId, setFormBuildingId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [createMode, setCreateMode] = useState<"existing" | "new">("new");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [newTenant, setNewTenant] = useState({ name: "", phone: "", cccd: "", hometown: "", email: "" });
  const [deposit, setDeposit] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const refresh = () => setContracts([...getContracts()]);
  const location = useLocation();

  // Tính status thực tế dựa vào ngày (override nếu đã hết hạn)
  const effectiveStatus = (c: Contract): Contract["status"] => {
    if (c.status === "terminated") return "terminated";
    if (new Date(c.endDate) < new Date(new Date().toISOString().slice(0, 10))) return "expired";
    return c.status;
  };

  const daysLeft = (c: Contract) =>
    Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);

  // Tự mở form và pre-fill nếu navigate từ trang phòng
  useEffect(() => {
    const state = location.state as { openCreate?: boolean; roomId?: string; buildingId?: string } | null;
    if (state?.openCreate) {
      if (state.buildingId) setFormBuildingId(state.buildingId);
      if (state.roomId) setSelectedRoomId(state.roomId);
      setShowCreate(true);
      // Xóa state để không mở lại khi back
      window.history.replaceState({}, "");
    }
  }, []);

  const [statusFilter, setStatusFilter] = useState<"active" | "all">("active");

  const buildings = getBuildings();
  const filteredContracts = contracts
    .filter(c => contextBuildingId === "all" || c.buildingId === contextBuildingId)
    .filter(c => {
      const es = effectiveStatus(c);
      if (statusFilter === "active") return es === "active" || es === "expired";
      return true; // "all" = hiện hết kể cả terminated
    })
    // Sắp xếp: active trước, expired sau, terminated cuối
    .sort((a, b) => {
      const order = { active: 0, expired: 1, terminated: 2 };
      return (order[effectiveStatus(a)] ?? 1) - (order[effectiveStatus(b)] ?? 1);
    });

  const vacantRooms = getRooms().filter(r => r.buildingId === formBuildingId && r.status === "vacant");
  const selectedRoom = getRooms().find(r => r.id === selectedRoomId);
  const selectedBuilding = buildings.find(b => b.id === formBuildingId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const existingTenant = getTenants().find(t => t.id === selectedTenantId);
    const tenantName = createMode === "new" ? newTenant.name : existingTenant?.name || "";

    // ── Validate ──
    if (!tenantName || !selectedRoomId || !startDate || !endDate) {
      toast.error("Vui lòng điền đầy đủ thông tin"); return;
    }
    if (!selectedRoom || !selectedBuilding) return;

    // Phòng phải đang trống
    if (selectedRoom.status !== "vacant") {
      toast.error(`Phòng ${selectedRoom.name} hiện không trống, không thể tạo hợp đồng`); return;
    }

    // Ngày kết thúc phải sau ngày bắt đầu
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu"); return;
    }

    // Khách có sẵn: không được đang có hợp đồng active
    if (createMode === "existing") {
      const activeContract = getContracts().find(
        c => c.tenantId === selectedTenantId && c.status === "active"
      );
      if (activeContract) {
        toast.error(`Khách này đang có hợp đồng active tại ${activeContract.roomName}`); return;
      }
    }

    // Khách mới: kiểm tra CCCD trùng
    if (createMode === "new" && newTenant.cccd) {
      const duplicate = getTenants().find(t => t.cccd === newTenant.cccd);
      if (duplicate) {
        toast.error(`CCCD đã tồn tại trong hệ thống (${duplicate.name})`); return;
      }
    }

    let tenantId = selectedTenantId;
    if (createMode === "new") {
      tenantId = `t${Date.now()}`;
      addTenant({
        id: tenantId,
        name: newTenant.name,
        phone: newTenant.phone,
        cccd: newTenant.cccd,
        hometown: newTenant.hometown,
        email: newTenant.email,
        roomId: selectedRoomId,
        roomName: selectedRoom.name,
        buildingId: formBuildingId,
        moveInDate: startDate,
      });
    } else {
      updateTenant(tenantId, {
        roomId: selectedRoomId,
        roomName: selectedRoom.name,
        buildingId: formBuildingId,
        moveInDate: startDate,
      });
    }

    const newContract: Contract = {
      id: `c${Date.now()}`,
      tenantId,
      tenantName,
      roomId: selectedRoomId,
      roomName: selectedRoom.name,
      buildingId: formBuildingId,
      startDate,
      endDate,
      deposit: Number(deposit) || 0,
      monthlyRent: selectedRoom.price,
      feeConfig: { ...selectedBuilding.feeConfig },
      status: "active",
    };
    addContract(newContract);

    // Nếu có tiền cọc → tự tạo giao dịch thu
    if (Number(deposit) > 0) {
      addTransaction({
        id: `tr${Date.now()}`,
        buildingId: formBuildingId,
        roomId: selectedRoomId,
        type: "income",
        category: "deposit",
        amount: Number(deposit),
        description: `Tiền cọc — ${selectedRoom.name} (${tenantName})`,
        date: startDate || new Date().toISOString().slice(0, 10),
        createdBy: "l1",
      });
    }

    // Cập nhật trạng thái phòng → occupied
    updateRoom(selectedRoomId, {
      status: "occupied",
      currentTenantId: tenantId,
      currentTenant: tenantName,
    });

    refresh();
    toast.success(`Đã tạo hợp đồng cho ${tenantName} tại ${selectedRoom.name}`);
    setShowCreate(false);
    resetForm();
  };

  const handleTerminate = (id: string) => {
    const contract = getContracts().find(c => c.id === id);
    if (!contract) return;

    // Kiểm tra hoá đơn chưa thanh toán
    const unpaid = getInvoices().filter(
      i => i.roomId === contract.roomId && (i.status === "unpaid" || i.status === "overdue")
    );
    if (unpaid.length > 0) {
      toast.error(`Còn ${unpaid.length} hoá đơn chưa thanh toán. Vui lòng xử lý trước khi thanh lý.`);
      return;
    }

    updateContract(id, { status: "terminated" });
    // Trả phòng về vacant, xóa khách khỏi phòng
    updateRoom(contract.roomId, { status: "vacant", currentTenantId: undefined, currentTenant: undefined });
    updateTenant(contract.tenantId, { roomId: undefined, roomName: undefined });
    refresh();
    setSelected(prev => prev ? { ...prev, status: "terminated" } : null);
    toast.success("Đã thanh lý hợp đồng. Phòng đã được trả về trạng thái trống.");
  };

  const handleRenew = (c: Contract) => {
    const newEnd = new Date(c.endDate);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    updateContract(c.id, { endDate: newEnd.toISOString().slice(0, 10), status: "active" });
    refresh();
    setSelected(prev => prev ? { ...prev, endDate: newEnd.toISOString().slice(0, 10), status: "active" } : null);
    toast.success("Đã gia hạn hợp đồng thêm 1 năm");
  };

  const resetForm = () => {
    setFormBuildingId("");
    setSelectedRoomId("");
    setCreateMode("new");
    setSelectedTenantId("");
    setNewTenant({ name: "", phone: "", cccd: "", hometown: "", email: "" });
    setDeposit("");
    setStartDate("");
    setEndDate("");
  };

  const renderFeeConfig = (config: FeeConfig) => {
    const items: string[] = [];
    if (config.garbageFee) items.push(`Rác: ${formatCurrency(config.garbageFee)}`);
    if (config.wifiFee) items.push(`Wi-Fi: ${formatCurrency(config.wifiFee)}`);
    if (config.parkingFee) items.push(`Giữ xe: ${formatCurrency(config.parkingFee)}`);
    if (config.serviceFee) items.push(`Dịch vụ: ${formatCurrency(config.serviceFee)}`);
    return items;
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Hợp đồng" showBack showBuildingSelector rightAction={
        <button onClick={() => setShowCreate(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />
      <div className="p-4 space-y-3">
        {/* Filter active/all */}
        <div className="flex gap-2">
          <button onClick={() => setStatusFilter("active")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${statusFilter === "active" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            Đang hiệu lực
          </button>
          <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            Tất cả (kể cả đã thanh lý)
          </button>
        </div>

        <div className="space-y-2">
          {filteredContracts.map((c) => (
          <button key={c.id} onClick={() => setSelected(c)} className="w-full glass-card rounded-xl p-4 text-left">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-sm">{c.roomName} — {c.tenantName}</p>
                <p className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={effectiveStatus(c)} />
                {effectiveStatus(c) === "active" && daysLeft(c) <= 30 && daysLeft(c) >= 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning/15 text-warning font-medium">
                    Còn {daysLeft(c)} ngày
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cọc: {formatCurrency(c.deposit)}</span>
              <span className="font-medium">{formatCurrency(c.monthlyRent)}/tháng</span>
            </div>
          </button>
        ))}
          {filteredContracts.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Không có hợp đồng nào</p>
          )}
        </div>
      </div>

      {/* Contract Detail */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Hợp đồng — {selected?.roomName}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Khách thuê</span><span className="font-medium">{selected.tenantName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span>{selected.roomName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thời hạn</span><span>{selected.startDate} → {selected.endDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền cọc</span><span>{formatCurrency(selected.deposit)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tiền phòng</span><span className="font-bold">{formatCurrency(selected.monthlyRent)}/th</span></div>
              <hr className="border-border" />
              <p className="font-semibold text-xs">Phí dịch vụ trong hợp đồng:</p>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Điện</span><span>{formatCurrency(selected.feeConfig.electricPrice)}/kWh</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">Nước</span><span>{formatCurrency(selected.feeConfig.waterPrice)}/m³</span></div>
              {renderFeeConfig(selected.feeConfig).map((item, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{item.split(":")[0]}</span>
                  <span>{item.split(": ")[1]}</span>
                </div>
              ))}
              <hr className="border-border" />
              <div className="flex justify-between items-center"><span className="text-muted-foreground">Trạng thái</span><StatusBadge status={effectiveStatus(selected)} /></div>
              {(effectiveStatus(selected) === "active" || effectiveStatus(selected) === "expired") && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowRenew(true)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Gia hạn</button>
                  <button onClick={() => handleTerminate(selected.id)} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Thanh lý</button>
                </div>
              )}
              <button
                onClick={() => printContract(selected)}
                className="w-full mt-2 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" /> Xuất hợp đồng (PDF/In)
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Renew Contract */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gia hạn hợp đồng</DialogTitle></DialogHeader>
          {selected && (
            <RenewContractForm
              contract={selected}
              onSuccess={() => { refresh(); setShowRenew(false); setSelected(null); }}
              onCancel={() => setShowRenew(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Contract — dùng CreateContractForm có quét CCCD */}
      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { resetForm(); setShowCreate(false); } }}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tạo hợp đồng mới</DialogTitle></DialogHeader>
          <CreateContractForm
            onSuccess={() => { refresh(); setShowCreate(false); resetForm(); }}
            onCancel={() => { resetForm(); setShowCreate(false); }}
          />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ContractManagement;
