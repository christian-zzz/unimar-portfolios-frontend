"use client";

import { useNode, useEditor } from "@craftjs/core";
import React, { useState } from "react";
import { useEditorTheme } from "../ThemeContext";
import { ResizableWrapper } from "../components/ResizableWrapper";
import { PositionSettings } from "../components/PositionSettings";
import { 
  Layout, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  StretchHorizontal,
  ChevronDown,
  ChevronRight,
  Maximize2,
  ChevronsLeftRight
} from "lucide-react";

export interface ContainerProps {
  backgroundColor?: string;
  padding?: number;
  useIndividualPadding?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderRadius?: number;
  gap?: number;
  flexDirection?: "row" | "column";
  alignItems?: "stretch" | "center" | "flex-start" | "flex-end";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between";
  shadow?: "none" | "shadow-xs" | "shadow-sm" | "shadow-md" | "shadow-lg";
  width?: string;
  height?: string;
  margin?: number;
  useIndividualMargins?: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  positionMode?: "flow" | "free";
  x?: number;
  y?: number;
  zIndex?: number;
  hideOn?: string[];
  children?: React.ReactNode;
}

export const Container = ({
  backgroundColor = "var(--surface)",
  padding = 16,
  useIndividualPadding = false,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  borderRadius = 12,
  gap = 16,
  flexDirection = "column",
  alignItems = "center",
  justifyContent = "flex-start",
  shadow = "none",
  width = "100%",
  height = "auto",
  margin = 0,
  useIndividualMargins = false,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  children
}: ContainerProps) => {
  const { id, connectors: { connect } } = useNode();
  const { enabled: isEditorEnabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));
  const isRoot = id === "ROOT";

  const marginStyles = useIndividualMargins
    ? {
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
      }
    : {
        margin: `${margin}px`,
      };

  const paddingStyles = useIndividualPadding
    ? {
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
      }
    : {
        padding: `${padding}px`,
      };

  const containerStyles: React.CSSProperties = {
    position: "relative",
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    gap: `${gap}px`,
    display: "flex",
    flexDirection,
    flexWrap: flexDirection === "row" ? "wrap" : "nowrap",
    alignItems,
    justifyContent,
    width: "100%",
    height: "100%",
    transition: "all 0.2s ease",
    minWidth: 0,
    minHeight: "60px",
    ...paddingStyles,
    ...marginStyles,
  };

  if (isRoot) {
    const rootStyles: React.CSSProperties = {
      position: "relative",
      backgroundColor,
      gap: `${gap}px`,
      display: "flex",
      flexDirection,
      flexWrap: flexDirection === "row" ? "wrap" : "nowrap",
      alignItems,
      justifyContent,
      width: "100%",
      minHeight: "800px",
      transition: "all 0.2s ease",
      ...paddingStyles,
    };
    return (
      <div ref={(el) => { if (el) connect(el); }} style={rootStyles} className="w-full h-auto">
        {children}
      </div>
    );
  }

  return (
    <ResizableWrapper width={width} height={height}>
      <div
        style={containerStyles}
        className={`w-full h-full ${isEditorEnabled ? "border border-dashed border-border" : ""} ${shadow}`}
      >
        {children}
      </div>
    </ResizableWrapper>
  );
};

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

