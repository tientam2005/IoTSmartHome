import {
  buildings as mockBuildings,
  rooms as mockRooms,
  tenants as mockTenants,
  contracts as mockContracts,
  invoices as mockInvoices,
  notifications as mockNotifications,
  meterReadings as mockMeterReadings,
  type Building,
  type Room,
  type Tenant,
  type Contract,
  type Invoice,
  type Notification,
  type MeterReading,
} from "./mockData";

// Module-level shared stores
let _buildings: Building[] = [...mockBuildings];
let _rooms: Room[] = [...mockRooms];
let _tenants: Tenant[] = [...mockTenants];
let _contracts: Contract[] = [...mockContracts];
let _invoices: Invoice[] = [...mockInvoices];
let _notifications: Notification[] = [...mockNotifications];
let _meterReadings: MeterReading[] = [...mockMeterReadings];

// ---- Buildings ----
export const getBuildings = () => _buildings;

export const addBuilding = (b: Building) => {
  _buildings = [..._buildings, b];
};

export const updateBuildingFee = (id: string, feeConfig: Building["feeConfig"]) => {
  _buildings = _buildings.map(b => b.id === id ? { ...b, feeConfig } : b);
};

export const deleteBuilding = (id: string) => {
  _buildings = _buildings.filter(b => b.id !== id);
};

// ---- Rooms ----
export const getRooms = () => _rooms;

export const addRoom = (r: Room) => {
  _rooms = [..._rooms, r];
};

export const updateRoom = (id: string, data: Partial<Room>) => {
  _rooms = _rooms.map(r => r.id === id ? { ...r, ...data } : r);
};

export const deleteRoom = (id: string) => {
  _rooms = _rooms.filter(r => r.id !== id);
};

// ---- Tenants ----
export const getTenants = () => _tenants;

export const addTenant = (t: Tenant) => {
  _tenants = [..._tenants, t];
};

export const updateTenant = (id: string, data: Partial<Tenant>) => {
  _tenants = _tenants.map(t => t.id === id ? { ...t, ...data } : t);
};

export const deleteTenant = (id: string) => {
  _tenants = _tenants.filter(t => t.id !== id);
};

// ---- Contracts ----
export const getContracts = () => _contracts;

export const addContract = (c: Contract) => {
  _contracts = [..._contracts, c];
};

export const updateContract = (id: string, data: Partial<Contract>) => {
  _contracts = _contracts.map(c => c.id === id ? { ...c, ...data } : c);
};

// Cập nhật feeConfig của tất cả hợp đồng active thuộc building
export const syncContractFees = (buildingId: string, feeConfig: Building["feeConfig"]) => {
  _contracts = _contracts.map(c =>
    c.buildingId === buildingId && c.status === "active"
      ? { ...c, feeConfig: { ...c.feeConfig, ...feeConfig } }
      : c
  );
};

// ---- Invoices ----
export const getInvoices = () => _invoices;

export const addInvoices = (items: Invoice[]) => {
  _invoices = [..._invoices, ...items];
};

export const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
  _invoices = _invoices.map(i => i.id === id ? { ...i, status } : i);
};

export const updateInvoiceProof = (id: string, paymentProof: string) => {
  _invoices = _invoices.map(i => i.id === id ? { ...i, paymentProof } : i);
};

export const markInvoiceReadByTenant = (id: string) => {
  _invoices = _invoices.map(i => i.id === id ? { ...i, isReadByTenant: true } : i);
};

// ---- Notifications ----
export const getNotifications = () => _notifications;

export const addNotification = (n: Notification) => {
  _notifications = [n, ..._notifications];
};

export const deleteNotification = (id: string) => {
  _notifications = _notifications.filter(n => n.id !== id);
};

export const markNotificationRead = (id: string) => {
  _notifications = _notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
};

// ---- Meter Readings ----
export const getMeterReadings = () => _meterReadings;
