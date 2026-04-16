// ========== BUILDING (Khu trọ) ==========
export interface FeeConfig {
  electricPrice: number; // VND per kWh
  waterPrice: number;    // VND per m³
  garbageFee?: number;
  wifiFee?: number;
  parkingFee?: number;
  serviceFee?: number;
  otherFees?: { name: string; amount: number }[];
}

export interface Building {
  id: string;
  name: string;
  address: string;
  totalFloors: number;
  feeConfig: FeeConfig;
}

// ========== ROOM ==========
export interface Room {
  id: string;
  buildingId: string;
  name: string;
  floor: number;
  price: number;
  status: "vacant" | "occupied" | "maintenance";
  area: number;
  maxOccupants: number;
  currentTenantId?: string;
  currentTenant?: string;
  note?: string;
}

// ========== TENANT ==========
export interface Tenant {
  id: string;
  name: string;
  phone: string;
  cccd: string;
  hometown: string;
  roomId?: string;
  roomName?: string;
  buildingId?: string;
  moveInDate: string;
  email?: string;
  cccdFront?: string; // URL ảnh mặt trước CCCD
  cccdBack?: string;  // URL ảnh mặt sau CCCD
}

// ========== CONTRACT ==========
export interface Contract {
  id: string;
  tenantId: string;
  tenantName: string;
  roomId: string;
  roomName: string;
  buildingId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  // Fee overrides from building config at time of signing
  feeConfig: FeeConfig;
  status: "active" | "expired" | "terminated";
}

// ========== METER READING ==========
export interface MeterReading {
  id: string;
  roomId: string;
  roomName: string;
  month: string; // "MM/YYYY"
  electricReading: number;
  waterReading: number;
  recordedAt: string;
}

// ========== INVOICE ==========
export interface InvoiceFeeItem {
  name: string;
  amount: number;
}

export interface Invoice {
  id: string;
  roomId: string;
  roomName: string;
  buildingId: string;
  tenantId: string;
  tenantName: string;
  month: string;
  roomFee: number;
  electricOld: number;
  electricNew: number;
  electricPrice: number;
  waterOld: number;
  waterNew: number;
  waterPrice: number;
  fees: InvoiceFeeItem[]; // dynamic fees (garbage, wifi, parking, etc.)
  total: number;
  status: "unpaid" | "paid" | "overdue" | "pending";
  createdAt: string;
  qrData?: string;
  meterPhotos?: { electric?: string; water?: string };
  paymentProof?: string;
  isReadByTenant?: boolean; // false = khách chưa xem hoá đơn mới này
}

// ========== INCIDENT ==========
export interface Incident {
  id: string;
  roomName: string;
  roomId?: string;
  buildingId?: string;
  tenantName: string;
  title: string;
  description: string;
  status: "new" | "processing" | "resolved";
  createdAt: string;
  category: string;
  isReadByTenant?: boolean; // true = khách đã xem cập nhật mới nhất
}

// ========== NOTIFICATION ==========
export interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  target: "all" | string;
}

// ========== ASSET ==========
export interface Asset {
  id: string;
  roomId: string;
  name: string;
  quantity: number;
  condition: "good" | "worn" | "broken";
  note?: string;
}

// ========== SERVICE PACKAGE ==========
export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  maxRooms: number;
  features: string[];
  isPopular?: boolean;
}

// ==================== MOCK DATA ====================

export const buildings: Building[] = [
  {
    id: "b1",
    name: "Khu trọ Bình An",
    address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
    totalFloors: 3,
    feeConfig: {
      electricPrice: 3500,
      waterPrice: 15000,
      garbageFee: 50000,
      wifiFee: 100000,
    },
  },
  {
    id: "b2",
    name: "Nhà trọ Phú Quý",
    address: "456 Lý Thường Kiệt, Q.10, TP.HCM",
    totalFloors: 4,
    feeConfig: {
      electricPrice: 3800,
      waterPrice: 18000,
      garbageFee: 40000,
      wifiFee: 80000,
      parkingFee: 100000,
      serviceFee: 50000,
    },
  },
];

