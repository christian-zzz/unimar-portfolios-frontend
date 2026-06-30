"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Edit3, 
  Globe, 
  BarChart3, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  Image as ImageIcon,
  Cloud
} from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<{
    total_students: number;
    published_portfolios: number;
    draft_portfolios: number;
    total_files: number;
    categories_breakdown: Array<{ name: string; slug: string; count: number }>;
    storage_cloudinary: number;
    storage_r2: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    const fetchStats = async () => {
      setIsLoadingStats(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${apiUrl}/api/admin/stats`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAdmin, apiUrl]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

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

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Dynamic Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#2A2640] bg-gradient-to-b from-[#1C1835] to-[#141127] p-6 sm:p-8 md:p-10 transition-colors duration-200">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-[#273E92]/10 blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-[#273E92]/20 text-white border border-[#273E92]/30">
            <Sparkles className="h-3 w-3 text-[#ED6C31]" />
            <span>Plataforma UNIMAR</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
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

      {/* Metrics Cards Section (from Figma) only on Admin Home Page / Dashboard */}
      {isAdmin && (
        <div className="space-y-6">
          {isLoadingStats || !stats ? (
            <div className="flex h-32 items-center justify-center bg-[#1C1835] border border-[#2A2640] rounded-2xl">
              <Loader2 className="h-6 w-6 animate-spin text-[#ED6C31]" />
            </div>
          ) : (
            <>
              {/* Top Row: 4 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Students */}
                <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-6 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Users className="h-3.5 w-3.5 text-[#ED6C31]" />
                    <span className="text-[#8E8D9B] text-xs font-medium font-sans">Estudiantes Registrados</span>
                  </div>
                  <p className="text-4xl font-bold mt-5 font-sans text-white tracking-tight">{stats.total_students}</p>
                </div>

                {/* 2. Published */}
                <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-6 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Globe className="h-3.5 w-3.5 text-[#ED6C31]" />
                    <span className="text-[#8E8D9B] text-xs font-medium font-sans">Portafolios Publicados</span>
                  </div>
                  <p className="text-4xl font-bold mt-5 font-sans text-white tracking-tight">{stats.published_portfolios}</p>
                </div>

                {/* 3. Drafts */}
                <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-6 rounded-2xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Edit3 className="h-3.5 w-3.5 text-[#ED6C31]" />
                    <span className="text-[#8E8D9B] text-xs font-medium font-sans">Portafolios Borradores</span>
                  </div>
                  <p className="text-4xl font-bold mt-5 font-sans text-white tracking-tight">{stats.draft_portfolios}</p>
                </div>

                {/* 4. Top Categories List */}
                <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold border-b border-[#2A2640]/60 pb-2 mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-[#ED6C31]" />
                      <span className="text-[#8E8D9B] text-xs font-medium font-sans">Top Categorías</span>
                    </div>
                    
                    <div className="space-y-2">
                      {stats.categories_breakdown && stats.categories_breakdown.length > 0 ? (
                        stats.categories_breakdown.slice(0, 4).map((cat) => (
                          <div key={cat.slug} className="flex justify-between items-center text-xs">
                            <span className="text-white font-medium truncate max-w-[130px]" title={cat.name}>
                              {cat.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#141127] text-[#FFB598] border border-[#2A2640]/50 shrink-0">
                              {cat.count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">Sin registros</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Split Storage & Total Files */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Storage Card */}
                <div className="lg:col-span-2 bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-6 rounded-2xl space-y-6">
                  <div className="flex items-center gap-2 text-xs font-semibold border-b border-[#2A2640]/60 pb-3">
                    <Cloud className="h-4 w-4 text-[#ED6C31]" />
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Cuotas de Almacenamiento</span>
                  </div>
                  
                  {/* Cloudinary Split Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-[#FFB598]">Imágenes y Miniaturas (Cloudinary)</span>
                      <span className="text-white">{formatBytes(stats.storage_cloudinary)} / 1 GB</span>
                    </div>
                    <div className="w-full bg-[#211D3B] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          (stats.storage_cloudinary / 1073741824) > 0.85 ? "bg-red-500" : "bg-[#C5E4E4]"
                        }`} 
                        style={{ width: `${Math.min(100, (stats.storage_cloudinary / 1073741824) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Cloudflare R2 Split Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-[#FFB598]">Videos y Recursos Pesados (Cloudflare R2)</span>
                      <span className="text-white">{formatBytes(stats.storage_r2)} / 10 GB</span>
                    </div>
                    <div className="w-full bg-[#211D3B] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          (stats.storage_r2 / 10737418240) > 0.85 ? "bg-red-500" : "bg-[#C5E4E4]"
                        }`} 
                        style={{ width: `${Math.min(100, (stats.storage_r2 / 10737418240) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Total Uploaded Files Card */}
                <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-[#ED6C31]/5 blur-2xl" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <ImageIcon className="h-3.5 w-3.5 text-[#ED6C31]" />
                      <span className="text-[#8E8D9B] text-xs font-medium font-sans">Archivos en Biblioteca</span>
                    </div>
                    <p className="text-5xl font-bold mt-5 font-sans text-white tracking-tight">{stats.total_files}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-semibold pt-1">
                      Total de recursos multimedia subidos por estudiantes para el maquetador.
                    </p>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* Dynamic CTA Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
          Accesos Directos y Módulos
        </h3>
        
        {isAdmin ? (
          // Admin Grid of CTA Cards (Only active modules)
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/students"
              className="group flex flex-col justify-between p-6 bg-[#1b1731] border border-[#2A2640] hover:border-[#273E92] rounded-2xl transition duration-150 shadow-xs cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white">
                  <Users className="h-5 w-5 text-[#ED6C31]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Gestión de Estudiantes
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Crea y gestiona cuentas de estudiantes en la plataforma. Los estudiantes podrán acceder para inicializar sus portafolios.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#ED6C31] mt-6">
                <span>Ir al registro de estudiantes</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </div>
        ) : (
          // Student Grid of CTA Cards
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CTA 1: Open Visual Editor */}
            <Link 
              href="/portfolio"
              className="group flex flex-col justify-between p-6 bg-[#1b1731] border border-border hover:border-[#273E92] rounded-2xl relative overflow-hidden transition duration-150 cursor-pointer shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white">
                  <Edit3 className="h-5 w-5 text-[#ED6C31]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Mi Portafolio
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Accede a tu lienzo interactivo, gestiona medios y configura tu URL.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#ED6C31] mt-6">
                <span>Gestionar portafolio</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* CTA 2: Configure Domain */}
            <div className="flex flex-col justify-between p-6 bg-[#1b1731] border border-border rounded-2xl relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#273E92]/10 border border-[#273E92]/20 text-white">
                  <Globe className="h-5 w-5 text-[#C5E4E4]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Configurar URL
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Personaliza tu URL institucional.
                  </p>
                </div>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-muted mt-6">
                Lienzo requerido
              </div>
            </div>

            {/* CTA 3: View Analytics */}
            <Link 
              href="/analytics"
              className="group flex flex-col justify-between p-6 bg-[#1b1731] border border-border hover:border-[#273E92] rounded-2xl relative overflow-hidden transition duration-150 cursor-pointer shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white">
                  <BarChart3 className="h-5 w-5 text-[#ED6C31]" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">
                    Ver Analíticas
                  </h4>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Explora métricas de visitas de tu sitio.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#ED6C31] mt-6">
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
