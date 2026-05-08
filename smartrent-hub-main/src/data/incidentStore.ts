import { incidents as mockIncidents, type Incident } from "./mockData";

// Module-level shared store (simulates a backend)
let _incidents: Incident[] = [...mockIncidents];

export const getIncidents = () => _incidents;

export const addIncident = (inc: Incident) => {
  _incidents = [inc, ..._incidents];
};

export const updateIncidentStatus = (id: string, status: Incident["status"]) => {
  // Khi chủ cập nhật → đánh dấu khách chưa đọc
  _incidents = _incidents.map(i => i.id === id ? { ...i, status, isReadByTenant: false } : i);
};

export const markIncidentReadByTenant = (id: string) => {
  _incidents = _incidents.map(i => i.id === id ? { ...i, isReadByTenant: true } : i);
};

export const deleteIncident = (id: string) => {
  _incidents = _incidents.filter(i => i.id !== id);
};