export const rooms: Room[] = [
  { id: "r1", buildingId: "b1", name: "Phòng 101", floor: 1, price: 3000000, status: "occupied", area: 20, maxOccupants: 2, currentTenantId: "t1", currentTenant: "Trần Thị Bình" },
  { id: "r2", buildingId: "b1", name: "Phòng 102", floor: 1, price: 3200000, status: "vacant", area: 22, maxOccupants: 2 },
  { id: "r3", buildingId: "b1", name: "Phòng 103", floor: 1, price: 2800000, status: "occupied", area: 18, maxOccupants: 2, currentTenantId: "t2", currentTenant: "Lê Văn Cường" },
  { id: "r4", buildingId: "b1", name: "Phòng 201", floor: 2, price: 3500000, status: "occupied", area: 25, maxOccupants: 3, currentTenantId: "t3", currentTenant: "Phạm Thị Dung" },
  { id: "r5", buildingId: "b1", name: "Phòng 202", floor: 2, price: 3500000, status: "maintenance", area: 25, maxOccupants: 3 },
  { id: "r6", buildingId: "b2", name: "Phòng 101", floor: 1, price: 3000000, status: "vacant", area: 20, maxOccupants: 2 },
  { id: "r7", buildingId: "b2", name: "Phòng 201", floor: 2, price: 4000000, status: "occupied", area: 30, maxOccupants: 4, currentTenantId: "t4", currentTenant: "Hoàng Minh" },
  { id: "r8", buildingId: "b2", name: "Phòng 202", floor: 2, price: 3800000, status: "vacant", area: 28, maxOccupants: 3 },
];

export const tenants: Tenant[] = [
  { id: "t1", name: "Trần Thị Bình", phone: "0912345678", cccd: "079201001234", hometown: "Hà Nội", roomId: "r1", roomName: "Phòng 101", buildingId: "b1", moveInDate: "2024-03-01", email: "binh@email.com" },
  { id: "t2", name: "Lê Văn Cường", phone: "0923456789", cccd: "079201005678", hometown: "Đà Nẵng", roomId: "r3", roomName: "Phòng 103", buildingId: "b1", moveInDate: "2024-05-15" },
  { id: "t3", name: "Phạm Thị Dung", phone: "0934567890", cccd: "079201009012", hometown: "TP.HCM", roomId: "r4", roomName: "Phòng 201", buildingId: "b1", moveInDate: "2024-01-10" },
  { id: "t4", name: "Hoàng Minh", phone: "0945678901", cccd: "079201003456", hometown: "Huế", roomId: "r7", roomName: "Phòng 201", buildingId: "b2", moveInDate: "2024-06-01" },
];

export const contracts: Contract[] = [
  {
    id: "c1", tenantId: "t1", tenantName: "Trần Thị Bình", roomId: "r1", roomName: "Phòng 101", buildingId: "b1",
    startDate: "2025-04-01", endDate: "2026-04-01", deposit: 6000000, monthlyRent: 3000000, status: "active",
    feeConfig: { electricPrice: 3500, waterPrice: 15000, garbageFee: 50000, wifiFee: 100000 },
  },
  {
    id: "c2", tenantId: "t2", tenantName: "Lê Văn Cường", roomId: "r3", roomName: "Phòng 103", buildingId: "b1",
    startDate: "2025-06-01", endDate: "2026-06-01", deposit: 5600000, monthlyRent: 2800000, status: "active",
    feeConfig: { electricPrice: 3500, waterPrice: 15000, garbageFee: 50000, wifiFee: 100000 },
  },
  {
    id: "c3", tenantId: "t3", tenantName: "Phạm Thị Dung", roomId: "r4", roomName: "Phòng 201", buildingId: "b1",
    startDate: "2026-01-10", endDate: "2026-05-10", deposit: 7000000, monthlyRent: 3500000, status: "active",
    feeConfig: { electricPrice: 3500, waterPrice: 15000, garbageFee: 50000, wifiFee: 100000 },
  },
  {
    id: "c4", tenantId: "t4", tenantName: "Hoàng Minh", roomId: "r7", roomName: "Phòng 201", buildingId: "b2",
    startDate: "2025-06-01", endDate: "2026-06-01", deposit: 8000000, monthlyRent: 4000000, status: "active",
    feeConfig: { electricPrice: 3800, waterPrice: 18000, garbageFee: 40000, wifiFee: 80000, parkingFee: 100000, serviceFee: 50000 },
  },
];

