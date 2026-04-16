import React, { createContext, useContext, useState } from "react";
import { useAuth } from "./AuthContext";
import { getTenants, getContracts, getRooms, getBuildings } from "@/data/buildingStore";
import type { Tenant, Contract, Room, Building } from "@/data/mockData";

interface TenantContextType {
  tenant: Tenant | null;
  contract: Contract | null;
  room: Room | null;
  building: Building | null;
  refreshTenant: () => void;
}

const TenantContext = createContext<TenantContextType>({
  tenant: null, contract: null, room: null, building: null, refreshTenant: () => {},
});

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [, setTick] = useState(0);
  const refreshTenant = () => setTick(t => t + 1);

  const tenant = user?.role === "tenant"
    ? getTenants().find(t => t.name === user.name || t.id === user.id) ?? null
    : null;

  const contract = tenant
    ? getContracts().find(c => c.tenantId === tenant.id && c.status === "active") ?? null
    : null;

  const room = tenant?.roomId
    ? getRooms().find(r => r.id === tenant.roomId) ?? null
    : null;

  const building = room
    ? getBuildings().find(b => b.id === room.buildingId) ?? null
    : null;

  return (
    <TenantContext.Provider value={{ tenant, contract, room, building, refreshTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
