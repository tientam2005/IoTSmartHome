import { cn } from "@/lib/utils";

type StatusType = "vacant" | "occupied" | "maintenance" | "active" | "expired" | "terminated" |
  "unpaid" | "paid" | "overdue" | "pending" | "new" | "processing" | "resolved" | "good" | "worn" | "broken";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  vacant: { label: "Trống", className: "bg-success/15 text-success" },
  occupied: { label: "Đang thuê", className: "bg-primary/15 text-primary" },
  maintenance: { label: "Bảo trì", className: "bg-warning/15 text-warning" },
  active: { label: "Hiệu lực", className: "bg-success/15 text-success" },
  expired: { label: "Hết hạn", className: "bg-destructive/15 text-destructive" },
  terminated: { label: "Đã thanh lý", className: "bg-muted text-muted-foreground" },
  unpaid: { label: "Chưa TT", className: "bg-warning/15 text-warning" },
  paid: { label: "Đã TT", className: "bg-success/15 text-success" },
  overdue: { label: "Quá hạn", className: "bg-destructive/15 text-destructive" },
  pending: { label: "Chờ xác nhận", className: "bg-blue-500/15 text-blue-500" },
  new: { label: "Mới", className: "bg-primary/15 text-primary" },
  processing: { label: "Đang xử lý", className: "bg-warning/15 text-warning" },
  resolved: { label: "Đã xong", className: "bg-success/15 text-success" },
  good: { label: "Tốt", className: "bg-success/15 text-success" },
  worn: { label: "Cũ", className: "bg-warning/15 text-warning" },
  broken: { label: "Hỏng", className: "bg-destructive/15 text-destructive" },
};

const StatusBadge = ({ status }: { status: StatusType }) => {
  const config = statusConfig[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("status-badge", config.className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
