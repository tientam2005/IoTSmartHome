import { useState } from "react";
import { formatCurrency, type Contract } from "@/data/mockData";
import { getContracts, addContract, updateContract, getRooms, updateRoom, getMeterReadings } from "@/data/buildingStore";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface Props {
  contract: Contract;
  onSuccess: () => void;
  onCancel: () => void;
}

const RenewContractForm = ({ contract, onSuccess, onCancel }: Props) => {
  // Ngày bắt đầu = ngày kết thúc hợp đồng cũ
  const [startDate, setStartDate] = useState(contract.endDate);

  // Ngày kết thúc mặc định = +1 năm
  const defaultEnd = new Date(contract.endDate);
  defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
  const [endDate, setEndDate] = useState(defaultEnd.toISOString().slice(0, 10));

  // Giá phòng — cho phép chỉnh
  const room = getRooms().find(r => r.id === contract.roomId);
  const [monthlyRent, setMonthlyRent] = useState(String(contract.monthlyRent));
  const [deposit, setDeposit] = useState(String(contract.deposit));

  // Chỉ số điện nước gần nhất
  const lastReadings = getMeterReadings()
    .filter(mr => mr.roomId === contract.roomId)
    .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
  const lastReading = lastReadings[0];

  const inputCls = "w-full px-3 py-2 rounded-lg border border-input bg-card text-sm focus:ring-2 focus:ring-ring focus:outline-none";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) { toast.error("Vui lòng chọn ngày"); return; }
    if (new Date(endDate) <= new Date(startDate)) { toast.error("Ngày kết thúc phải sau ngày bắt đầu"); return; }

    // Tạo hợp đồng mới
    const newContract: Contract = {
      id: `c${Date.now()}`,
      tenantId: contract.tenantId,
      tenantName: contract.tenantName,
      roomId: contract.roomId,
      roomName: contract.roomName,
      buildingId: contract.buildingId,
      startDate,
      endDate,
      deposit: Number(deposit) || contract.deposit,
      monthlyRent: Number(monthlyRent) || contract.monthlyRent,
      feeConfig: { ...contract.feeConfig },
      status: "active",
    };
    addContract(newContract);

    // Chuyển hợp đồng cũ → expired
    updateContract(contract.id, { status: "expired" });

    // Cập nhật giá phòng nếu thay đổi
    if (Number(monthlyRent) !== contract.monthlyRent) {
      updateRoom(contract.roomId, { price: Number(monthlyRent) });
    }

    toast.success(`Đã gia hạn hợp đồng cho ${contract.tenantName} đến ${endDate}`);
    onSuccess();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Thông tin cố định */}
      <div className="glass-card rounded-xl p-3 space-y-1.5 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Khách thuê</span><span className="font-semibold">{contract.tenantName}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Phòng</span><span className="font-semibold">{contract.roomName}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Hợp đồng cũ</span><span className="text-muted-foreground text-xs">{contract.startDate} → {contract.endDate}</span></div>
      </div>

      {/* Ngày gia hạn */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Ngày bắt đầu</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Ngày kết thúc</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* Giá phòng — có thể chỉnh */}
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Tiền thuê/tháng
          {Number(monthlyRent) !== contract.monthlyRent && (
            <span className="ml-2 text-warning font-medium">
              (tăng {formatCurrency(Number(monthlyRent) - contract.monthlyRent)})
            </span>
          )}
        </label>
        <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className={inputCls} />
        <p className="text-[10px] text-muted-foreground mt-0.5">Giá cũ: {formatCurrency(contract.monthlyRent)}/tháng</p>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Tiền cọc</label>
        <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className={inputCls} />
      </div>

      {/* Chỉ số điện nước gần nhất */}
      {lastReading && (
        <div className="glass-card rounded-xl p-3 text-xs space-y-1">
          <p className="font-semibold text-muted-foreground mb-1">Chỉ số gần nhất ({lastReading.month})</p>
          <div className="flex justify-between"><span className="text-muted-foreground">⚡ Điện</span><span>{lastReading.electricReading} kWh</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">💧 Nước</span><span>{lastReading.waterReading} m³</span></div>
          <p className="text-[10px] text-muted-foreground mt-1">Sẽ dùng làm chỉ số đầu kỳ cho hợp đồng mới</p>
        </div>
      )}

      {/* Phí dịch vụ */}
      <div className="glass-card rounded-xl p-3 text-xs space-y-1">
        <p className="font-semibold text-muted-foreground mb-1">Phí dịch vụ (giữ nguyên)</p>
        <div className="flex justify-between"><span className="text-muted-foreground">Điện</span><span>{formatCurrency(contract.feeConfig.electricPrice)}/kWh</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Nước</span><span>{formatCurrency(contract.feeConfig.waterPrice)}/m³</span></div>
        {contract.feeConfig.garbageFee && <div className="flex justify-between"><span className="text-muted-foreground">Rác</span><span>{formatCurrency(contract.feeConfig.garbageFee)}/th</span></div>}
        {contract.feeConfig.wifiFee && <div className="flex justify-between"><span className="text-muted-foreground">Wi-Fi</span><span>{formatCurrency(contract.feeConfig.wifiFee)}/th</span></div>}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm">Hủy</button>
        <button type="submit" className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4" /> Gia hạn hợp đồng
        </button>
      </div>
    </form>
  );
};

export default RenewContractForm;