export const meterReadings: MeterReading[] = [
  // Tháng 02/2026 — chỉ số tích lũy thực tế
  { id: "mr1", roomId: "r1", roomName: "Phòng 101", month: "02/2026", electricReading: 1200, waterReading: 245, recordedAt: "2026-02-25" },
  { id: "mr2", roomId: "r3", roomName: "Phòng 103", month: "02/2026", electricReading: 870,  waterReading: 198, recordedAt: "2026-02-25" },
  { id: "mr3", roomId: "r4", roomName: "Phòng 201", month: "02/2026", electricReading: 1540, waterReading: 312, recordedAt: "2026-02-25" },
  { id: "mr4", roomId: "r7", roomName: "Phòng 201", month: "02/2026", electricReading: 980,  waterReading: 167, recordedAt: "2026-02-25" },
  // Tháng 03/2026 — dùng thêm ~100-150 kWh điện, ~5-8 m³ nước
  { id: "mr5", roomId: "r1", roomName: "Phòng 101", month: "03/2026", electricReading: 1350, waterReading: 251, recordedAt: "2026-03-25" },
  { id: "mr6", roomId: "r3", roomName: "Phòng 103", month: "03/2026", electricReading: 990,  waterReading: 204, recordedAt: "2026-03-25" },
  { id: "mr7", roomId: "r4", roomName: "Phòng 201", month: "03/2026", electricReading: 1690, waterReading: 319, recordedAt: "2026-03-25" },
  { id: "mr8", roomId: "r7", roomName: "Phòng 201", month: "03/2026", electricReading: 1110, waterReading: 174, recordedAt: "2026-03-25" },
];

export const invoices: Invoice[] = [
  {
    // Điện: 1350-1200=150 kWh × 3500 = 525.000 | Nước: 251-245=6 m³ × 15.000 = 90.000
    // Tổng: 3.000.000 + 525.000 + 90.000 + 50.000 + 100.000 = 3.765.000
    id: "i1", roomId: "r1", roomName: "Phòng 101", buildingId: "b1", tenantId: "t1", tenantName: "Trần Thị Bình", month: "03/2026",
    roomFee: 3000000, electricOld: 1200, electricNew: 1350, electricPrice: 3500, waterOld: 245, waterNew: 251, waterPrice: 15000,
    fees: [{ name: "Rác", amount: 50000 }, { name: "Wi-Fi", amount: 100000 }],
    total: 3765000, status: "unpaid", createdAt: "2026-03-25",
  },
  {
    // Điện: 990-870=120 kWh × 3500 = 420.000 | Nước: 204-198=6 m³ × 15.000 = 90.000
    // Tổng: 2.800.000 + 420.000 + 90.000 + 50.000 + 100.000 = 3.460.000
    id: "i2", roomId: "r3", roomName: "Phòng 103", buildingId: "b1", tenantId: "t2", tenantName: "Lê Văn Cường", month: "03/2026",
    roomFee: 2800000, electricOld: 870, electricNew: 990, electricPrice: 3500, waterOld: 198, waterNew: 204, waterPrice: 15000,
    fees: [{ name: "Rác", amount: 50000 }, { name: "Wi-Fi", amount: 100000 }],
    total: 3460000, status: "paid", createdAt: "2026-03-25",
  },
  {
    // Điện: 1690-1540=150 kWh × 3500 = 525.000 | Nước: 319-312=7 m³ × 15.000 = 105.000
    // Tổng: 3.500.000 + 525.000 + 105.000 + 50.000 + 100.000 = 4.280.000
    id: "i3", roomId: "r4", roomName: "Phòng 201", buildingId: "b1", tenantId: "t3", tenantName: "Phạm Thị Dung", month: "03/2026",
    roomFee: 3500000, electricOld: 1540, electricNew: 1690, electricPrice: 3500, waterOld: 312, waterNew: 319, waterPrice: 15000,
    fees: [{ name: "Rác", amount: 50000 }, { name: "Wi-Fi", amount: 100000 }],
    total: 4280000, status: "overdue", createdAt: "2026-03-20",
  },
  {
    // Điện: 1110-980=130 kWh × 3800 = 494.000 | Nước: 174-167=7 m³ × 18.000 = 126.000
    // Tổng: 4.000.000 + 494.000 + 126.000 + 40.000 + 80.000 + 100.000 + 50.000 = 4.890.000
    id: "i4", roomId: "r7", roomName: "Phòng 201", buildingId: "b2", tenantId: "t4", tenantName: "Hoàng Minh", month: "03/2026",
    roomFee: 4000000, electricOld: 980, electricNew: 1110, electricPrice: 3800, waterOld: 167, waterNew: 174, waterPrice: 18000,
    fees: [{ name: "Rác", amount: 40000 }, { name: "Wi-Fi", amount: 80000 }, { name: "Giữ xe", amount: 100000 }, { name: "Dịch vụ", amount: 50000 }],
    total: 4890000, status: "unpaid", createdAt: "2026-03-25",
  },
];

