import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { type Notification } from "@/data/mockData";
import { getNotifications, markNotificationRead } from "@/data/buildingStore";
import { useTenant } from "@/contexts/TenantContext";
import { cn } from "@/lib/utils";

const TenantNotifications = () => {
  const { room } = useTenant();
  const [list, setList] = useState<Notification[]>(() =>
    getNotifications().filter(n => n.target === "all" || n.target === room?.id)
  );

  const markRead = (id: string) => {
    markNotificationRead(id);
    setList(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="min-h-screen bg-background bottom-nav-safe">
      <PageHeader title="Thông báo" />
      <div className="p-4 space-y-2">
        {list.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">Chưa có thông báo nào</p>
        )}
        {list.map(n => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            className={cn("glass-card rounded-xl p-4 cursor-pointer", !n.isRead && "border-l-4 border-l-primary")}
          >
            <div className="flex justify-between items-start">
              <p className="font-semibold text-sm">{n.title}</p>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{n.createdAt}</p>
            <p className="text-sm mt-2 text-foreground">{n.content}</p>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default TenantNotifications;
