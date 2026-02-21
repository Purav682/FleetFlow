'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Users, RotateCcw, BarChart3, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: BarChart3,
  },
  {
    href: '/vehicles',
    label: 'Vehicles',
    icon: Truck,
  },
  {
    href: '/drivers',
    label: 'Drivers',
    icon: Users,
  },
  {
    href: '/dispatch',
    label: 'Dispatch',
    icon: RotateCcw,
  },
];

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">FleetFlow</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto md:px-4 md:py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 md:p-6">
        <div className="text-xs text-sidebar-foreground/60">
          <p>FleetFlow v1.0</p>
          <p>© 2024 Fleet Management</p>
        </div>
      </div>
    </div>
  );
}
