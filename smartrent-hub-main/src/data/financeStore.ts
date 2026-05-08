export type TransactionType = "income" | "expense";
export type TransactionCategory =
  | "rent" | "deposit" | "electric" | "water" | "service"   // income
  | "repair" | "maintenance" | "purchase" | "salary" | "other"; // expense

export interface Transaction {
  id: string;
  buildingId: string;
  roomId?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
}

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  rent: "Tiền thuê", deposit: "Tiền cọc", electric: "Tiền điện",
  water: "Tiền nước", service: "Phí dịch vụ",
  repair: "Sửa chữa", maintenance: "Bảo trì", purchase: "Mua sắm",
  salary: "Lương nhân viên", other: "Khác",
};
export const getCategoryLabel = (c: TransactionCategory) => CATEGORY_LABELS[c];

export const INCOME_CATEGORIES: TransactionCategory[] = ["rent", "deposit", "electric", "water", "service"];
export const EXPENSE_CATEGORIES: TransactionCategory[] = ["repair", "maintenance", "purchase", "salary", "other"];

let _transactions: Transaction[] = [
  { id: "tr1", buildingId: "b1", roomId: "r1", type: "income", category: "rent", amount: 3000000, description: "Tiền thuê tháng 3 - Phòng 101", date: "2026-03-05", createdBy: "l1" },
  { id: "tr2", buildingId: "b1", roomId: "r3", type: "income", category: "rent", amount: 2800000, description: "Tiền thuê tháng 3 - Phòng 103", date: "2026-03-05", createdBy: "l1" },
  { id: "tr3", buildingId: "b1", type: "expense", category: "repair", amount: 500000, description: "Sửa vòi nước phòng 101", date: "2026-03-21", createdBy: "l1" },
  { id: "tr4", buildingId: "b1", type: "expense", category: "maintenance", amount: 200000, description: "Vệ sinh hành lang tháng 3", date: "2026-03-25", createdBy: "l1" },
  { id: "tr5", buildingId: "b2", roomId: "r7", type: "income", category: "rent", amount: 4000000, description: "Tiền thuê tháng 3 - Phòng 201", date: "2026-03-04", createdBy: "l1" },
  { id: "tr6", buildingId: "b2", type: "expense", category: "purchase", amount: 1200000, description: "Mua bóng đèn LED các phòng", date: "2026-03-16", createdBy: "l1" },
];

export const getTransactions = () => _transactions;

export const getTransactionsByBuilding = (buildingId: string) =>
  buildingId === "all" ? _transactions : _transactions.filter(t => t.buildingId === buildingId);

export const addTransaction = (t: Transaction) => { _transactions = [t, ..._transactions]; };
export const deleteTransaction = (id: string) => { _transactions = _transactions.filter(t => t.id !== id); };

export const getSummary = (buildingId: string) => {
  const list = getTransactionsByBuilding(buildingId);
  const income = list.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = list.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, profit: income - expense };
};
