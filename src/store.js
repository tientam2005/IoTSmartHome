import { create } from 'zustand';

export const PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

// Mock initial data
const initialUsers = [
  { id: 'u1', name: 'Nguyễn Văn Chủ', phone: '0900000001', role: 'landlord', status: 'active', packageId: 'p2' },
];

// Mock permissions for RBAC
const allPermissions = [
  { id: 'view_dashboard', label: 'Xem Dashboard tổng quan', category: 'Chung' },
  { id: 'manage_rooms', label: 'Quản lý phòng trọ', category: 'Vận hành' },
  { id: 'manage_tenants', label: 'Quản lý khách thuê', category: 'Vận hành' },
  { id: 'manage_contracts', label: 'Quản lý hợp đồng', category: 'Vận hành' },
  { id: 'manage_invoices', label: 'Lập & thu hóa đơn', category: 'Tài chính' },
  { id: 'view_reports', label: 'Xem báo cáo doanh thu', category: 'Tài chính' },
  { id: 'manage_issues', label: 'Xử lý sự cố/Sửa chữa', category: 'Vận hành' },
  { id: 'manage_assets', label: 'Quản lý tài sản/Nội thất', category: 'Vận hành' },
  { id: 'send_announcements', label: 'Gửi thông báo/Truyền thông', category: 'Chung' },
];

const initialRoles = [
  { id: 'admin', name: 'Quản trị hệ thống', permissionIds: allPermissions.map(p => p.id) },
  { id: 'landlord', name: 'Chủ khu trọ', permissionIds: ['view_dashboard', 'manage_rooms', 'manage_tenants', 'manage_contracts', 'manage_invoices', 'manage_issues', 'manage_assets', 'send_announcements'] },
  { id: 'manager', name: 'Quản lý vận hành', permissionIds: ['manage_rooms', 'manage_tenants', 'manage_issues', 'manage_assets'] },
  { id: 'tenant', name: 'Khát thuê', permissionIds: ['view_dashboard'] },
];

const initialPackages = [
  { id: 'p1', name: 'Gói Cơ Bản (Basic)', price: 150000, maxRooms: 20, permissionIds: ['view_dashboard', 'manage_rooms', 'manage_tenants'] },
  { id: 'p2', name: 'Gói Chuyên Nghiệp', price: 499000, maxRooms: 100, permissionIds: allPermissions.filter(p=>p.id !== 'admin').map(p=>p.id) },
  { id: 'p3', name: 'Gói Enterprise', price: 1500000, maxRooms: 1000, permissionIds: allPermissions.map(p=>p.id) },
];

const initialRooms = [
  { id: '1', number: '101', floor: 1, price: 3000000, area: 20, status: 'rented', utilityConfig: { elecPrice: 3500, waterPrice: 20000, garbageFee: 50000, wifiFee: 100000 } },
  { id: '2', number: '102', floor: 1, price: 3000000, area: 20, status: 'available', utilityConfig: { elecPrice: 3500, waterPrice: 20000, garbageFee: 50000, wifiFee: 100000 } },
  { id: '3', number: '201', floor: 2, price: 3500000, area: 25, status: 'rented', utilityConfig: { elecPrice: 4000, waterPrice: 25000, garbageFee: 50000, wifiFee: 100000 } }
];

const initialTenants = [
  { id: 't1', name: 'Nguyễn Văn A', cccd: '012345678912', phone: '0901234567', hometown: 'Hà Nội', roomId: '1', email: 'vanna@gmail.com' },
  { id: 't2', name: 'Trần Thị B', cccd: '098765432109', phone: '0987654321', hometown: 'Đà Nẵng', roomId: '3', email: 'thib@gmail.com' },
  { id: 't3', name: 'Phòng 102 (Demo)', cccd: '123456789000', phone: '0343497067', hometown: 'TP Hồ Chí Minh', roomId: '2', email: 'demo102@smartrent.vn' }
];

const initialContracts = [
  { id: 'c1', tenantId: 't1', roomId: '1', startDate: '2023-01-01', endDate: '2024-01-01', deposit: 3000000, status: 'active' },
];

