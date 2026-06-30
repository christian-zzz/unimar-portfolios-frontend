"use client";

import { useEffect, useState } from "react";
import { Menu, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "next-themes";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();
  const { setTheme } = useTheme();
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

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-transparent px-6 font-sans transition-colors duration-200">
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
      </div>

      {/* Right side: Actions, Profile & Logout */}
      <div className="flex items-center gap-6">
        
        {/* Dark/Light mode toggle */}
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme("dark")} // Lock to dark for Figma parities
            className="p-2 text-muted hover:text-foreground hover:bg-surface-alt rounded-lg transition-colors cursor-pointer"
            aria-label="Cambiar tema"
          >
            <Moon className="h-4 w-4 text-brand-ice" />
          </button>
        )}

        <div className="h-4 w-px bg-border" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-full bg-zinc-800 border border-border flex items-center justify-center overflow-hidden">
            <span className="text-xs font-mono font-bold text-muted uppercase">
              {getInitials(displayName)}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-none">
              {displayName}
            </p>
            <p className="text-[10px] text-muted mt-0.5 leading-none">
              {displayEmail}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
