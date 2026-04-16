import React, { createContext, useContext, useState } from "react";

interface BuildingContextType {
  selectedBuildingId: string;
  setSelectedBuildingId: (id: string) => void;
}

const BuildingContext = createContext<BuildingContextType | null>(null);

export const BuildingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("all");
  return (
    <BuildingContext.Provider value={{ selectedBuildingId, setSelectedBuildingId }}>
      {children}
    </BuildingContext.Provider>
  );
};

export const useBuilding = () => {
  const ctx = useContext(BuildingContext);
  if (!ctx) throw new Error("useBuilding must be used within BuildingProvider");
  return ctx;
};