const initialInvoices = [
  { id: 'inv1', roomId: '1', month: '10/2023', totalAmount: 3450000, status: 'paid', elecFee: 150000, waterFee: 100000, serviceFee: 200000, elecOld: 1200, elecNew: 1243, waterOld: 450, waterNew: 455 },
  { id: 'inv2', roomId: '3', month: '10/2023', totalAmount: 4000000, status: 'paid', paymentProof: 'https://via.placeholder.com/150', elecFee: 200000, waterFee: 100000, serviceFee: 200000, elecOld: 800, elecNew: 857, waterOld: 210, waterNew: 215 },
  { id: 'inv3', roomId: '2', month: '11/2023', totalAmount: 3500000, status: 'unpaid', elecFee: 160000, waterFee: 120000, serviceFee: 200000, elecOld: 1243, elecNew: 1290, waterOld: 455, waterNew: 462 },
  { id: 'inv4', roomId: '2', month: '10/2023', totalAmount: 3200000, status: 'paid', elecFee: 140000, waterFee: 110000, serviceFee: 200000, elecOld: 1210, elecNew: 1243, waterOld: 448, waterNew: 455 },
  { id: 'inv5', roomId: '2', month: '09/2023', totalAmount: 3100000, status: 'paid', elecFee: 130000, waterFee: 105000, serviceFee: 200000, elecOld: 1180, elecNew: 1210, waterOld: 442, waterNew: 448 },
];

const initialTransactions = [
  { id: 'tr1', type: 'expense', amount: 500000, date: '15/10/2023', note: 'Sửa máy lạnh phòng 101' },
  { id: 'tr2', type: 'expense', amount: 200000, date: '28/10/2023', note: 'Đóng tiền rác đô thị' },
  { id: 'tr3', type: 'income', amount: 1000000, date: '01/11/2023', note: 'Thu cọc giữ chỗ phòng 202' },
];

const initialIssues = [
  { id: 'iss1', roomId: '2', tenantId: 't3', title: 'Hỏng vòi nước nhà vệ sinh', status: 'fixing', date: '2023-10-15', image: '/C:/Users/Nguyen Thi Tien/.gemini/antigravity/brain/7499b3ec-b5de-4821-912e-2a9b50cd81ae/broken_faucet_report_1774569033836.png' },
  { id: 'iss2', roomId: '3', tenantId: 't2', title: 'Máy lạnh không mát', status: 'fixing', date: '2023-10-10', image: null },
];

const initialAssets = [
  { id: 'a1', roomId: '1', name: 'Máy lạnh LG 1HP', condition: 'good' },
  { id: 'a2', roomId: '1', name: 'Tủ quần áo gỗ', condition: 'damaged' },
];

const initialAnnouncements = [
  { id: 'n1', title: 'Thông báo đóng tiền mạng tháng 10', content: 'Tháng này nhà mạng tăng giá cước thêm 20k/phòng. Các phòng lưu ý khi đóng tiền nhé.', date: '25/10/2023', roomId: 'all' },
  { id: 'n2', title: 'Nhắc nhở nội quy để xe', content: 'Phòng 101 vui lòng xếp xe gọn vào góc trong, tránh để án ngữ lối đi chung.', date: '20/10/2023', roomId: '1' }
];

const initialLandlordNotifications = [
  { id: 'ln1', message: 'Hệ thống đã sẵn sàng hoạt động.', date: '26/10/2023', isRead: false }
];

const initialTenantNotifications = [
  { id: 'tn1', tenantId: 't1', title: 'Chào mừng bạn!', message: 'Chào mừng bạn đến với hệ thống quản lý phòng trọ SmartRent.', date: '26/10/2023', isRead: false }
];

const initialManagerInfo = {
  name: 'Nguyễn Văn Chủ (Quản lý)',
  phone: '0912 345 678',
  zalo: '0912 345 678',
  email: 'manager@smartrent.vn'
};

