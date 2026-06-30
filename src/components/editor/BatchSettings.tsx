"use client";

import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { useMultiSelect } from "./components/MultiSelectContext";
import { ChevronDown, ChevronRight, Sliders, Palette } from "lucide-react";

// Bento-style Collapsible Section
const SettingsSection = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border py-3">
      <button 
        type="button" 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between text-left text-[10px] font-medium tracking-wider text-[#FFB598] hover:text-white transition-colors cursor-pointer"
      >
        <span>{title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="mt-3.5 space-y-4">{children}</div>}
    </div>
  );
};

export const BatchSettings = () => {
  const { selectedIds } = useMultiSelect();

  const { nodeProperties, actions } = useEditor((state) => {
    const propsMap: Record<string, Record<string, unknown>> = {};
    selectedIds.forEach((id) => {
      if (state.nodes[id]) {
        propsMap[id] = state.nodes[id].data.props as Record<string, unknown>;
      }
    });
    return {
      nodeProperties: propsMap,
    };
  });

  const getCommonValue = (key: string, defaultValue: unknown) => {
    const values = Object.values(nodeProperties).map((p: Record<string, unknown>) => p[key]);
    if (values.length === 0) return defaultValue;
    const first = values[0];
    const allEqual = values.every((v) => v === first);
    return allEqual ? first : "mixed";
  };

  const updateProp = (key: string, value: unknown) => {
    selectedIds.forEach((id) => {
      actions.setProp(id, (props: Record<string, unknown>) => {
        props[key] = value;
      });
    });
  };

  const padding = getCommonValue("padding", 0) as number | "mixed";
  const useIndividualPadding = getCommonValue("useIndividualPadding", false) as boolean | "mixed";
  const paddingTop = getCommonValue("paddingTop", 0) as number | "mixed";
  const paddingBottom = getCommonValue("paddingBottom", 0) as number | "mixed";
  const paddingLeft = getCommonValue("paddingLeft", 0) as number | "mixed";
  const paddingRight = getCommonValue("paddingRight", 0) as number | "mixed";

  const margin = getCommonValue("margin", 0) as number | "mixed";
  const useIndividualMargins = getCommonValue("useIndividualMargins", false) as boolean | "mixed";
  const marginTop = getCommonValue("marginTop", 0) as number | "mixed";
  const marginBottom = getCommonValue("marginBottom", 0) as number | "mixed";
  const marginLeft = getCommonValue("marginLeft", 0) as number | "mixed";
  const marginRight = getCommonValue("marginRight", 0) as number | "mixed";

  const borderRadius = getCommonValue("borderRadius", 0) as number | "mixed";
  const backgroundColor = getCommonValue("backgroundColor", "transparent") as string | "mixed";

  return (
    <div className="space-y-4 select-none">
      <div className="border-b border-border pb-2">
        <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-brand">
          Edición Múltiple ({selectedIds.size} elementos)
        </span>
      </div>

      {/* Accordion 1: Background Color */}
      <SettingsSection title="Fondo Común" defaultOpen={true}>
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Color de Fondo
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              { value: "transparent", label: "Ninguno", class: "border-border" },
              { value: "var(--theme-background)", label: "Fondo Principal", class: "bg-zinc-100 dark:bg-zinc-900 border-border" },
              { value: "var(--surface)", label: "Superficie", class: "bg-white dark:bg-zinc-800 border-border" },
              { value: "var(--theme-primary)", label: "Color Primario", class: "bg-amber-500 border-amber-500" },
              { value: "var(--theme-secondary)", label: "Color Secundario", class: "bg-zinc-500 border-zinc-500" },
              { value: "#ef4444", label: "Rojo", class: "bg-red-500 border-red-500" },
              { value: "#3b82f6", label: "Azul", class: "bg-blue-500 border-blue-500" },
              { value: "#10b981", label: "Verde", class: "bg-emerald-500 border-emerald-500" },
              { value: "#f59e0b", label: "Naranja", class: "bg-amber-500 border-amber-500" },
              { value: "#8b5cf6", label: "Morado", class: "bg-violet-500 border-violet-500" },
              { value: "#ec4899", label: "Rosa", class: "bg-pink-500 border-pink-500" },
              { value: "#1e293b", label: "Oscuro", class: "bg-slate-800 border-slate-800" },
            ].map((swatch) => (
              <button
                key={swatch.value}
                type="button"
                onClick={() => updateProp("backgroundColor", swatch.value)}
                className={`h-6 rounded-md border cursor-pointer transition-all ${swatch.class} ${
                  backgroundColor === swatch.value
                    ? "ring-2 ring-brand ring-offset-2 dark:ring-offset-zinc-950 scale-105"
                    : "opacity-80 hover:opacity-100"
                }`}
                title={swatch.label}
              />
            ))}
          </div>
          {backgroundColor === "mixed" && (
            <p className="text-[10px] text-amber-500 font-medium italic mt-1">
              Colores de fondo variados (múltiple selección). Selecciona un color para unificarlos.
            </p>
          )}
        </div>
      </SettingsSection>

      {/* Accordion 2: Spacing & Layout */}
      <SettingsSection title="Espaciado" defaultOpen={true}>
        <div className="space-y-4">
          
          {/* Padding Section */}
          <div className="space-y-2 border-b border-border/50 pb-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-[#FFB598]">
                Relleno Individual (Padding)
              </label>
              {useIndividualPadding !== "mixed" && (
                <input 
                  type="checkbox"
                  checked={useIndividualPadding}
                  onChange={(e) => updateProp("useIndividualPadding", e.target.checked)}
                  className="accent-brand cursor-pointer h-4 w-4"
                />
              )}
            </div>

            {useIndividualPadding === "mixed" ? (
              <p className="text-[10px] text-amber-500 italic">
                Uso de relleno individual mixto. Elige unificar para editar.
              </p>
            ) : !useIndividualPadding ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-medium text-[#FFB598]">
                    Relleno General
                  </label>
                  <span className="text-xs font-mono font-semibold">
                    {padding === "mixed" ? "Mixto" : `${padding}px`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="96" 
                  step="4"
                  value={padding === "mixed" ? 0 : padding}
                  onChange={(e) => updateProp("padding", parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(((padding === "mixed" ? 0 : padding) * 100) / 96)}%, #2A2640 ${(((padding === "mixed" ? 0 : padding) * 100) / 96)}%, #2A2640 100%)`
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "paddingTop", label: "Sup.", val: paddingTop },
                  { key: "paddingBottom", label: "Inf.", val: paddingBottom },
                  { key: "paddingLeft", label: "Izq.", val: paddingLeft },
                  { key: "paddingRight", label: "Der.", val: paddingRight },
                ].map((item) => (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-muted">{item.label}</span>
                      <span className="text-[10px] font-mono">
                        {item.val === "mixed" ? "Mix" : `${item.val}px`}
                      </span>
                    </div>
                    <input 
                      type="range" min="0" max="96" step="4"
                      value={item.val === "mixed" ? 0 : item.val}
                      onChange={(e) => updateProp(item.key, parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(((item.val === "mixed" ? 0 : item.val) * 100) / 96)}%, #2A2640 ${(((item.val === "mixed" ? 0 : item.val) * 100) / 96)}%, #2A2640 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Margin Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium text-[#FFB598]">
                Margen Individual (Margin)
              </label>
              {useIndividualMargins !== "mixed" && (
                <input 
                  type="checkbox"
                  checked={useIndividualMargins}
                  onChange={(e) => updateProp("useIndividualMargins", e.target.checked)}
                  className="accent-brand cursor-pointer h-4 w-4"
                />
              )}
            </div>

            {useIndividualMargins === "mixed" ? (
              <p className="text-[10px] text-amber-500 italic">
                Uso de margen individual mixto. Elige unificar para editar.
              </p>
            ) : !useIndividualMargins ? (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-medium text-[#FFB598]">
                    Margen General
                  </label>
                  <span className="text-xs font-mono font-semibold">
                    {margin === "mixed" ? "Mixto" : `${margin}px`}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="96" 
                  step="4"
                  value={margin === "mixed" ? 0 : margin}
                  onChange={(e) => updateProp("margin", parseInt(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(((margin === "mixed" ? 0 : margin) * 100) / 96)}%, #2A2640 ${(((margin === "mixed" ? 0 : margin) * 100) / 96)}%, #2A2640 100%)`
                  }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "marginTop", label: "Sup.", val: marginTop },
                  { key: "marginBottom", label: "Inf.", val: marginBottom },
                  { key: "marginLeft", label: "Izq.", val: marginLeft },
                  { key: "marginRight", label: "Der.", val: marginRight },
                ].map((item) => (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-semibold text-muted">{item.label}</span>
                      <span className="text-[10px] font-mono">
                        {item.val === "mixed" ? "Mix" : `${item.val}px`}
                      </span>
                    </div>
                    <input 
                      type="range" min="0" max="96" step="4"
                      value={item.val === "mixed" ? 0 : item.val}
                      onChange={(e) => updateProp(item.key, parseInt(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(((item.val === "mixed" ? 0 : item.val) * 100) / 96)}%, #2A2640 ${(((item.val === "mixed" ? 0 : item.val) * 100) / 96)}%, #2A2640 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </SettingsSection>

      {/* Accordion 3: Border Radius */}
      <SettingsSection title="Bordes y Estilo" defaultOpen={true}>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1">
                <Sliders className="h-3 w-3 text-muted" />
                Redondeado
              </label>
              <span className="text-xs font-mono font-semibold">
                {borderRadius === "mixed" ? "Mixto" : `${borderRadius}px`}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="32" 
              step="2"
              value={borderRadius === "mixed" ? 0 : borderRadius}
              onChange={(e) => updateProp("borderRadius", parseInt(e.target.value))}
              className="w-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(((borderRadius === "mixed" ? 0 : borderRadius) * 100) / 32)}%, #2A2640 ${(((borderRadius === "mixed" ? 0 : borderRadius) * 100) / 32)}%, #2A2640 100%)`
              }}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};