export const incidents: Incident[] = [
  { id: "inc1", roomName: "Phòng 101", roomId: "r1", buildingId: "b1", tenantName: "Trần Thị Bình", title: "Vòi nước bị rỉ", description: "Vòi nước trong nhà tắm bị rỉ nước liên tục", status: "processing", createdAt: "2026-03-20", category: "Nước" },
  { id: "inc2", roomName: "Phòng 201", roomId: "r4", buildingId: "b1", tenantName: "Phạm Thị Dung", title: "Máy lạnh không mát", description: "Máy lạnh chạy nhưng không ra hơi lạnh", status: "new", createdAt: "2026-03-24", category: "Điện" },
  { id: "inc3", roomName: "Phòng 201", roomId: "r7", buildingId: "b2", tenantName: "Hoàng Minh", title: "Bóng đèn hư", description: "Bóng đèn phòng ngủ bị cháy", status: "resolved", createdAt: "2026-03-15", category: "Điện" },
];

export const notifications: Notification[] = [
  { id: "n1", title: "Thông báo thu tiền tháng 3", content: "Quý khách vui lòng thanh toán tiền phòng tháng 3/2026 trước ngày 05/04/2026.", createdAt: "2026-03-25", isRead: false, target: "all" },
  { id: "n2", title: "Lịch cúp nước", content: "Ngày 28/03/2026 sẽ cúp nước từ 8h - 17h để sửa chữa đường ống.", createdAt: "2026-03-23", isRead: true, target: "all" },
  { id: "n3", title: "Nhắc nợ tháng 2", content: "Phòng 201 vui lòng thanh toán hóa đơn tháng 2 còn tồn đọng.", createdAt: "2026-03-10", isRead: false, target: "r4" },
];

export const assets: Asset[] = [
  { id: "a1", roomId: "r1", name: "Giường đơn", quantity: 1, condition: "good" },
  { id: "a2", roomId: "r1", name: "Tủ quần áo", quantity: 1, condition: "good" },
  { id: "a3", roomId: "r1", name: "Máy lạnh Daikin 1HP", quantity: 1, condition: "worn" },
  { id: "a4", roomId: "r1", name: "Bình nóng lạnh", quantity: 1, condition: "good" },
  { id: "a5", roomId: "r4", name: "Giường đôi", quantity: 1, condition: "good" },
  { id: "a6", roomId: "r4", name: "Máy lạnh 1.5HP", quantity: 1, condition: "good" },
  { id: "a7", roomId: "r7", name: "Tủ lạnh mini", quantity: 1, condition: "good" },
];

export const servicePackages: ServicePackage[] = [
  { id: "sp1", name: "Gói Cơ Bản", price: 199000, maxRooms: 10, features: ["Quản lý tối đa 10 phòng", "Hóa đơn cơ bản", "1 tài khoản quản lý"] },
  { id: "sp2", name: "Gói Tiêu Chuẩn", price: 399000, maxRooms: 30, features: ["Quản lý tối đa 30 phòng", "Hóa đơn & hợp đồng", "3 tài khoản quản lý", "Thông báo tự động", "Báo cáo sự cố"], isPopular: true },
  { id: "sp3", name: "Gói Cao Cấp", price: 799000, maxRooms: 100, features: ["Quản lý tối đa 100 phòng", "Toàn bộ tính năng", "Không giới hạn tài khoản", "Báo cáo doanh thu", "Hỗ trợ ưu tiên 24/7"] },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};
