"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Users, 
  Eye, 
  ArrowLeft,
  Loader2, 
  AlertCircle,
  TrendingUp,
  Percent,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface DailyData {
  date: string;
  users: number;
  views: number;
}

interface AnalyticsData {
  totals: {
    activeUsers: number;
    screenPageViews: number;
    bounceRate: string;
  };
  daily: DailyData[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/analytics/report`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || resData.message || "Error al obtener las analíticas simuladas.");
      }

      setData(resData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado al procesar la solicitud.");
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch report automatically on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    fetchReport();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      
      {/* Header and Back Button */}
      <div className="space-y-2">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Volver al Inicio
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#2A2640] pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Analíticas del Portafolio
            </h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Visualización interactiva en tiempo real sobre el tráfico y comportamiento de visitas de tu portafolio.
            </p>
          </div>
          
          <button
            type="button"
            onClick={fetchReport}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2.5 text-xs font-bold text-white bg-[#273E92] hover:bg-[#273E92]/95 border border-[#2A2640] rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Actualizar Datos
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center bg-[#1C1835] border border-[#2A2640] rounded-3xl p-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mb-4" />
          <p className="text-sm font-semibold text-white">
            Cargando analíticas...
          </p>
          <p className="text-xs text-muted mt-1">
            Conectando con la API y estructurando los datos de rendimiento.
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center bg-[#1C1835] border border-[#2A2640] rounded-3xl p-12 text-center">
          <div className="h-12 w-12 rounded-2xl bg-red-950/20 text-red-400 flex items-center justify-center mb-4 border border-red-900/35">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Error de Conexión
          </h3>
          <p className="text-xs text-muted max-w-md mt-2 leading-relaxed">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchReport}
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#273E92] hover:bg-[#273E92]/95 rounded-xl shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar Conexión
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6 animate-slide-down">
          
          {/* Card Summary Hub (3 Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1: Active Users */}
            <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B]">
                    Usuarios Activos (15 días)
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {data.totals.activeUsers}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-[#ED6C31]" />
                    Visitantes únicos interactuando
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white flex items-center justify-center">
                  <Users className="h-5.5 w-5.5 text-[#ED6C31]" />
                </div>
              </div>
            </div>

            {/* Metric 2: Page Views */}
            <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B]">
                    Vistas de Página (15 días)
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {data.totals.screenPageViews}
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-[#ED6C31]" />
                    Visualizaciones totales de contenido
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white flex items-center justify-center">
                  <Eye className="h-5.5 w-5.5 text-[#ED6C31]" />
                </div>
              </div>
            </div>

            {/* Metric 3: Bounce Rate */}
            <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] rounded-2xl p-6 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B]">
                    Tasa de Rebote
                  </p>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {data.totals.bounceRate}
                  </h3>
                  <p className="text-[10px] text-muted font-semibold flex items-center gap-1 mt-1">
                    Porcentaje de sesiones de una sola página
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white flex items-center justify-center">
                  <Percent className="h-5.5 w-5.5 text-[#ED6C31]" />
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Chart Container */}
          <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6 transition-colors duration-200">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tráfico de Audiencia (Últimos 15 días)
                </h3>
                <p className="text-xs text-muted">
                  Evolución diaria de visitas y usuarios únicos registrados.
                </p>
              </div>
              <div className="pt-2 md:pt-0 text-[10px] text-muted">
                Visualizando datos para: <strong className="text-white">{user?.name}</strong>
              </div>
            </div>

            <div className="w-full h-80">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.daily}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#141127',
                        borderRadius: '12px',
                        border: '1px solid #2A2640',
                        fontSize: '11px',
                        color: '#ffffff'
                      }}
                      labelClassName="font-bold text-white"
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36} 
                      iconSize={10}
                      style={{ fontSize: '11px' }}
                    />
                    <Bar 
                      name="Usuarios Únicos"
                      dataKey="users" 
                      fill="#ED6C31" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      name="Páginas Vistas"
                      dataKey="views" 
                      fill="#273E92" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
              )}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
