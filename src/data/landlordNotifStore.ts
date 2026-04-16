export type LandlordNotifType =
  | "payment_pending"   // Khách xác nhận chuyển khoản
  | "incident_new"      // Khách báo sự cố mới
  | "contract_expiring" // Hợp đồng sắp hết hạn

export interface LandlordNotif {
  id: string;
  type: LandlordNotifType;
  title: string;
  body: string;
  roomName: string;
  tenantName: string;
  refId: string; // invoiceId / incidentId / contractId
  isRead: boolean;
  createdAt: string;
}

let _notifs: LandlordNotif[] = [];

export const getLandlordNotifs = () => _notifs;
export const getUnreadCount = () => _notifs.filter(n => !n.isRead).length;

export const addLandlordNotif = (n: Omit<LandlordNotif, "id" | "createdAt" | "isRead">) => {
  _notifs = [{
    ...n,
    id: `ln${Date.now()}`,
    createdAt: new Date().toISOString().slice(0, 10),
    isRead: false,
  }, ..._notifs];
};

export const markLandlordNotifRead = (id: string) => {
  _notifs = _notifs.map(n => n.id === id ? { ...n, isRead: true } : n);
};

export const markAllRead = () => {
  _notifs = _notifs.map(n => ({ ...n, isRead: true }));
};

export const deleteLandlordNotif = (id: string) => {
  _notifs = _notifs.filter(n => n.id !== id);
};
