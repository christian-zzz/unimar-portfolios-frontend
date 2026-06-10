"use client";

import { Plus, Compass, Sparkles } from "lucide-react";

export default function EmptyPortfolio() {
  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 sm:text-3xl">
          Bienvenido a UNIMAR Portfolios
        </h2>
        <p className="text-sm text-muted mt-2 max-w-xl leading-relaxed">
          Crea, personaliza y publica tu vitrina de diseño personal. Tipografía limpia, plantillas personalizables y estructuras adaptables diseñadas específicamente para estudiantes de diseño gráfico.
        </p>
      </div>

      {/* Centered CTA Area */}
      <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-2xl bg-surface px-6 py-16 text-center md:py-24 transition-colors duration-200">
        {/* Decorative Graphic Element */}
        <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-light border border-brand/10 text-brand dark:bg-brand-light/10">
          <Compass className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white font-bold">
            <Sparkles className="h-2.5 w-2.5" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Lienzo de portafolio no inicializado
        </h3>
        <p className="text-xs text-muted mt-1.5 max-w-sm leading-relaxed">
          Tienes un espacio de portafolio disponible. Comienza inicializando tu nuevo lienzo utilizando nuestro constructor de bajo código.
        </p>

        <button
          type="button"
          className="mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Inicializar Mi Portafolio
        </button>
      </div>
    </div>
  );
}
