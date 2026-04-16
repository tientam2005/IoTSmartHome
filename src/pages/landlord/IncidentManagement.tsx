import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { type Incident } from "@/data/mockData";
import { getIncidents, updateIncidentStatus, deleteIncident } from "@/data/incidentStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusFilters = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Mới" },
  { key: "processing", label: "Đang xử lý" },
  { key: "resolved", label: "Đã xong" },
] as const;

type Filter = "all" | Incident["status"];

const IncidentManagement = () => {
  const [list, setList] = useState<Incident[]>(() => getIncidents());
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const { selectedBuildingId } = useBuilding();

  const refresh = () => setList([...getIncidents()]);

  const handleUpdateStatus = (id: string, status: Incident["status"]) => {
    updateIncidentStatus(id, status);
    refresh();
    setSelected(prev => prev ? { ...prev, status } : null);
    toast.success("Đã cập nhật trạng thái");
  };

  const handleDelete = (id: string) => {
    deleteIncident(id);
    refresh();
    setSelected(null);
    toast.success("Đã xóa sự cố");
  };

  const filtered = list
    .filter(i => selectedBuildingId === "all" || i.buildingId === selectedBuildingId)
    .filter(i => filter === "all" || i.status === filter);

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Sự cố" showBack showBuildingSelector />
      <div className="p-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap",
                filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {f.label}
              {f.key !== "all" && (
                <span className="ml-1 opacity-70">
                  ({list.filter(i =>
                    i.status === f.key &&
                    (selectedBuildingId === "all" || i.buildingId === selectedBuildingId)
                  ).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((inc) => (
            <button key={inc.id} onClick={() => setSelected(inc)} className="w-full glass-card rounded-xl p-4 text-left">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-sm">{inc.title}</p>
                <StatusBadge status={inc.status} />
              </div>
              <p className="text-xs text-muted-foreground">{inc.roomName} • {inc.tenantName} • {inc.createdAt}</p>
              <p className="text-xs text-foreground mt-1 line-clamp-2">{inc.description}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Không có sự cố nào</p>
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Phòng</span><span className="text-sm">{selected.roomName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Khách thuê</span><span className="text-sm">{selected.tenantName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Danh mục</span><span className="text-sm">{selected.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground text-sm">Ngày báo</span><span className="text-sm">{selected.createdAt}</span></div>
              <div className="flex justify-between items-center"><span className="text-muted-foreground text-sm">Trạng thái</span><StatusBadge status={selected.status} /></div>
              <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">{selected.description}</p>
              <div className="flex gap-2 mt-2">
                {selected.status === "new" && (
                  <button onClick={() => handleUpdateStatus(selected.id, "processing")} className="flex-1 py-2 rounded-lg bg-warning text-warning-foreground text-sm font-medium">Tiếp nhận</button>
                )}
                {selected.status === "processing" && (
                  <button onClick={() => handleUpdateStatus(selected.id, "resolved")} className="flex-1 py-2 rounded-lg bg-success text-success-foreground text-sm font-medium">Hoàn thành</button>
                )}
                {selected.status === "resolved" && (
                  <button onClick={() => handleDelete(selected.id)} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium">Xóa</button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default IncidentManagement;
