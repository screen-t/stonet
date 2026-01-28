import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  MessageSquare,
  Building2,
  Bookmark,
  Settings,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { icon: Home, label: "Feed", href: "/feed" },
  { icon: Users, label: "Network", href: "/network" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: Building2, label: "Companies", href: "/companies" },
  { icon: Bookmark, label: "Saved", href: "/saved" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card hidden lg:block">
      <div className="flex flex-col h-full py-6">
        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Trending Section */}
        <div className="px-4 py-4 mx-3 rounded-lg bg-secondary/50 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Trending</span>
          </div>
          <div className="space-y-2">
            {["#AIStartups", "#RemoteWork", "#TechLeadership"].map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="px-3 border-t border-border pt-4">
          {bottomItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
