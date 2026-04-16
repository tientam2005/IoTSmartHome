import { ArrowLeft, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { getBuildings } from "@/data/buildingStore";
import { useState, useRef, useEffect } from "react";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showLogout?: boolean;
  showBuildingSelector?: boolean;
  rightAction?: React.ReactNode;
}

const PageHeader = ({ title, showBack, showLogout, showBuildingSelector, rightAction }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { selectedBuildingId, setSelectedBuildingId } = useBuilding();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const buildings = getBuildings();
  const selectedName = selectedBuildingId === "all"
    ? "Tất cả khu"
    : buildings.find(b => b.id === selectedBuildingId)?.name ?? "Tất cả khu";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {rightAction}
          {(showLogout || showBack) && (
            <button onClick={() => { logout(); navigate("/"); }} className="p-2 rounded-full hover:bg-primary-foreground/10">
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Building selector bar */}
      {showBuildingSelector && buildings.length > 0 && (
        <div className="px-4 pb-2.5 flex items-center gap-2" ref={ref}>
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-foreground/15 hover:bg-primary-foreground/25 transition text-xs font-medium"
            >
              <span>{selectedName}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute top-full left-0 mt-1 bg-card text-foreground rounded-xl shadow-lg border border-border overflow-hidden z-50 min-w-[160px]">
                <button
                  onClick={() => { setSelectedBuildingId("all"); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition ${selectedBuildingId === "all" ? "font-semibold text-primary" : ""}`}
                >
                  Tất cả khu
                </button>
                {buildings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setSelectedBuildingId(b.id); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition border-t border-border ${selectedBuildingId === b.id ? "font-semibold text-primary" : ""}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedBuildingId !== "all" && (
            <span className="text-[11px] text-primary-foreground/60 truncate">
              {buildings.find(b => b.id === selectedBuildingId)?.address}
            </span>
          )}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
