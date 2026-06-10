"use client";

import { Edit3, ExternalLink, RefreshCw, Globe } from "lucide-react";

export default function ActivePortfolio() {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Sleek Header & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-2xl">
              Mi Portafolio de Diseño
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Publicado
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Última modificación: <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">Lun, 01 Jun 2026 a las 09:12 AM</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-muted hover:text-foreground bg-surface hover:bg-surface-alt border border-border rounded-lg transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver Sitio en Vivo
          </button>
          
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Abrir Editor Visual
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Canvas Card */}
        <div className="md:col-span-2 border border-border rounded-2xl bg-surface p-6 flex flex-col justify-between transition-colors duration-200">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Resumen del Lienzo
            </h3>
            
            <div className="aspect-video w-full rounded-xl bg-surface-alt border border-border flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
              <div className="text-center z-20 space-y-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 font-mono">portfolio-tree-v1.json</p>
                <p className="text-[10px] text-muted">14 nodos personalizados • 4 rejillas de diseño</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border mt-6 pt-4 text-xs">
            <div className="flex items-center gap-2 text-muted">
              <Globe className="h-3.5 w-3.5" />
              <span>Dominio: <strong className="text-slate-800 dark:text-slate-200 font-medium">student.unimar.edu/janedoe</strong></span>
            </div>
            <button className="text-brand hover:underline font-semibold cursor-pointer">
              Gestionar Dominio
            </button>
          </div>
        </div>

        {/* Audits & Lighthouse scores */}
        <div className="border border-border rounded-2xl bg-surface p-6 space-y-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Métricas y Auditoría
            </h3>
            <button className="text-muted hover:text-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Lighthouse Circular Score Placeholders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-surface-alt">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-emerald-500">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">98</span>
              </div>
              <span className="text-[10px] font-semibold text-muted mt-2">Rendimiento</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-surface-alt">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-emerald-500">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">96</span>
              </div>
              <span className="text-[10px] font-semibold text-muted mt-2">Accesibilidad</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-surface-alt">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-emerald-500">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">100</span>
              </div>
              <span className="text-[10px] font-semibold text-muted mt-2">Buenas Prácticas</span>
            </div>

            <div className="flex flex-col items-center p-3 rounded-xl border border-border/50 bg-surface-alt">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-full border-2 border-emerald-500">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">92</span>
              </div>
              <span className="text-[10px] font-semibold text-muted mt-2">SEO</span>
            </div>
          </div>

          <div className="text-[11px] text-muted bg-surface-alt p-3 rounded-xl border border-border/50 leading-relaxed">
            La puntuación de Google PageSpeed Insights se actualiza automáticamente todos los días para optimizar la visibilidad en buscadores y los tiempos de carga.
          </div>
        </div>
      </div>
    </div>
  );
}