export const useAppStore = create((set) => ({
  // Authentication State
  currentUser: null,
  confirmModal: null, // { title, message, onConfirm }
  selectedSite: 'Khu Trọ Phát Tài',
  showConfirm: (data) => set({ confirmModal: data }),
  hideConfirm: () => set({ confirmModal: null }),
  login: (username, password) => set((state) => {
    const u = username.trim().toLowerCase();
    // Admin check
    if (u === 'admin' || u === 'quanly') {
      return { currentUser: { id: 'admin', name: 'Quản Trị Viên', role: 'admin' } };
    }
    // Landlord check
    if (u === 'chu' || u === 'landlord' || u === 'chutro') {
      return { currentUser: { id: 'l1', name: 'Chủ Trọ Nguyễn', role: 'landlord', packageId: 'p2', phone: '0900000001' } };
    }
    // Tenant check
    if (u === 'khach' || u === 'tenant' || u === 'nguoithue') {
      const firstTenant = state.tenants[0];
      return { currentUser: { ...firstTenant, role: 'tenant' } };
    }
    // Match exact phone
    const tenant = state.tenants.find(t => t.phone === username.trim());
    if (tenant) {
      return { currentUser: { ...tenant, role: 'tenant' } };
    }
    return { currentUser: null }; 
  }),
  logout: () => set({ currentUser: null }),
  setSelectedSite: (site) => set({ selectedSite: site }),

  // Data State
  users: initialUsers,
  packages: initialPackages,
  roles: initialRoles,
  permissions: allPermissions,
  rooms: initialRooms,
  tenants: initialTenants,
  contracts: initialContracts,
  invoices: initialInvoices,
  transactions: initialTransactions,
  issues: initialIssues,
  assets: initialAssets,
  announcements: initialAnnouncements,
  landlordNotifications: initialLandlordNotifications,
  tenantNotifications: initialTenantNotifications,
  managerInfo: initialManagerInfo,

  // Simple generic standard setters for CRUD (In a real app, separate them)
  addInvoice: (inv) => set((state) => ({ invoices: [...state.invoices, { ...inv, id: Date.now().toString() }] })),
  updateInvoice: (id, data) => set((state) => ({ invoices: state.invoices.map(i => i.id === id ? { ...i, ...data } : i) })),
  deleteInvoice: (id) => set((state) => ({ invoices: state.invoices.filter(i => i.id !== id) })),

  addTransaction: (tr) => set((state) => ({ transactions: [{ ...tr, id: Date.now().toString() }, ...state.transactions] })),
  deleteTransaction: (id) => set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) })),

  updateIssue: (id, data) => set((state) => ({ issues: state.issues.map(i => i.id === id ? { ...i, ...data } : i) })),
  addIssue: (iss) => set((state) => ({ issues: [...state.issues, { ...iss, id: Date.now().toString() }] })),

  addAnnouncement: (ann) => set((state) => ({ announcements: [...state.announcements, { ...ann, id: Date.now().toString() }] })),
  deleteAnnouncement: (id) => set((state) => ({ announcements: state.announcements.filter(a => a.id !== id) })),

  addLandlordNotification: (notif) => set((state) => ({ 
    landlordNotifications: [{ ...notif, id: Date.now().toString(), date: new Date().toLocaleDateString('vi-VN'), isRead: false }, ...state.landlordNotifications] 
  })),
  markLandlordNotificationsAsRead: () => set((state) => ({
    landlordNotifications: state.landlordNotifications.map(n => ({...n, isRead: true}))
  })),
  
  addTenantNotification: (notif) => set((state) => ({ 
    tenantNotifications: [{ ...notif, id: Date.now().toString(), date: new Date().toLocaleDateString('vi-VN'), isRead: false }, ...state.tenantNotifications] 
  })),
  markTenantNotificationsAsRead: (tenantId) => set((state) => ({
    tenantNotifications: state.tenantNotifications.map(n => n.tenantId === tenantId ? {...n, isRead: true} : n)
  })),

  // Maintain existing specific methods...
  addUser: (user) => set((state) => ({ users: [...state.users, { ...user, id: Date.now().toString() }] })),
  updateUser: (id, data) => set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
  deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),

  addPackage: (pkg) => set((state) => ({ packages: [...state.packages, { ...pkg, id: Date.now().toString() }] })),
  updatePackage: (id, data) => set((state) => ({ packages: state.packages.map(p => p.id === id ? { ...p, ...data } : p) })),
  deletePackage: (id) => set((state) => ({ packages: state.packages.filter(p => p.id !== id) })),

  addRole: (role) => set((state) => ({ roles: [...state.roles, { ...role, id: Date.now().toString() }] })),
  updateRole: (id, data) => set((state) => ({ roles: state.roles.map(r => r.id === id ? { ...r, ...data } : r) })),
  deleteRole: (id) => set((state) => ({ roles: state.roles.filter(r => r.id !== id) })),

  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, { ...room, id: Date.now().toString() }] })),
  updateRoom: (id, data) => set((state) => ({ rooms: state.rooms.map(r => r.id === id ? { ...r, ...data } : r) })),
  deleteRoom: (id) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== id) })),

  // --- GLOBAL MODAL STATE ---
  confirmModal: { isOpen: false, title: '', message: '', onConfirm: null, onCancel: null, type: 'info' },
  showConfirm: (data) => set({ confirmModal: { ...data, isOpen: true } }),
  hideConfirm: () => set((state) => ({ confirmModal: { isOpen: false, title: '', message: '', onConfirm: null, onCancel: null, type: 'info' } })),

  addTenant: (tenant) => set((state) => ({ tenants: [...state.tenants, { ...tenant, id: Date.now().toString() }] })),
  updateTenant: (id, data) => set((state) => ({ tenants: state.tenants.map(t => t.id === id ? { ...t, ...data } : t) })),
  deleteTenant: (id) => set((state) => ({ tenants: state.tenants.filter(t => t.id !== id) })),

  addContract: (contract) => set((state) => ({ contracts: [...state.contracts, { ...contract, id: Date.now().toString() }] })),
  updateContract: (id, data) => set((state) => ({ contracts: state.contracts.map(c => c.id === id ? { ...c, ...data } : c) })),
  deleteContract: (id) => set((state) => ({ contracts: state.contracts.filter(c => c.id !== id) }))
}));
