import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Users, MessageSquare, Bell, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { backendApi } from "@/lib/backend-api";

const navItems = [
  { icon: Home, label: "Feed", href: "/feed" },
  { icon: Users, label: "Network", href: "/network" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Bell, label: "Alerts", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
];

export const BottomNav = () => {
  const location = useLocation();

  const { data: messageCount } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: () => backendApi.messages.getUnreadCount(),
    refetchInterval: 30000,
  });

  const { data: notificationCount } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: () => backendApi.notifications.getUnreadCount(),
    refetchInterval: 30000,
  });

  const unreadMessages = messageCount?.count || 0;
  const unreadNotifications = notificationCount?.count || 0;

  const getBadge = (href: string) => {
    if (href === "/messages" && unreadMessages > 0) return unreadMessages;
    if (href === "/notifications" && unreadNotifications > 0) return unreadNotifications;
    return null;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14 px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const badge = getBadge(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-lg transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
