"use client";

import React, { useState } from "react";
import { 
  Loader2, 
  AlertCircle, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Eye, 
  EyeOff, 
  Globe,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  score: number;
}

type CategoryKey = "performance" | "accessibility" | "best-practices" | "seo";

interface CategoryState {
  status: "idle" | "loading" | "success" | "error";
  score: number | null;
  recommendations: Recommendation[];
  error: string | null;
  raw: Record<string, unknown> | null;
}

const CATEGORIES: { key: CategoryKey; title: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { key: "performance", title: "Rendimiento", icon: Zap, color: "text-amber-500" },
  { key: "accessibility", title: "Accesibilidad", icon: Activity, color: "text-indigo-500" },
  { key: "best-practices", title: "Buenas Prácticas", icon: ShieldCheck, color: "text-emerald-500" },
  { key: "seo", title: "SEO", icon: Globe, color: "text-sky-500" },
];

const CATEGORY_NAMES = {
  performance: { title: "Optimización de Rendimiento", icon: Zap, color: "text-amber-500" },
  accessibility: { title: "Mejoras de Accesibilidad", icon: Activity, color: "text-indigo-500" },
  "best-practices": { title: "Buenas Prácticas de Desarrollo", icon: ShieldCheck, color: "text-emerald-500" },
  seo: { title: "Posicionamiento y SEO", icon: Globe, color: "text-sky-500" },
};

const INITIAL_CATEGORY_STATE: CategoryState = {
  status: "idle",
  score: null,
  recommendations: [],
  error: null,
  raw: null,
};

