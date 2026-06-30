"use client";

import React, { useState } from "react";
import { useNode } from "@craftjs/core";
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Move, 
  Tablet, 
  Smartphone,
  EyeOff
} from "lucide-react";

// Local collapsible section matching Bento-style accordion in properties panel
const SettingsSection = ({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean; 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#2A2640] rounded-xl bg-[#141127] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium tracking-wider text-[#FFB598] bg-[#1C1835] hover:bg-[#1C1835]/90 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">{title}</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {isOpen && <div className="p-3 space-y-3.5 border-t border-[#2A2640] bg-[#1C1835]">{children}</div>}
    </div>
  );
};

export const PositionSettings = () => {
  const { 
    id,
    props,
    dom,
    actions: { setProp } 
  } = useNode((node) => ({
    props: node.data.props,
    dom: node.dom,
  }));

  const isRoot = id === "ROOT";

  // Position settings are disabled/irrelevant for the ROOT container
  if (isRoot) return null;

  const positionMode = props.positionMode || "flow";
  const x = props.x ?? 0;
  const y = props.y ?? 0;
  const zIndex = props.zIndex ?? 1;
  const hideOn = props.hideOn || [];

  const handleToggleHideOn = (viewport: string) => {
    setProp((p: Record<string, unknown> & { hideOn?: string[] }) => {
      const current = p.hideOn || [];
      if (current.includes(viewport)) {
        p.hideOn = current.filter((v) => v !== viewport);
      } else {
        p.hideOn = [...current, viewport];
      }
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSection title="Posición y Visibilidad" defaultOpen={true}>
        
        {/* Positioning Mode */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium tracking-wider text-[#FFB598] flex items-center gap-1">
            <Move className="h-3 w-3" />
            Modo de posicionamiento
          </label>
          <div className="grid grid-cols-2 gap-1 bg-[#141127] p-0.5 rounded-lg border border-[#2A2640]">
            <button
              type="button"
              onClick={() => setProp((p: Record<string, unknown> & { positionMode: string }) => { p.positionMode = "flow"; })}
              className={`py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                positionMode === "flow"
                  ? "bg-[#2A2640] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              En Flujo
            </button>
            <button
              type="button"
              onClick={() => {
                setProp((p: Record<string, unknown> & { positionMode: string; width?: string }) => {
                  p.positionMode = "free";
                  if (dom) {
                    const rect = dom.getBoundingClientRect();
                    if (!p.width || p.width.endsWith("%") || p.width === "auto") {
                      p.width = `${Math.round(rect.width)}px`;
                    }
                  }
                });
              }}
              className={`py-1 text-[10px] font-medium rounded-md transition-all cursor-pointer ${
                positionMode === "free"
                  ? "bg-[#2A2640] text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Posición Libre
            </button>
          </div>
        </div>

        {/* Absolute Position Offsets (X & Y) */}
        {positionMode === "free" && (
          <div className="space-y-3 pt-2 border-t border-[#2A2640]">
            
            {/* X Position */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-medium text-[#FFB598]">
                  Posición horizontal (X)
                </label>
                <span className="text-xs font-mono font-semibold text-white">{x}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="1"
                  value={x}
                  onChange={(e) => setProp((p: Record<string, unknown> & { x: number }) => { p.x = parseInt(e.target.value); })}
                  className="flex-grow cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${x}%, #2A2640 ${x}%, #2A2640 100%)`
                  }}
                />
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={x}
                  onChange={(e) => setProp((p: Record<string, unknown> & { x: number }) => { 
                    const val = parseInt(e.target.value);
                    p.x = isNaN(val) ? 0 : Math.max(0, Math.min(100, val));
                  })}
                  className="w-12 rounded-lg border border-[#2A2640] bg-[#141127] px-1 py-0.5 text-center text-xs font-mono text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Y Position */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-medium text-[#FFB598]">
                  Posición vertical (Y)
                </label>
                <span className="text-xs font-mono font-semibold text-white">{y}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="1"
                  value={y}
                  onChange={(e) => setProp((p: Record<string, unknown> & { y: number }) => { p.y = parseInt(e.target.value); })}
                  className="flex-grow cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${(y / 2)}%, #2A2640 ${(y / 2)}%, #2A2640 100%)`
                  }}
                />
                <input 
                  type="number"
                  min="0"
                  max="500"
                  value={y}
                  onChange={(e) => setProp((p: Record<string, unknown> & { y: number }) => { 
                    const val = parseInt(e.target.value);
                    p.y = isNaN(val) ? 0 : Math.max(0, Math.min(500, val));
                  })}
                  className="w-12 rounded-lg border border-[#2A2640] bg-[#141127] px-1 py-0.5 text-center text-xs font-mono text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Z-Index (Layer ordering) */}
            <div className="space-y-1.5 pt-1.5 border-t border-[#2A2640]/50">
              <label className="text-[10px] font-medium tracking-wider text-[#FFB598] flex items-center gap-1">
                <Layers className="h-3 w-3" />
                Capa (Z-Index / Nivel)
              </label>
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setProp((p: Record<string, unknown> & { zIndex: number }) => { p.zIndex = Math.max(0, (p.zIndex ?? 1) - 1); })}
                  className="px-2.5 py-1.5 rounded-lg border border-[#2A2640] bg-[#141127] hover:bg-[#141127]/90 text-xs font-bold text-white cursor-pointer"
                >
                  Enviar Atrás
                </button>
                <div className="flex-grow text-center text-xs font-mono font-bold bg-[#141127] border border-[#2A2640] py-1.5 rounded-lg text-white">
                  {zIndex}
                </div>
                <button
                  type="button"
                  onClick={() => setProp((p: Record<string, unknown> & { zIndex: number }) => { p.zIndex = (p.zIndex ?? 1) + 1; })}
                  className="px-2.5 py-1.5 rounded-lg border border-[#2A2640] bg-[#141127] hover:bg-[#141127]/90 text-xs font-bold text-white cursor-pointer"
                >
                  Traer Adelante
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Viewport Visibility (hideOn) */}
        <div className="space-y-1.5 pt-2 border-t border-[#2A2640]">
          <label className="text-[10px] font-medium tracking-wider text-[#FFB598] flex items-center gap-1">
            <EyeOff className="h-3 w-3" />
            Ocultar elemento en:
          </label>
          
          <div className="space-y-2">
            {/* Tablet Checkbox */}
            <label className="flex items-center justify-between text-xs text-white cursor-pointer hover:bg-white/5 p-1 rounded-md transition-colors">
              <span className="flex items-center gap-2 text-slate-300">
                <Tablet className="h-3.5 w-3.5 text-[#FFB598]/70" />
                Tablet (Tableta)
              </span>
              <input
                type="checkbox"
                checked={hideOn.includes("tablet")}
                onChange={() => handleToggleHideOn("tablet")}
                className="rounded-sm border-[#2A2640] bg-[#141127] text-[#273E92] focus:ring-[#273E92] h-4 w-4 cursor-pointer"
              />
            </label>

            {/* Mobile Checkbox */}
            <label className="flex items-center justify-between text-xs text-white cursor-pointer hover:bg-white/5 p-1 rounded-md transition-colors">
              <span className="flex items-center gap-2 text-slate-300">
                <Smartphone className="h-3.5 w-3.5 text-[#FFB598]/70" />
                Móvil (Teléfono)
              </span>
              <input
                type="checkbox"
                checked={hideOn.includes("mobile")}
                onChange={() => handleToggleHideOn("mobile")}
                className="rounded-sm border-[#2A2640] bg-[#141127] text-[#273E92] focus:ring-[#273E92] h-4 w-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

      </SettingsSection>
    </div>
  );
};