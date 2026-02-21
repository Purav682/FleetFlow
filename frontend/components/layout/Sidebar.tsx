"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, BarChart3, Droplets, Fuel, Navigation, Truck, Users, Wrench, X } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { PermissionAction } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const navItems: Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; permission: PermissionAction }> = [
  { href: "/", label: "Dashboard", icon: BarChart3, permission: "reports.dashboard" },
  { href: "/vehicles", label: "Vehicles", icon: Truck, permission: "vehicles.read" },
  { href: "/drivers", label: "Drivers", icon: Users, permission: "drivers.read" },
  { href: "/dispatch", label: "Trips", icon: Navigation, permission: "trips.read" },
  { href: "/maintenance", label: "Maintenance", icon: Wrench, permission: "maintenance.read" },
  { href: "/fuel", label: "Fuel", icon: Fuel, permission: "fuel.read" },
  { href: "/reports", label: "Reports", icon: AlertTriangle, permission: "reports.advanced" },
];

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermissions();

  const visibleItems = navItems.filter((item) => can(item.permission));

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FleetFlow</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto md:px-4 md:py-6">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 md:p-6 text-xs text-sidebar-foreground/60">
        <p>FleetFlow API UI</p>
      </div>
    </div>
  );
}