export default function AuditPage() {
  const [targetUrl, setTargetUrl] = useState("");
  const [showRawJson, setShowRawJson] = useState(false);

  // Individual category states to allow resilient parallel audits and retries
  const [states, setStates] = useState<Record<CategoryKey, CategoryState>>({
    performance: { ...INITIAL_CATEGORY_STATE },
    accessibility: { ...INITIAL_CATEGORY_STATE },
    "best-practices": { ...INITIAL_CATEGORY_STATE },
    seo: { ...INITIAL_CATEGORY_STATE },
  });

  // Execute audit for a single category
  const fetchCategory = async (url: string, category: CategoryKey) => {
    setStates((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        status: "loading",
        error: null,
      },
    }));

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/audit/run`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ url, category }),
      });

      const data = await response.json();

      if (response.ok) {
        setStates((prev) => ({
          ...prev,
          [category]: {
            status: "success",
            score: data.score,
            recommendations: data.recommendations,
            raw: data.raw,
            error: null,
          },
        }));
      } else {
        setStates((prev) => ({
          ...prev,
          [category]: {
            status: "error",
            score: null,
            recommendations: [],
            raw: data.details || null,
            error: data.message || `Fallo al procesar la categoría.`,
          },
        }));
      }
    } catch (error) {
      console.error(`Lighthouse audit failed for ${category}:`, error);
      setStates((prev) => ({
        ...prev,
        [category]: {
          status: "error",
          score: null,
          recommendations: [],
          raw: null,
          error: "Error de conexión. Intente de nuevo.",
        },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    // Fire parallel asynchronous requests for all 4 categories concurrently
    CATEGORIES.forEach((cat) => {
      fetchCategory(targetUrl, cat.key);
    });
  };

  // Helper to dynamically parse and render Markdown links [text](url) inside descriptions
  const renderDescriptionWithLinks = (text: string) => {
    if (!text) return "";
    
    // Regular expression to match [text](url)
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      // Add text before the match
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }
      // Add the clickable link with nice Tailwind design styles
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a
          key={matchIndex}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand hover:underline font-semibold"
        >
          {linkText}
        </a>
      );
      lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Helper to color scores according to Google Lighthouse thresholds
  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-zinc-400 border-zinc-200 dark:border-zinc-800";
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20";
    if (score >= 50) return "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 bg-amber-50/20";
    return "text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 bg-red-50/20";
  };

  // Check if any category is currently auditing
  const isAnyLoading = Object.values(states).some((s) => s.status === "loading");

  // Compile raw responses from succeeded categories for debug output
  const getCombinedRawJson = () => {
    const combined: Record<string, Record<string, unknown>> = {};
    (Object.keys(states) as CategoryKey[]).forEach((k) => {
      if (states[k].raw) {
        combined[k] = states[k].raw;
      }
    });
    return Object.keys(combined).length > 0 ? combined : null;
  };

  const rawJsonCombined = getCombinedRawJson();

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      {/* Header section */}
      <div className="border-b border-border pb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          Auditoría SEO y Rendimiento
        </h2>
        <p className="text-sm text-muted mt-1.5 leading-relaxed">
          Ingresa la URL pública de tu portafolio para iniciar una auditoría de rendimiento y optimización de PageSpeed.
        </p>
      </div>

      {/* Audit Configuration Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label htmlFor="targetUrl" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              URL del portafolio o sitio web
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="targetUrl"
                type="url"
                required
                disabled={isAnyLoading}
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://miportafolio.com"
                className="flex-1 text-sm text-slate-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-surface border border-border rounded-lg px-3.5 py-2.5 focus:outline-hidden focus:border-brand focus:ring-2 focus:ring-brand/10 transition duration-150 disabled:bg-zinc-50 dark:disabled:bg-zinc-800/50"
              />
              <button
                type="submit"
                disabled={isAnyLoading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover disabled:bg-brand/50 rounded-lg shadow-xs transition duration-150 cursor-pointer whitespace-nowrap"
              >
                {isAnyLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4" />
                    Ejecutar Auditoría
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Results View */}
      <div className="space-y-12">
        
        {/* Section 1: Scores Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Resultados de Lighthouse
          </h3>
          
          {/* Visual Grid of Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              const state = states[cat.key];
              const Icon = cat.icon;

              return (
                <div 
                  key={cat.key}
                  className={`border rounded-2xl p-6 flex flex-col items-center justify-center text-center transition duration-150 min-h-[170px] relative ${
                    state.status === "error" 
                      ? "border-red-200 dark:border-red-900 bg-red-50/20 text-red-600 dark:text-red-400"
                      : getScoreColor(state.score)
                  }`}
                >
                  <Icon className="h-5 w-5 mb-3 opacity-80" />
                  
                  {state.status === "loading" ? (
                    <div className="flex flex-col items-center justify-center gap-2 h-16">
                      <Loader2 className="h-6 w-6 animate-spin text-brand" />
                      <span className="text-[10px] text-muted">Auditando...</span>
                    </div>
                  ) : state.status === "error" ? (
                    <div className="flex flex-col items-center justify-center gap-2 h-16">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <button
                        type="button"
                        onClick={() => fetchCategory(targetUrl, cat.key)}
                        className="flex items-center gap-1 text-[10px] font-bold text-brand hover:underline cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3 animate-pulse" />
                        Reintentar
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center h-16 w-16 rounded-full border-4 border-current">
                      <span className="text-lg font-mono font-bold">{state.score ?? "N/A"}</span>
                    </div>
                  )}

                  <span className="text-xs font-semibold mt-3 text-slate-700 dark:text-slate-300">{cat.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Actionable Recommendations separated by Category */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
            Análisis y Oportunidades por Categoría
          </h3>

          <div className="space-y-8">
            {CATEGORIES.map((cat) => {
              const state = states[cat.key];
              const meta = CATEGORY_NAMES[cat.key];
              const Icon = meta.icon;

              if (state.status === "idle") return null;

              return (
                <div key={cat.key} className="space-y-3 animate-slide-down">
                  {/* Subheader */}
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Icon className={`h-4.5 w-4.5 ${meta.color}`} />
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {meta.title}
                    </h4>
                    
                    {state.status === "loading" ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-muted ml-auto bg-surface-alt px-2 py-0.5 rounded border border-border">
                        <Loader2 className="h-3 w-3 animate-spin text-brand" />
                        Analizando...
                      </span>
                    ) : state.status === "error" ? (
                      <span className="flex items-center gap-1.5 text-[10px] text-red-500 font-semibold ml-auto bg-red-50/50 dark:bg-red-950/10 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/30">
                        Fallo
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted ml-auto bg-surface-alt px-2 py-0.5 rounded border border-border">
                        Puntaje: {state.score ?? "N/A"}/100
                      </span>
                    )}
                  </div>

                  {state.status === "loading" ? (
                    // Loader Placeholder
                    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-6 text-xs text-muted">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-brand shrink-0" />
                      <span>Analizando el rendimiento técnico de tu lienzo...</span>
                    </div>
                  ) : state.status === "error" ? (
                    // Category Error Block
                    <div className="flex items-start justify-between gap-3 bg-red-50/30 border border-red-200/50 text-red-700 dark:bg-red-950/10 dark:border-red-900/20 dark:text-red-400 rounded-xl p-4 text-xs">
                      <div className="flex gap-2.5 items-start">
                        <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">Fallo en Auditoría:</span> {state.error || "La API de Google rechazó temporalmente esta solicitud."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fetchCategory(targetUrl, cat.key)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-brand hover:text-brand-hover bg-surface dark:bg-zinc-800 border border-border rounded-md shadow-xs cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Reintentar
                      </button>
                    </div>
                  ) : state.recommendations.length === 0 ? (
                    // Approved / Optimized State
                    <div className="flex items-start gap-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl p-4 text-xs">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">¡Optimizado!</span> No se encontraron oportunidades de mejora críticas en esta área. Cumple plenamente con las pautas de Google.
                      </div>
                    </div>
                  ) : (
                    // Recommendations list for category
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-gray-200 dark:divide-zinc-800 transition-colors duration-200">
                      {state.recommendations.map((rec, index) => (
                        <div key={rec.id} className="p-4 flex items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-150">
                          {/* Warning Badge with numbering */}
                          <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/20 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
                            {index + 1}
                          </div>
                          
                          {/* Text content */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {rec.title}
                              </h5>
                              <span className="text-[8px] uppercase tracking-wider font-mono px-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800">
                                Puntaje: {Math.round(rec.score * 100)}/100
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {renderDescriptionWithLinks(rec.description)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Raw JSON verification toggle */}
        {rawJsonCombined && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                Datos de Verificación (JSON)
              </h4>
              <button
                type="button"
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-foreground bg-surface hover:bg-surface-alt border border-border rounded-lg transition-colors cursor-pointer"
              >
                {showRawJson ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    Ocultar JSON
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    Ver JSON de Auditoría
                  </>
                )}
              </button>
            </div>

            {showRawJson && (
              <div className="border border-border rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 p-6 overflow-hidden animate-slide-down">
                <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-96 w-full whitespace-pre-wrap leading-relaxed select-all">
                  {JSON.stringify(rawJsonCombined, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
