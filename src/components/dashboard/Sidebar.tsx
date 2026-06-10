"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Dynamic Navigation based on Role
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
      { name: "Mi Portafolio", href: "#", icon: BookOpen },
      { name: "Analíticas (GA4)", href: "/analytics", icon: BarChart3 },
      { name: "Auditoría (Lighthouse)", href: "/audit", icon: ShieldAlert },
      { name: "Perfil", href: "/profile", icon: UserIcon },
      { name: "Configuración", href: "#", icon: Settings },
    ];
  };

  const navigation = getNavigation();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface font-sans transition-colors duration-200">
      {/* Brand Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Compass className="h-6 w-6 text-brand" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-foreground">
            UNIMAR Portfolios
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-1.5 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
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
  );
}
