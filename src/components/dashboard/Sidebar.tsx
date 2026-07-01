"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/logo.png";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  ShieldAlert, 
  User as UserIcon,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Dynamic Navigation based on Role
  const getNavigation = () => {
    if (user?.role === "admin") {
      return [
        { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
        { name: "Gestión de Estudiantes", href: "/students", icon: Users },
        { name: "Analíticas Globales", href: "/admin/analytics", icon: BarChart3 },
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
    <div className="flex h-full w-64 flex-col border-r border-border bg-[#141127] font-sans transition-colors duration-200">
      {/* Brand Logo */}
      <div className="flex flex-col justify-center h-28 px-8">
        <Link href="/dashboard" className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <Image src={Logo} alt="Folium Logo" width={32} height={32} className="object-contain" priority />
            <span className="font-tactic text-2xl font-black text-[#ED6C31] tracking-wider leading-none">
              folium.
            </span>
          </div>
          <span className="text-[11px] text-muted font-medium mt-1.5 tracking-wide">
            {user?.role === "admin" ? "Administrador" : "Estudiante"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-grow space-y-2 px-4 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-[#273E92] text-white"
                  : "text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-muted"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Nav */}
      <div className="px-4 py-6 border-t border-border space-y-2">
        <Link
          href="#"
          className="flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-alt hover:text-foreground rounded-lg transition-colors"
        >
          <HelpCircle className="h-4.5 w-4.5 text-muted" />
          <span>Centro de ayuda</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3.5 px-4 py-2.5 text-sm font-medium text-muted hover:bg-surface-alt hover:text-foreground rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 text-muted" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}
