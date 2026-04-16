import { servicePackages as mockPackages, type ServicePackage } from "./mockData";

export interface LandlordSubscription {
  landlordId: string;
  landlordName: string;
  email: string;
  packageId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "pending";
  rooms: number;
}

let _packages: ServicePackage[] = [...mockPackages];

let _subscriptions: LandlordSubscription[] = [
  { landlordId: "l1", landlordName: "Nguyễn Văn An", email: "chutro@demo.com", packageId: "sp2", startDate: "2026-01-01", endDate: "2026-12-31", status: "active", rooms: 8 },
  { landlordId: "l2", landlordName: "Nguyễn Thanh Hùng", email: "hung@demo.com", packageId: "sp3", startDate: "2026-02-01", endDate: "2027-02-01", status: "active", rooms: 15 },
  { landlordId: "l3", landlordName: "Lê Thị Mai", email: "mai@demo.com", packageId: "sp1", startDate: "2026-03-01", endDate: "2026-04-01", status: "expired", rooms: 5 },
  { landlordId: "l4", landlordName: "Phạm Quốc Bảo", email: "bao@demo.com", packageId: "sp1", startDate: "2026-03-15", endDate: "2026-04-15", status: "pending", rooms: 3 },
];

// ---- Packages ----
export const getPackages = () => _packages;

export const addPackage = (pkg: ServicePackage) => {
  _packages = [..._packages, pkg];
};

export const updatePackage = (id: string, data: Partial<ServicePackage>) => {
  _packages = _packages.map(p => p.id === id ? { ...p, ...data } : p);
};

export const deletePackage = (id: string) => {
  _packages = _packages.filter(p => p.id !== id);
};

// ---- Subscriptions ----
export const getSubscriptions = () => _subscriptions;

export const getMySubscription = (landlordId: string) =>
  _subscriptions.find(s => s.landlordId === landlordId);

export const upsertSubscription = (sub: LandlordSubscription) => {
  const exists = _subscriptions.find(s => s.landlordId === sub.landlordId);
  if (exists) {
    _subscriptions = _subscriptions.map(s => s.landlordId === sub.landlordId ? sub : s);
  } else {
    _subscriptions = [..._subscriptions, sub];
  }
};
