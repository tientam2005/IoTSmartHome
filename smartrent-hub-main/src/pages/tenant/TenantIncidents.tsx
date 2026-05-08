import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import StatusBadge from "@/components/StatusBadge";
import { type Incident } from "@/data/mockData";
import { getIncidents, addIncident, markIncidentReadByTenant } from "@/data/incidentStore";
import { useTenant } from "@/contexts/TenantContext";
import { addLandlordNotif } from "@/data/landlordNotifStore";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const TenantIncidents = () => {
  const { tenant, room } = useTenant();
  const [incidents, setIncidents] = useState<Incident[]>(() =>
    tenant ? getIncidents().filter(i => i.tenantName === tenant.name) : []
  );
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Điện", description: "" });

  const refresh = () => {
    if (tenant) setIncidents(getIncidents().filter(i => i.tenantName === tenant.name));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !room) { toast.error("Không tìm thấy thông tin phòng"); return; }
    if (!form.title) { toast.error("Vui lòng nhập tiêu đề sự cố"); return; }
    const newInc: Incident = {
      id: `inc${Date.now()}`,
      roomName: room.name,
      roomId: room.id,
      buildingId: room.buildingId,
      tenantName: tenant.name,
      title: form.title,
      category: form.category,
      description: form.description,
      status: "new",
      createdAt: new Date().toISOString().slice(0, 10),
      isReadByTenant: true, // khách tự tạo nên đã biết
    };
    addIncident(newInc);
    // Thông báo cho chủ nhà
    addLandlordNotif({
      type: "incident_new",
      title: "Sự cố mới từ khách thuê",
      body: `${tenant.name} báo cáo: "${form.title}" tại ${room.name}`,
      roomName: room.name,
      tenantName: tenant.name,
      refId: newInc.id,
    });
    refresh();
    toast.success("Đã gửi báo cáo sự cố");
    setShowAdd(false);
    setForm({ title: "", category: "Điện", description: "" });
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Sự cố" rightAction={
        <button onClick={() => setShowAdd(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />
      <div className="p-4 space-y-2">
        {incidents.map(inc => (
          <div key={inc.id} onClick={() => { markIncidentReadByTenant(inc.id); refresh(); }}
            className={`glass-card rounded-xl p-4 cursor-pointer ${!inc.isReadByTenant ? "border-l-4 border-l-primary" : ""}`}>
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-sm">{inc.title}</p>
              <StatusBadge status={inc.status} />
            </div>
            <p className="text-xs text-muted-foreground">{inc.createdAt} • {inc.category}</p>
            <p className="text-sm mt-2">{inc.description}</p>
          </div>
        ))}
        {incidents.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Chưa có sự cố nào</p>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Báo cáo sự cố</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input placeholder="Tiêu đề sự cố *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
              <option>Điện</option>
              <option>Nước</option>
              <option>Thiết bị</option>
              <option>Khác</option>
            </select>
            <textarea placeholder="Mô tả chi tiết..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none resize-none" />
            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Gửi báo cáo</button>
          </form>
        </DialogContent>
      </Dialog>
      <BottomNav />
    </div>
  );
};

export default TenantIncidents;
