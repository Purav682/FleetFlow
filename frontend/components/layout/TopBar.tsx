"use client";

import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function TopBar({ title = "Dashboard", onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("")
    : "FF";

  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {mounted && (
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        )}

        <div className="px-2 py-1 text-sm rounded bg-muted">{user?.role || "Guest"}</div>
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-semibold">{initials}</div>

        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
