"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  X, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldAlert, 
  Compass,
  User as UserIcon,
  Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  
  if (!isOpen) return null;

  const getNavigation = () => {
    if (user?.role === "admin") {
      return [
        { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
        { name: "Gestión de Estudiantes", href: "/students", icon: Users },
        { name: "Perfil", href: "/profile", icon: UserIcon },
        { name: "Configuración", href: "#", icon: Settings },
      ];
    }
    
    // Student navigation
    return [
      { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
      { name: "Mi Portafolio", href: "/portfolio", icon: BookOpen },
      { name: "Analíticas (GA4)", href: "/analytics", icon: BarChart3 },
      { name: "Auditoría (Lighthouse)", href: "/audit", icon: ShieldAlert },
      { name: "Perfil", href: "/profile", icon: UserIcon },
      { name: "Configuración", href: "#", icon: Settings },
    ];
  };

  const navigation = getNavigation();

  return (
    <div className="fixed inset-0 z-50 lg:hidden font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-surface shadow-2xl transition-transform duration-300">
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <Compass className="h-6 w-6 text-brand" />
            <span className="font-mono text-xs uppercase tracking-widest font-bold text-foreground">
              UNIMAR Portfolios
            </span>
          </Link>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground rounded-lg transition-colors hover:bg-surface-alt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-light text-brand dark:bg-brand-light/20 dark:text-brand"
                    : "text-muted hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand" : "text-muted"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
