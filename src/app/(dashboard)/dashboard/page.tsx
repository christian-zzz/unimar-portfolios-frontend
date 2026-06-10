"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Edit3, 
  Globe, 
  BarChart3, 
  Loader2, 
  ArrowRight, 
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!user) {
    return null; // Redirected by AuthContext
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Dynamic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8 md:p-10 transition-colors duration-200">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-brand/5 blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-brand-light text-brand border border-brand/10 dark:bg-brand-light/10">
            <Sparkles className="h-3 w-3" />
            <span>Plataforma UNIMAR</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
            ¡Hola, {user.name}!
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {isAdmin 
              ? "Bienvenido al Panel de Administración. Aquí puedes gestionar a los estudiantes de la carrera y supervisar la configuración general de la plataforma."
              : "Bienvenido a tu espacio creativo de diseño. Aquí puedes dar vida a tu portafolio personal, revisar tus analíticas y optimizar la auditoría de rendimiento de tu sitio."
            }
          </p>
        </div>
      </div>

      {/* Dynamic CTA Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Accesos Directos y Módulos
        </h3>
        
        {isAdmin ? (
          // Admin Grid of CTA Cards (Only active modules)
          <div className="max-w-md">
            <Link 
              href="/students"
              className="group flex flex-col justify-between p-6 bg-surface border border-border hover:border-brand rounded-2xl transition duration-150 shadow-xs cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Gestión de Estudiantes
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Crea y gestiona cuentas de estudiantes en la plataforma. Los estudiantes podrán acceder para inicializar sus portafolios.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-brand mt-6">
                <span>Ir al registro de estudiantes</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        ) : (
          // Student Grid of CTA Cards
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CTA 1: Open Visual Editor */}
            <div className="flex flex-col justify-between p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Abrir Editor Visual
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Accede a tu lienzo interactivo para diseñar tu portafolio.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-brand mt-6">
                Disponible al inicializar lienzo
              </div>
            </div>

            {/* CTA 2: Configure Domain */}
            <div className="flex flex-col justify-between p-6 bg-surface border border-border rounded-2xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Configurar URL
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Personaliza tu URL institucional.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 mt-6">
                Lienzo requerido
              </div>
            </div>

            {/* CTA 3: View Analytics */}
            <Link 
              href="/analytics"
              className="group flex flex-col justify-between p-6 bg-surface border border-border hover:border-brand rounded-2xl relative overflow-hidden transition duration-150 cursor-pointer shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    Ver Analíticas
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Explora métricas de visitas de tu sitio.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-indigo-600 mt-6">
                <span>Ver métricas de tu sitio</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

          </div>
        )}
      </div>

    </div>
  );
}
