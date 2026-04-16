import { useState, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useTenant } from "@/contexts/TenantContext";
import { getMembersByRoom, addMember, updateMember, deleteMember, type RoomMember } from "@/data/roomMemberStore";
import { Plus, Users, MapPin, Phone, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ocrMeterImage } from "@/lib/ocrMeter";
import { toast } from "sonner";

const RELATIONS = ["Bản thân", "Vợ/Chồng", "Con", "Anh/Chị/Em", "Bạn cùng phòng", "Khác"];

const emptyForm = { name: "", cccd: "", phone: "", dob: "", hometown: "", relation: "Bạn cùng phòng", moveInDate: new Date().toISOString().slice(0, 10) };

// Simulate OCR CCCD
const ocrCccd = async (_file: File): Promise<{ cccd?: string; name?: string; dob?: string; hometown?: string } | null> =>
  new Promise(resolve => setTimeout(() => resolve({ cccd: "079201001234", name: "NGUYỄN VĂN A", dob: "01/01/1995", hometown: "Hà Nội" }), 1500));

const TenantMembers = () => {
  const { room, tenant } = useTenant();
  const [members, setMembers] = useState<RoomMember[]>(() => room ? getMembersByRoom(room.id) : []);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RoomMember | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [cccdFront, setCccdFront] = useState<string | null>(null);
  const [cccdBack, setCccdBack] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState<"front" | "back" | null>(null);
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const refresh = () => { if (room) setMembers(getMembersByRoom(room.id)); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setCccdFront(null); setCccdBack(null); setShowForm(true); };
  const openEdit = (m: RoomMember) => {
    setEditing(m);
    setForm({ name: m.name, cccd: m.cccd, phone: m.phone, dob: m.dob, hometown: m.hometown, relation: m.relation, moveInDate: m.moveInDate });
    setCccdFront(m.cccdFront ?? null);
    setCccdBack(m.cccdBack ?? null);
    setShowForm(true);
  };

  const handleCccdPhoto = async (side: "front" | "back", file: File) => {
    const url = URL.createObjectURL(file);
    if (side === "front") setCccdFront(url); else setCccdBack(url);
    setOcrLoading(side);
    try {
      const result = await ocrCccd(file);
      if (result && side === "front") {
        setForm(p => ({
          ...p,
          ...(result.cccd && { cccd: result.cccd }),
          ...(result.name && { name: result.name }),
          ...(result.dob && { dob: result.dob }),
          ...(result.hometown && { hometown: result.hometown }),
        }));
        if (result.cccd || result.name) toast.success("Đã đọc thông tin từ CCCD");
      }
    } finally { setOcrLoading(null); }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Vui lòng nhập họ tên"); return; }
    if (!room) return;
    if (editing) {
      updateMember(editing.id, { ...form, cccdFront: cccdFront ?? undefined, cccdBack: cccdBack ?? undefined });
      toast.success("Đã cập nhật thông tin thành viên");
    } else {
      addMember({ id: `rm${Date.now()}`, roomId: room.id, ...form, cccdFront: cccdFront ?? undefined, cccdBack: cccdBack ?? undefined });
      toast.success("Đã thêm thành viên");
    }
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    refresh();
    toast.success("Đã xóa thành viên");
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Thành viên trong phòng" showBack rightAction={
        <button onClick={openAdd} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-3">
        {/* Tổng quan */}
        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm">{room?.name ?? "Phòng của bạn"}</p>
            <p className="text-xs text-muted-foreground">
              {members.length + 1} người • Tối đa {room?.maxOccupants ?? "?"} người
              {members.length + 1 > (room?.maxOccupants ?? 99) && (
                <span className="text-destructive ml-1">⚠ Vượt giới hạn</span>
              )}
            </p>
          </div>
        </div>

        {/* Chủ hộ */}
        {tenant && (
          <div className="glass-card rounded-xl p-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {tenant.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground">Chủ hộ • {tenant.phone}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Chủ hộ</span>
            </div>
          </div>
        )}

        {/* Danh sách thành viên */}
        {members.map(m => (
          <div key={m.id} className="glass-card rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-muted-foreground">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{m.relation}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              {m.cccd && <span>🪪 {m.cccd}</span>}
              {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
              {m.dob && <span>🎂 {m.dob}</span>}
              {m.hometown && <span className="flex items-center gap-1 col-span-2"><MapPin className="h-3 w-3" />{m.hometown}</span>}
              <span>📅 Vào: {m.moveInDate}</span>
            </div>
            {(m.cccdFront || m.cccdBack) && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {m.cccdFront && <div className="rounded-lg overflow-hidden border border-border"><img src={m.cccdFront} alt="Mặt trước" className="w-full object-cover aspect-video" /><p className="text-[9px] text-center text-muted-foreground py-0.5">Mặt trước</p></div>}
                {m.cccdBack && <div className="rounded-lg overflow-hidden border border-border"><img src={m.cccdBack} alt="Mặt sau" className="w-full object-cover aspect-video" /><p className="text-[9px] text-center text-muted-foreground py-0.5">Mặt sau</p></div>}
              </div>
            )}
          </div>
        ))}

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 opacity-20 mx-auto mb-2" />
            <p className="text-sm">Chưa có thành viên nào</p>
            <p className="text-xs mt-1">Thêm người cùng phòng để tiện làm tạm trú</p>
          </div>
        )}

        {/* Ghi chú */}
        <p className="text-[11px] text-muted-foreground text-center px-4">
          Thông tin thành viên chỉ lưu nội bộ, không tạo tài khoản hệ thống. Chủ trọ có thể xem để hỗ trợ làm tạm trú/tạm vắng.
        </p>
      </div>

      {/* Form thêm/sửa */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Sửa thông tin" : "Thêm thành viên"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSave}>
            <input placeholder="Họ và tên *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Quan hệ với chủ hộ</label>
              <select value={form.relation} onChange={e => setForm(p => ({ ...p, relation: e.target.value }))} className={inputCls}>
                {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <input placeholder="Số CCCD/CMND" value={form.cccd} onChange={e => setForm(p => ({ ...p, cccd: e.target.value }))} className={inputCls} />
            <input placeholder="Số điện thoại" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ngày sinh</label>
              <input type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} className={inputCls} />
            </div>
            <input placeholder="Quê quán / Nơi thường trú" value={form.hometown} onChange={e => setForm(p => ({ ...p, hometown: e.target.value }))} className={inputCls} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ngày vào ở</label>
              <input type="date" value={form.moveInDate} onChange={e => setForm(p => ({ ...p, moveInDate: e.target.value }))} className={inputCls} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">Hủy</button>
              <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">
                {editing ? "Lưu" : "Thêm"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default TenantMembers;
