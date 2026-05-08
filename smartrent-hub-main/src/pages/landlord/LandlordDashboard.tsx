import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { formatCurrency, type Room, type Contract } from "@/data/mockData";
import { getBuildings, getRooms, getContracts, getInvoices } from "@/data/buildingStore";
import { getIncidents } from "@/data/incidentStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  DoorOpen, DollarSign, AlertTriangle, FileWarning,
  ChevronRight, UserPlus, Clock, TrendingUp,
  ArrowRight, Zap, Plus, Building2, Home, FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateContractForm from "@/components/CreateContractForm";
import RenewContractForm from "@/components/RenewContractForm";

const LandlordDashboard = () => {
  const navigate = useNavigate();
  const { selectedBuildingId } = useBuilding();
  const { user } = useAuth();
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractRoomId, setContractRoomId] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRenew, setShowRenew] = useState(false);
  const [renewContract, setRenewContract] = useState<Contract | null>(null);

  const [showAllVacant, setShowAllVacant] = useState(false);

  const buildings = getBuildings();
  const allRooms = getRooms();
  const allInvoices = getInvoices();
  const allContracts = getContracts();
  const allIncidents = getIncidents();

  const filteredRooms = selectedBuildingId === "all" ? allRooms : allRooms.filter(r => r.buildingId === selectedBuildingId);
  const filteredInvoices = selectedBuildingId === "all" ? allInvoices : allInvoices.filter(i => i.buildingId === selectedBuildingId);
  const filteredContracts = selectedBuildingId === "all" ? allContracts : allContracts.filter(c => c.buildingId === selectedBuildingId);

  const vacantRooms = filteredRooms.filter(r => r.status === "vacant");
  const occupiedRooms = filteredRooms.filter(r => r.status === "occupied");
  const maintenanceRooms = filteredRooms.filter(r => r.status === "maintenance");

  const unpaidInvoices = filteredInvoices.filter(i => i.status === "unpaid" || i.status === "overdue");
  const overdueInvoices = filteredInvoices.filter(i => i.status === "overdue");
  const totalRevenue = filteredInvoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const totalUnpaidAmount = unpaidInvoices.reduce((s, i) => s + i.total, 0);

  const openIncidents = allIncidents.filter(i => i.status !== "resolved");

  const expiringContracts = filteredContracts.filter(c => {
    const diffDays = (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return c.status === "active" && diffDays <= 30 && diffDays >= 0;
  });
  const expiredContracts = filteredContracts.filter(c => c.status === "expired");

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Tổng quan" showLogout showBuildingSelector />

      <div className="p-4 space-y-5">
        {/* Welcome hero */}
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="absolute right-8 bottom-0 w-20 h-20 rounded-full bg-white/5 translate-y-6" />
          <p className="text-sm opacity-80">Xin chào,</p>
          <p className="text-2xl font-bold mt-0.5">{user?.name ?? "Chủ trọ"} 👋</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs opacity-80">
            <Home className="h-3.5 w-3.5" />
            <span>
              {buildings.length} khu trọ •{" "}
              {allRooms.length} phòng •{" "}
              {occupiedRooms.length} đang thuê
            </span>
          </div>
        </div>

        {/* Tên khu đang chọn */}
        {selectedBuildingId !== "all" && selectedBuilding && (
          <div className="glass-card rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">{selectedBuilding.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedBuilding.address}</p>
            </div>
          </div>
        )}

        {/* Thao tác nhanh — lên trên */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Plus, label: "Thêm phòng", path: "/landlord/rooms", color: "bg-primary/10 text-primary" },
            { icon: UserPlus, label: "Hợp đồng", path: "/landlord/contracts", color: "bg-success/10 text-success" },
            { icon: TrendingUp, label: "Hoá đơn", path: "/landlord/invoices", color: "bg-warning/10 text-warning" },
            { icon: Building2, label: "Khu trọ", path: "/landlord/buildings", color: "bg-accent/10 text-accent-foreground" },
          ].map(action => (
            <button key={action.label} onClick={() => navigate(action.path)} className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 active:scale-[0.97] transition-transform">
              <div className={`p-2 rounded-lg ${action.color}`}><action.icon className="h-4 w-4" /></div>
              <span className="text-[10px] font-medium text-foreground text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={<DoorOpen className="h-5 w-5" />} label="Đang thuê" value={occupiedRooms.length} subtitle={`${maintenanceRooms.length} bảo trì`} />
          <StatCard icon={<DollarSign className="h-5 w-5" />} label="Đã thu" value={formatCurrency(totalRevenue)} variant="success" />
          <div className="cursor-pointer" onClick={() => navigate("/landlord/invoices")}>
            <StatCard icon={<FileWarning className="h-5 w-5" />} label="Chưa thu" value={formatCurrency(totalUnpaidAmount)} subtitle={`${unpaidInvoices.length} hóa đơn`} variant="warning" />
          </div>
          <div className="cursor-pointer" onClick={() => navigate("/landlord/incidents")}>
            <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Sự cố mở" value={openIncidents.length} subtitle="cần xử lý" variant="destructive" />
          </div>
        </div>

        {/* Phòng trống — giới hạn 3, có xem thêm */}
        {vacantRooms.length > 0 && (
          <section className="glass-card rounded-2xl p-4 border-l-4 border-l-success">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-success/10"><DoorOpen className="h-4 w-4 text-success" /></div>
                <h2 className="font-bold text-foreground text-sm">{vacantRooms.length} phòng trống</h2>
              </div>
              {vacantRooms.length > 3 && (
                <button onClick={() => setShowAllVacant(v => !v)} className="text-xs text-primary font-medium">
                  {showAllVacant ? "Thu gọn" : `+${vacantRooms.length - 3} phòng`}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {(showAllVacant ? vacantRooms : vacantRooms.slice(0, 3)).map(room => {
                const bld = buildings.find(b => b.id === room.buildingId);
                return (
                  <div key={room.id} onClick={() => setSelectedRoom(room)} className="flex items-center justify-between bg-background/60 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-transform">
                    <div>
                      <p className="font-semibold text-sm">{room.name}</p>
                      <p className="text-xs text-muted-foreground">{bld?.name} • {room.area}m²</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{formatCurrency(room.price)}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate("/landlord/contracts", { state: { openCreate: true } })} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 text-success font-semibold text-sm">
              <UserPlus className="h-4 w-4" /> Tạo hợp đồng mới
            </button>
          </section>
        )}

        {/* Hợp đồng sắp hết hạn */}
        {(expiringContracts.length > 0 || expiredContracts.length > 0) && (
          <section className="glass-card rounded-2xl p-4 border-l-4 border-l-warning">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-warning/10"><Clock className="h-4 w-4 text-warning" /></div>
                <h2 className="font-bold text-foreground text-sm">Hợp đồng cần gia hạn</h2>
              </div>
              <button onClick={() => navigate("/landlord/contracts")} className="text-xs text-primary font-medium">Xem tất cả</button>
            </div>
            <div className="space-y-2">
              {[...expiredContracts, ...expiringContracts].slice(0, 3).map(contract => {
                const diffDays = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={contract.id} onClick={() => navigate("/landlord/contracts")} className="flex items-center justify-between bg-background/60 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-transform">
                    <div>
                      <p className="font-semibold text-sm">{contract.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{contract.roomName} • đến {contract.endDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {diffDays < 0
                        ? <span className="text-xs font-bold text-destructive">Đã hết hạn</span>
                        : <span className="text-xs font-bold text-warning">Còn {diffDays} ngày</span>
                      }
                      <button
                        onClick={e => { e.stopPropagation(); setRenewContract(contract); setShowRenew(true); }}
                        className="text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-medium"
                      >
                        Gia hạn
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Hoá đơn quá hạn */}
        {overdueInvoices.length > 0 && (
          <section className="glass-card rounded-2xl p-4 border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-destructive/10"><Zap className="h-4 w-4 text-destructive" /></div>
              <h2 className="font-bold text-foreground text-sm">Hoá đơn quá hạn</h2>
            </div>
            <div className="space-y-2">
              {overdueInvoices.map(inv => (
                <div key={inv.id} onClick={() => navigate("/landlord/invoices")} className="flex items-center justify-between bg-background/60 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-transform">
                  <div>
                    <p className="font-semibold text-sm">{inv.roomName}</p>
                    <p className="text-xs text-muted-foreground">{inv.tenantName} • {inv.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-destructive">{formatCurrency(inv.total)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sự cố đang xử lý */}
        {openIncidents.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">Sự cố đang xử lý</h2>
              <button onClick={() => navigate("/landlord/incidents")} className="text-xs text-primary font-medium flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></button>
            </div>
            <div className="space-y-2">
              {openIncidents.slice(0, 3).map(inc => (
                <div key={inc.id} onClick={() => navigate("/landlord/incidents")} className="glass-card rounded-xl p-3 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform">
                  <div>
                    <p className="font-semibold text-sm">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">{inc.roomName} • {inc.createdAt}</p>
                  </div>
                  <StatusBadge status={inc.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Renew Contract dialog */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Gia hạn hợp đồng</DialogTitle></DialogHeader>
          {renewContract && (
            <RenewContractForm
              contract={renewContract}
              onSuccess={() => { setShowRenew(false); setRenewContract(null); }}
              onCancel={() => { setShowRenew(false); setRenewContract(null); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Room detail dialog */}
      <Dialog open={!!selectedRoom && !showContractForm} onOpenChange={() => setSelectedRoom(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{selectedRoom?.name}
              <span className="text-xs font-normal text-muted-foreground ml-2">
                — {buildings.find(b => b.id === selectedRoom?.buildingId)?.name}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Trạng thái</span><StatusBadge status={selectedRoom.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Giá thuê</span><span className="font-semibold text-sm">{formatCurrency(selectedRoom.price)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Diện tích</span><span className="text-sm">{selectedRoom.area}m²</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Tầng</span><span className="text-sm">{selectedRoom.floor}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Tối đa</span><span className="text-sm">{selectedRoom.maxOccupants} người</span></div>
              {selectedRoom.note && <div className="flex justify-between"><span className="text-muted-foreground text-sm">Ghi chú</span><span className="text-sm italic">{selectedRoom.note}</span></div>}
              <button
                onClick={() => {
                  setContractRoomId(selectedRoom.id);
                  setSelectedRoom(null);
                  setShowContractForm(true);
                }}
                className="w-full mt-2 py-2.5 rounded-lg bg-success/10 text-success text-sm font-medium flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" /> Tạo hợp đồng cho phòng này
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contract form dialog */}
      <Dialog open={showContractForm} onOpenChange={setShowContractForm}>
        <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tạo hợp đồng</DialogTitle></DialogHeader>
          <CreateContractForm
            initialBuildingId={allRooms.find(r => r.id === contractRoomId)?.buildingId}
            initialRoomId={contractRoomId}
            onSuccess={() => setShowContractForm(false)}
            onCancel={() => setShowContractForm(false)}
          />
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default LandlordDashboard;
