"use client";

import { useEditorTheme } from "./ThemeContext";
import { Palette, Type } from "lucide-react";

const GOOGLE_FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Oswald",
  "Space Grotesk",
  "Lora",
  "Montserrat"
];

export const GlobalSettings = () => {
  const { theme, setColors, setTypography } = useEditorTheme();

  return (
    <div className="space-y-6">
      
      {/* Description Section */}
      <div className="border-b border-border pb-3">
        <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-brand">
          Ajustes del Tema Global
        </span>
        <p className="text-[10px] text-muted mt-1 leading-relaxed">
          Configura la paleta cromática y la tipografía predeterminada del portafolio.
        </p>
      </div>

      {/* Color Palette Panel */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Palette className="h-3.5 w-3.5 text-brand" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider">
            Paleta de Colores
          </h4>
        </div>

        <div className="space-y-3.5">
          {/* Primary Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Color Primario
            </label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={theme.colors.primary}
                onChange={(e) => setColors({ primary: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input 
                type="text"
                value={theme.colors.primary}
                onChange={(e) => setColors({ primary: e.target.value })}
                className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Color Secundario
            </label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={theme.colors.secondary}
                onChange={(e) => setColors({ secondary: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input 
                type="text"
                value={theme.colors.secondary}
                onChange={(e) => setColors({ secondary: e.target.value })}
                className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Color de Fondo del Lienzo
            </label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={theme.colors.background}
                onChange={(e) => setColors({ background: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input 
                type="text"
                value={theme.colors.background}
                onChange={(e) => setColors({ background: e.target.value })}
                className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Color del Texto
            </label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={theme.colors.text}
                onChange={(e) => setColors({ text: e.target.value })}
                className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input 
                type="text"
                value={theme.colors.text}
                onChange={(e) => setColors({ text: e.target.value })}
                className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography Panel */}
      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Type className="h-3.5 w-3.5 text-brand" />
          <h4 className="text-[11px] font-bold uppercase tracking-wider">
            Tipografía Global
          </h4>
        </div>

        <div className="space-y-3.5">
          {/* Headings Font */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Fuente de Títulos
            </label>
            <select
              value={theme.typography.headingFont}
              onChange={(e) => setTypography({ headingFont: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              {GOOGLE_FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          {/* Body Font */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted">
              Fuente de Cuerpo
            </label>
            <select
              value={theme.typography.bodyFont}
              onChange={(e) => setTypography({ bodyFont: e.target.value })}
              className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden"
            >
              {GOOGLE_FONTS.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};
