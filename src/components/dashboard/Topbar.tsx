"use client";

import { useEffect, useState } from "react";
import { Menu, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting until mounted
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Get user initials (e.g. Jane Doe -> JD)
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const displayName = user?.name || "Usuario";
  const displayEmail = user?.email || "";
  const displayTitle = user?.role === "admin" ? "Panel de Administración" : "Espacio de Trabajo";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6 font-sans transition-colors duration-200">
      {/* Left side: Mobile Hamburger & Dynamic Page Context */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-1.5 text-muted hover:text-foreground hover:bg-surface-alt rounded-lg lg:hidden transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-200">
          {displayTitle}
        </h1>
      </div>

      {/* Right side: Actions, Profile & Logout */}
      <div className="flex items-center gap-6">
        
        {/* Dark/Light mode toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-muted hover:text-foreground hover:bg-surface-alt rounded-lg transition-colors cursor-pointer"
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        )}

        <div className="h-4 w-px bg-border" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-border flex items-center justify-center overflow-hidden">
            <span className="text-xs font-mono font-bold text-muted uppercase">
              {getInitials(displayName)}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
              {displayName}
            </p>
            <p className="text-[10px] text-muted mt-0.5 leading-none">
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />

        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-2 text-xs font-medium text-muted hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
}
