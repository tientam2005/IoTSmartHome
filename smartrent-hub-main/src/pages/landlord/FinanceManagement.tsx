import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/data/mockData";
import {
  getTransactions, addTransaction, deleteTransaction, getSummary,
  getCategoryLabel, INCOME_CATEGORIES, EXPENSE_CATEGORIES,
  type Transaction, type TransactionType, type TransactionCategory,
} from "@/data/financeStore";
import { useBuilding } from "@/contexts/BuildingContext";
import { getRooms } from "@/data/buildingStore";
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeFilters = [
  { key: "all", label: "Tất cả" },
  { key: "income", label: "Thu" },
  { key: "expense", label: "Chi" },
] as const;

const FinanceManagement = () => {
  const { selectedBuildingId } = useBuilding();
  const [transactions, setTransactions] = useState<Transaction[]>(() => getTransactions());
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    type: "income" as TransactionType,
    category: "rent" as TransactionCategory,
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    roomId: "",
  });

  const refresh = () => setTransactions([...getTransactions()]);

  const activeBuildingId = selectedBuildingId === "all" ? "all" : selectedBuildingId;
  const summary = getSummary(activeBuildingId);

  const filtered = transactions
    .filter(t => activeBuildingId === "all" || t.buildingId === activeBuildingId)
    .filter(t => typeFilter === "all" || t.type === typeFilter);

  const rooms = getRooms().filter(r => activeBuildingId === "all" || r.buildingId === activeBuildingId);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.date) { toast.error("Vui lòng điền đầy đủ thông tin"); return; }
    const buildingId = activeBuildingId === "all"
      ? (form.roomId ? getRooms().find(r => r.id === form.roomId)?.buildingId ?? "b1" : "b1")
      : activeBuildingId;
    addTransaction({
      id: `tr${Date.now()}`,
      buildingId,
      roomId: form.roomId || undefined,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
      date: form.date,
      createdBy: "l1",
    });
    refresh();
    toast.success(`Đã thêm khoản ${form.type === "income" ? "thu" : "chi"}`);
    setShowAdd(false);
    setForm({ type: "income", category: "rent", amount: "", description: "", date: new Date().toISOString().slice(0, 10), roomId: "" });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    refresh();
    toast.success("Đã xóa giao dịch");
  };

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Thu chi" showBack showBuildingSelector rightAction={
        <button onClick={() => setShowAdd(true)} className="p-2 rounded-full hover:bg-primary-foreground/10">
          <Plus className="h-5 w-5" />
        </button>
      } />

      <div className="p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card rounded-xl p-3 text-center">
            <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Tổng thu</p>
            <p className="text-xs font-bold text-success">{formatCurrency(summary.income)}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Tổng chi</p>
            <p className="text-xs font-bold text-destructive">{formatCurrency(summary.expense)}</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <Wallet className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-[10px] text-muted-foreground">Lợi nhuận</p>
            <p className={cn("text-xs font-bold", summary.profit >= 0 ? "text-primary" : "text-destructive")}>
              {formatCurrency(summary.profit)}
            </p>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {typeFilters.map(f => (
            <button key={f.key} onClick={() => setTypeFilter(f.key)}
              className={cn("px-4 py-1.5 rounded-full text-xs font-medium transition",
                typeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", t.type === "income" ? "bg-success/10" : "bg-destructive/10")}>
                {t.type === "income"
                  ? <TrendingUp className="h-4 w-4 text-success" />
                  : <TrendingDown className="h-4 w-4 text-destructive" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground">{getCategoryLabel(t.category)} • {t.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("font-bold text-sm", t.type === "income" ? "text-success" : "text-destructive")}>
                  {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                </p>
                <button onClick={() => handleDelete(t.id)} className="text-[10px] text-muted-foreground hover:text-destructive mt-0.5">Xóa</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">Chưa có giao dịch nào</p>
          )}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader><DialogTitle>Thêm giao dịch</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleAdd}>
            {/* Thu / Chi toggle */}
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm(p => ({ ...p, type: "income", category: "rent" }))}
                className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition",
                  form.type === "income" ? "bg-success text-white" : "bg-secondary text-secondary-foreground"
                )}>Thu</button>
              <button type="button" onClick={() => setForm(p => ({ ...p, type: "expense", category: "repair" }))}
                className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition",
                  form.type === "expense" ? "bg-destructive text-white" : "bg-secondary text-secondary-foreground"
                )}>Chi</button>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Danh mục</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as TransactionCategory }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                {categories.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Số tiền *</label>
              <input type="number" placeholder="VD: 500000" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
            </div>

            <input placeholder="Mô tả *" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ngày</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phòng (tuỳ chọn)</label>
                <select value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none">
                  <option value="">Không chọn</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm">Thêm giao dịch</button>
          </form>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default FinanceManagement;
