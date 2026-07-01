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
  RefreshCw,
  Monitor,
  Globe,
  MapPin,
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
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyData {
  date: string;
  users: number;
  views: number;
  newUsers: number;
  avgDuration: number;
}

interface DeviceItem {
  name: string;
  value: number;
}

interface SourceItem {
  name: string;
  users: number;
}

interface CountryItem {
  name: string;
  users: number;
}

interface AnalyticsData {
  totals: {
    activeUsers: number;
    screenPageViews: number;
    bounceRate: string;
    newUsers: number;
    averageSessionDuration: number;
  };
  daily: DailyData[];
  devices: DeviceItem[];
  sources: SourceItem[];
  countries: CountryItem[];
}

const CHART_COLORS = ["#ED6C31", "#273E92", "#C5E4E4", "#8E8D9B", "#FFB598"];
const TOOLTIP_STYLE = {
  backgroundColor: '#141127',
  borderRadius: '12px',
  border: '1px solid #2A2640',
  fontSize: '11px',
  color: '#ffffff',
};

function SummaryCard({ label, value, subtext, icon: Icon }: { label: string; value: string | number; subtext: string; icon: React.ElementType }) {
  return (
    <div className="bg-gradient-to-b from-[#1C1835] to-[#141127] border border-[#2A2640] rounded-2xl p-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B] truncate">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {value}
          </h3>
          <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-[#ED6C31] shrink-0" />
            <span className="truncate">{subtext}</span>
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white flex items-center justify-center shrink-0 ml-3">
          <Icon className="h-5.5 w-5.5 text-[#ED6C31]" />
        </div>
      </div>
    </div>
  );
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
        throw new Error(resData.error || resData.message || "Error al obtener las analíticas.");
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

  useEffect(() => {
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
              Visualización en tiempo real sobre el tráfico y comportamiento de visitas de tu portafolio.
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
            Conectando con Google Analytics y estructurando los datos de rendimiento.
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
          
          {/* Row 1: Summary Cards (5 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <SummaryCard
              label="Usuarios Activos (15d)"
              value={data.totals.activeUsers}
              subtext="Visitantes únicos"
              icon={Users}
            />
            <SummaryCard
              label="Vistas de Página (15d)"
              value={data.totals.screenPageViews}
              subtext="Visualizaciones totales"
              icon={Eye}
            />
            <SummaryCard
              label="Tasa de Rebote"
              value={data.totals.bounceRate}
              subtext="Sesiones de una sola página"
              icon={Percent}
            />
            <SummaryCard
              label="Nuevos Usuarios"
              value={data.totals.newUsers}
              subtext="Primera visita"
              icon={Users}
            />
            <SummaryCard
              label="Duración Media"
              value={formatDuration(data.totals.averageSessionDuration)}
              subtext="Tiempo por sesión"
              icon={TrendingUp}
            />
          </div>

          {/* Row 2: Daily Traffic Chart */}
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
                Datos para: <strong className="text-white">{user?.name}</strong>
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
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelClassName="font-bold text-white" />
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

          {/* Row 3: Bottom Grid — Devices, Sources, Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Devices PieChart */}
            <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-4 w-4 text-[#ED6C31]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Dispositivos
                </h3>
              </div>
              {data.devices.length > 0 ? (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.devices}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {data.devices.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend
                        verticalAlign="bottom"
                        height={28}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value: string) => (
                          <span className="text-[11px] text-[#E5DEFE]">{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-muted">
                  Sin datos de dispositivos
                </div>
              )}
            </div>

            {/* Traffic Sources */}
            <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-[#ED6C31]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Fuentes de Tráfico
                </h3>
              </div>
              {data.sources.length > 0 ? (
                <div className="space-y-2">
                  {data.sources.map((source, idx) => {
                    const maxUsers = Math.max(...data.sources.map(s => s.users));
                    const pct = maxUsers > 0 ? (source.users / maxUsers) * 100 : 0;
                    return (
                      <div key={source.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#E5DEFE] font-medium capitalize truncate">
                            {source.name}
                          </span>
                          <span className="text-white font-bold">{source.users}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#2A2640] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-muted">
                  Sin datos de fuentes
                </div>
              )}
            </div>

            {/* Countries */}
            <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-[#ED6C31]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ubicaciones
                </h3>
              </div>
              {data.countries.length > 0 ? (
                <div className="space-y-1">
                  {data.countries.slice(0, 6).map((country, idx) => (
                    <div
                      key={country.name}
                      className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#2A2640]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs">{getFlag(country.name)}</span>
                        <span className="text-xs text-[#E5DEFE] font-medium truncate">
                          {country.name}
                        </span>
                      </div>
                      <span className="text-xs text-white font-bold shrink-0">{country.users}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-muted">
                  Sin datos de ubicaciones
                </div>
              )}
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}m ${sec}s`;
}

function getFlag(countryName: string): string {
  const flags: Record<string, string> = {
    "Venezuela": "🇻🇪",
    "United States": "🇺🇸",
    "Mexico": "🇲🇽",
    "Colombia": "🇨🇴",
    "Spain": "🇪🇸",
    "Argentina": "🇦🇷",
    "Chile": "🇨🇱",
    "Peru": "🇵🇪",
    "Ecuador": "🇪🇨",
    "Brazil": "🇧🇷",
    "Dominican Republic": "🇩🇴",
    "Costa Rica": "🇨🇷",
    "Panama": "🇵🇦",
    "Uruguay": "🇺🇾",
    "Guatemala": "🇬🇹",
    "Honduras": "🇭🇳",
    "Bolivia": "🇧🇴",
    "Paraguay": "🇵🇾",
    "El Salvador": "🇸🇻",
    "Nicaragua": "🇳🇮",
    "Canada": "🇨🇦",
    "United Kingdom": "🇬🇧",
    "Germany": "🇩🇪",
    "France": "🇫🇷",
    "Italy": "🇮🇹",
    "Portugal": "🇵🇹",
    "Netherlands": "🇳🇱",
    "Japan": "🇯🇵",
    "China": "🇨🇳",
    "India": "🇮🇳",
  };
  return flags[countryName] || "🌍";
}