export const ContainerSettings = () => {
  const { id, actions: { setProp }, props } = useNode((node) => ({
    id: node.id,
    props: node.data.props,
  }));

  const { theme } = useEditorTheme();
  const isRoot = id === "ROOT";

  return (
    <div className="space-y-2 select-none">
      
      <PositionSettings />

      {/* Accordion 1: Layout/Diseño */}
      <SettingsSection title="Diseño Interno" defaultOpen={true}>
        {/* Flex Direction setting */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Dirección del Contenido
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProp((p: ContainerProps) => { p.flexDirection = "column"; })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                props.flexDirection === "column"
                  ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                  : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              Columna
            </button>
            <button
              type="button"
              onClick={() => setProp((p: ContainerProps) => { p.flexDirection = "row"; })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                props.flexDirection === "row"
                  ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                  : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <Layout className="h-3.5 w-3.5 rotate-90" />
              Fila
            </button>
          </div>
        </div>

        {/* Alignment options */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Alineación de Items
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { name: "flex-start", icon: AlignLeft, label: "Izquierda" },
              { name: "center", icon: AlignCenter, label: "Centro" },
              { name: "flex-end", icon: AlignRight, label: "Derecha" },
              { name: "stretch", icon: StretchHorizontal, label: "Estirar" }
            ].map((align) => {
              const Icon = align.icon;
              return (
                <button
                  key={align.name}
                  type="button"
                  onClick={() => setProp((p: ContainerProps) => { p.alignItems = align.name as ContainerProps["alignItems"]; })}
                  className={`flex items-center justify-center py-2 rounded-lg border transition-all ${
                    props.alignItems === align.name
                      ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                      : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
                  }`}
                  title={align.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Justification options */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Distribución (Justify)
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { name: "flex-start", icon: AlignLeft, label: "Inicio" },
              { name: "center", icon: AlignCenter, label: "Centro" },
              { name: "flex-end", icon: AlignRight, label: "Final" },
              { name: "space-between", icon: ChevronsLeftRight, label: "Espacio Entre" }
            ].map((just) => {
              const Icon = just.icon;
              return (
                <button
                  key={just.name}
                  type="button"
                  onClick={() => setProp((p: ContainerProps) => { p.justifyContent = just.name as ContainerProps["justifyContent"]; })}
                  className={`flex items-center justify-center py-2 rounded-lg border transition-all ${
                    (props.justifyContent || "flex-start") === just.name
                      ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                      : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
                  }`}
                  title={just.label}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Padding and Gap slider */}
        <div className="space-y-4 pt-2">
          {/* Toggle individual padding */}
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Relleno Individual (Padding)
            </label>
            <input 
              type="checkbox"
              checked={props.useIndividualPadding ?? false}
              onChange={(e) => setProp((p: ContainerProps) => { p.useIndividualPadding = e.target.checked; })}
              className="accent-brand cursor-pointer h-4 w-4"
            />
          </div>

          {!props.useIndividualPadding ? (
            // Unified Padding
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-medium text-[#FFB598]">
                  Relleno General
                </label>
                <span className="text-xs font-mono font-semibold">{props.padding ?? 0}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="96" 
                step="4"
                value={props.padding ?? 0}
                onChange={(e) => setProp((p: ContainerProps) => { p.padding = parseInt(e.target.value); })}
                className="w-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.padding ?? 0) * 100) / 96}%, #2A2640 ${((props.padding ?? 0) * 100) / 96}%, #2A2640 100%)`
                }}
              />
            </div>
          ) : (
            // Individual Padding
            <div className="space-y-3">
              {/* Padding Top */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Superior</label>
                  <span className="text-[10px] font-mono">{props.paddingTop ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.paddingTop ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.paddingTop = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.paddingTop ?? 0) * 100) / 96}%, #2A2640 ${((props.paddingTop ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Padding Bottom */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Inferior</label>
                  <span className="text-[10px] font-mono">{props.paddingBottom ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.paddingBottom ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.paddingBottom = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.paddingBottom ?? 0) * 100) / 96}%, #2A2640 ${((props.paddingBottom ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Padding Left */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Izquierda</label>
                  <span className="text-[10px] font-mono">{props.paddingLeft ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.paddingLeft ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.paddingLeft = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.paddingLeft ?? 0) * 100) / 96}%, #2A2640 ${((props.paddingLeft ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Padding Right */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Derecha</label>
                  <span className="text-[10px] font-mono">{props.paddingRight ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.paddingRight ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.paddingRight = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.paddingRight ?? 0) * 100) / 96}%, #2A2640 ${((props.paddingRight ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Gap */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-medium text-[#FFB598]">
                Espaciado (Gap)
              </label>
              <span className="text-xs font-mono font-semibold">{props.gap ?? 16}px</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="64" 
              step="4"
              value={props.gap ?? 16}
              onChange={(e) => setProp((p: ContainerProps) => { p.gap = parseInt(e.target.value); })}
              className="w-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.gap ?? 16) * 100) / 64}%, #2A2640 ${((props.gap ?? 16) * 100) / 64}%, #2A2640 100%)`
              }}
            />
          </div>
        </div>
      </SettingsSection>

      {/* Accordion 2: Dimensiones */}
      <SettingsSection title="Dimensiones" defaultOpen={false}>
        {/* Width Control */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Ancho (Width)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "100%", value: "100%" },
              { name: "50%", value: "50%" },
              { name: "Auto", value: "auto" }
            ].map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => setProp((p: ContainerProps) => { p.width = opt.value; })}
                className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                  props.width === opt.value
                    ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                    : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
          <input 
            type="text"
            value={props.width || "100%"}
            onChange={(e) => setProp((p: ContainerProps) => { p.width = e.target.value; })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-hidden"
            placeholder="Ej. 100%, 400px, 30rem"
          />
        </div>

        {/* Height Control */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Alto (Height)
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setProp((p: ContainerProps) => { p.height = "auto"; })}
              className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                props.height === "auto"
                  ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                  : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              Automático (Auto)
            </button>
          </div>
          <input 
            type="text"
            value={props.height || "auto"}
            onChange={(e) => setProp((p: ContainerProps) => { p.height = e.target.value; })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-hidden"
            placeholder="Ej. auto, 300px, 20vh"
          />
        </div>
      </SettingsSection>

      {/* Accordion 3: Espaciado Exterior (Márgenes) */}
      <SettingsSection title="Márgenes" defaultOpen={false}>
        <div className="space-y-3">
          {/* Toggle individual margins */}
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Márgenes Individuales
            </label>
            <input 
              type="checkbox"
              checked={props.useIndividualMargins ?? false}
              onChange={(e) => setProp((p: ContainerProps) => { p.useIndividualMargins = e.target.checked; })}
              className="accent-brand cursor-pointer h-4 w-4"
            />
          </div>

          {!props.useIndividualMargins ? (
            // Unified Margin
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-medium text-[#FFB598]">
                  Margen General
                </label>
                <span className="text-xs font-mono font-semibold">{props.margin ?? 0}px</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="96" 
                step="4"
                value={props.margin ?? 0}
                onChange={(e) => setProp((p: ContainerProps) => { p.margin = parseInt(e.target.value); })}
                className="w-full cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.margin ?? 0) * 100) / 96}%, #2A2640 ${((props.margin ?? 0) * 100) / 96}%, #2A2640 100%)`
                }}
              />
            </div>
          ) : (
            // Individual Margins
            <div className="space-y-3">
              {/* Margin Top */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Superior</label>
                  <span className="text-[10px] font-mono">{props.marginTop ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.marginTop ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.marginTop = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.marginTop ?? 0) * 100) / 96}%, #2A2640 ${((props.marginTop ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Margin Bottom */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Inferior</label>
                  <span className="text-[10px] font-mono">{props.marginBottom ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.marginBottom ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.marginBottom = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.marginBottom ?? 0) * 100) / 96}%, #2A2640 ${((props.marginBottom ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Margin Left */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Izquierda</label>
                  <span className="text-[10px] font-mono">{props.marginLeft ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.marginLeft ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.marginLeft = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.marginLeft ?? 0) * 100) / 96}%, #2A2640 ${((props.marginLeft ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>

              {/* Margin Right */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-medium text-[#FFB598]">Derecha</label>
                  <span className="text-[10px] font-mono">{props.marginRight ?? 0}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.marginRight ?? 0}
                  onChange={(e) => setProp((p: ContainerProps) => { p.marginRight = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.marginRight ?? 0) * 100) / 96}%, #2A2640 ${((props.marginRight ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* Accordion 4: Estética & Color */}
      <SettingsSection title="Estética" defaultOpen={false}>
        {/* Background Color Picker with Theme Swatches */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Color de Fondo
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { name: "Principal", value: theme.colors.primary },
              { name: "Secundario", value: theme.colors.secondary },
              { name: "Fondo", value: theme.colors.background },
              { name: "Texto", value: theme.colors.text },
              { name: "Limpio", value: "transparent" }
            ].map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                onClick={() => setProp((p: ContainerProps) => { p.backgroundColor = swatch.value; })}
                className={`h-6 px-2 text-[8px] font-bold rounded-md border transition-all ${
                  props.backgroundColor === swatch.value 
                    ? "border-brand ring-1 ring-brand" 
                    : "border-border hover:border-brand/40"
                }`}
                style={{
                  backgroundColor: swatch.value === "transparent" ? "white" : swatch.value,
                  color: swatch.value === "transparent" ? "black" : (swatch.name === "Fondo" || swatch.name === "Limpio" ? "black" : "white")
                }}
              >
                {swatch.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input 
              type="color" 
              value={props.backgroundColor?.startsWith("var") || props.backgroundColor === "transparent" ? "#ffffff" : props.backgroundColor || "#ffffff"}
              onChange={(e) => setProp((p: ContainerProps) => { p.backgroundColor = e.target.value; })}
              className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
            />
            <input 
              type="text"
              value={props.backgroundColor || ""}
              onChange={(e) => setProp((p: ContainerProps) => { p.backgroundColor = e.target.value; })}
              className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Esquinas (Border Radius)
            </label>
            <span className="text-xs font-mono font-semibold">{props.borderRadius ?? 12}px</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="48" 
            step="2"
            value={props.borderRadius ?? 12}
            onChange={(e) => setProp((p: ContainerProps) => { p.borderRadius = parseInt(e.target.value); })}
            className="w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.borderRadius ?? 12) * 100) / 48}%, #2A2640 ${((props.borderRadius ?? 12) * 100) / 48}%, #2A2640 100%)`
            }}
          />
        </div>

        {/* Shadow Dropdown */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Sombra
          </label>
          <select
            value={props.shadow ?? "none"}
            onChange={(e) => setProp((p: ContainerProps) => { p.shadow = e.target.value as ContainerProps["shadow"]; })}
            className="w-full rounded-lg border border-border bg-surface px-2 py-1.5 text-xs text-foreground focus:outline-hidden"
          >
            <option value="none">Sin Sombra</option>
            <option value="shadow-xs">Sombra Extra Pequeña</option>
            <option value="shadow-sm">Sombra Suave</option>
            <option value="shadow-md">Sombra Media</option>
            <option value="shadow-lg">Sombra Elevada</option>
          </select>
        </div>
      </SettingsSection>

    </div>
  );
};

Container.craft = {
  displayName: "Contenedor",
  props: {
    backgroundColor: "var(--surface)",
    padding: 16,
    useIndividualPadding: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 12,
    gap: 16,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    shadow: "none",
    width: "100%",
    height: "auto",
    margin: 0,
    useIndividualMargins: false,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    positionMode: "flow",
    x: 0,
    y: 0,
    zIndex: 1,
    hideOn: [],
  },
  rules: {
    canDrag: (node: any) => node.data.props.positionMode !== "free",
    canDrop: () => true,
  },
  related: {
    settings: ContainerSettings,
  },
};
