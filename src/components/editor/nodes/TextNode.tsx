"use client";

import { useNode, useEditor } from "@craftjs/core";
import React, { useState } from "react";
import { useEditorTheme } from "../ThemeContext";
import { ResizableWrapper } from "../components/ResizableWrapper";
import { PositionSettings } from "../components/PositionSettings";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Bold,
  Type,
  ChevronDown,
  ChevronRight
} from "lucide-react";

export interface TextNodeProps {
  text?: string;
  tagName?: "h1" | "h2" | "h3" | "p";
  textAlign?: "left" | "center" | "right" | "justify";
  fontWeight?: "normal" | "semibold" | "bold";
  color?: string;
  fontType?: "heading" | "body";
  width?: string;
  height?: string;
  padding?: number;
  useIndividualPadding?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  useIndividualMargins?: boolean;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  verticalAlign?: "flex-start" | "center" | "flex-end";
  positionMode?: "flow" | "free";
  x?: number;
  y?: number;
  zIndex?: number;
  hideOn?: string[];
}

export const TextNode = ({
  text = "Haz doble clic para editar este título",
  tagName = "h2",
  textAlign = "left",
  fontWeight = "bold",
  color = "var(--foreground)",
  fontType = "heading",
  width = "auto",
  height = "auto",
  padding = 0,
  useIndividualPadding = false,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  margin = 0,
  useIndividualMargins = false,
  marginTop = 0,
  marginBottom = 8,
  marginLeft = 0,
  marginRight = 0,
  verticalAlign = "flex-start"
}: TextNodeProps) => {
  const { actions: { setProp } } = useNode();
  const { enabled: isEditorEnabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));
  const [editable, setEditable] = useState(false);
  const { theme } = useEditorTheme();

  // Pick font family from theme context
  const selectedFont = fontType === "heading" ? theme.typography.headingFont : theme.typography.bodyFont;

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

  const textStyles: React.CSSProperties = {
    textAlign,
    fontWeight,
    color,
    fontFamily: `${selectedFont}, sans-serif`,
    width: "100%",
    height: "auto",
    transition: "all 0.2s ease",
    ...paddingStyles,
    ...marginStyles,
  };

  const wrapperStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: verticalAlign,
    width: "100%",
    height: "100%",
  };

  // Maps tags to Tailwind typography base sizes
  const getTagClasses = () => {
    switch (tagName) {
      case "h1": return "text-3xl sm:text-4xl tracking-tight leading-none";
      case "h2": return "text-xl sm:text-2xl tracking-tight leading-tight";
      case "h3": return "text-lg tracking-tight leading-snug";
      case "p":
      default:
        return "text-sm leading-relaxed";
    }
  };

  return (
    <ResizableWrapper width={width} height={height}>
      <div
        onDoubleClick={() => isEditorEnabled && setEditable(true)}
        className={`relative py-1 w-full h-full transition-all ${
          isEditorEnabled ? "cursor-text select-text" : "cursor-default"
        }`}
        style={wrapperStyles}
      >
        {editable ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setProp((p: TextNodeProps) => { p.text = e.target.value; })}
            onBlur={() => setEditable(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditable(false);
              }
            }}
            className="bg-transparent w-full border-b border-brand outline-hidden text-inherit font-inherit p-0"
            style={textStyles}
            autoFocus
          />
        ) : (
          React.createElement(
            tagName,
            { style: textStyles, className: getTagClasses() },
            text
          )
        )}
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
    <div className="border-b border-[#2A2640] py-3">
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

export const TextSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const { theme } = useEditorTheme();

  return (
    <div className="space-y-2 select-none">
      
      <PositionSettings />

      {/* Accordion 1: Contenido */}
      <SettingsSection title="Contenido" defaultOpen={true}>
        {/* Raw Edit Content */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Contenido de Texto
          </label>
          <textarea
            value={props.text || ""}
            onChange={(e) => setProp((p: TextNodeProps) => { p.text = e.target.value; })}
            rows={3}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden resize-none"
          />
        </div>

        {/* HTML Tag Type Selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Etiqueta Semántica (HTML)
          </label>
          <select
            value={props.tagName ?? "h2"}
            onChange={(e) => setProp((p: TextNodeProps) => { p.tagName = e.target.value as TextNodeProps["tagName"]; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-2 py-1.5 text-xs text-white focus:outline-hidden"
          >
            <option value="h1">Título Grande (H1)</option>
            <option value="h2">Título Mediano (H2)</option>
            <option value="h3">Subtítulo (H3)</option>
            <option value="p">Párrafo Estándar (P)</option>
          </select>
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
              { name: "Auto", value: "auto" }
            ].map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => setProp((p: TextNodeProps) => { p.width = opt.value; })}
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
            onChange={(e) => setProp((p: TextNodeProps) => { p.width = e.target.value; })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-hidden"
            placeholder="Ej. 100%, 350px, 18rem"
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
              onClick={() => setProp((p: TextNodeProps) => { p.height = "auto"; })}
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
            onChange={(e) => setProp((p: TextNodeProps) => { p.height = e.target.value; })}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-hidden"
            placeholder="Ej. auto, 100px"
          />
        </div>
      </SettingsSection>

      {/* Accordion 3: Espaciado (Padding & Margins) */}
      <SettingsSection title="Espaciado" defaultOpen={false}>
        <div className="space-y-4">
          {/* Toggle individual padding */}
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Relleno Individual (Padding)
            </label>
            <input 
              type="checkbox"
              checked={props.useIndividualPadding ?? false}
              onChange={(e) => setProp((p: TextNodeProps) => { p.useIndividualPadding = e.target.checked; })}
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
                onChange={(e) => setProp((p: TextNodeProps) => { p.padding = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.paddingTop = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.paddingBottom = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.paddingLeft = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.paddingRight = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.paddingRight ?? 0) * 100) / 96}%, #2A2640 ${((props.paddingRight ?? 0) * 100) / 96}%, #2A2640 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Toggle individual margins */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Márgenes Individuales
            </label>
            <input 
              type="checkbox"
              checked={props.useIndividualMargins ?? false}
              onChange={(e) => setProp((p: TextNodeProps) => { p.useIndividualMargins = e.target.checked; })}
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
                onChange={(e) => setProp((p: TextNodeProps) => { p.margin = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.marginTop = parseInt(e.target.value); })}
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
                  <span className="text-[10px] font-mono">{props.marginBottom ?? 8}px</span>
                </div>
                <input 
                  type="range" min="0" max="96" step="4"
                  value={props.marginBottom ?? 8}
                  onChange={(e) => setProp((p: TextNodeProps) => { p.marginBottom = parseInt(e.target.value); })}
                  className="w-full cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.marginBottom ?? 8) * 100) / 96}%, #2A2640 ${((props.marginBottom ?? 8) * 100) / 96}%, #2A2640 100%)`
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.marginLeft = parseInt(e.target.value); })}
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
                  onChange={(e) => setProp((p: TextNodeProps) => { p.marginRight = parseInt(e.target.value); })}
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

      {/* Accordion 4: Tipografía & Color */}
      <SettingsSection title="Tipografía y Color" defaultOpen={false}>
        {/* Font Family Association */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Asociación de Tipografía
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProp((p: TextNodeProps) => { p.fontType = "heading"; })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                props.fontType === "heading" || !props.fontType
                  ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                  : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <Type className="h-3 w-3" />
              Títulos ({theme.typography.headingFont})
            </button>
            <button
              type="button"
              onClick={() => setProp((p: TextNodeProps) => { p.fontType = "body"; })}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                props.fontType === "body"
                  ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                  : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
              }`}
            >
              <Type className="h-3 w-3" />
              Cuerpo ({theme.typography.bodyFont})
            </button>
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Alineación Horizontal
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { name: "left", icon: AlignLeft, label: "Izquierda" },
              { name: "center", icon: AlignCenter, label: "Centro" },
              { name: "right", icon: AlignRight, label: "Derecha" },
              { name: "justify", icon: AlignJustify, label: "Justificado" }
            ].map((align) => {
              const Icon = align.icon;
              return (
                <button
                  key={align.name}
                  type="button"
                  onClick={() => setProp((p: TextNodeProps) => { p.textAlign = align.name as TextNodeProps["textAlign"]; })}
                  className={`flex items-center justify-center py-2 rounded-lg border transition-all ${
                    props.textAlign === align.name || (!props.textAlign && align.name === "left")
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

        {/* Vertical Alignment */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Alineación Vertical
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { name: "flex-start", label: "Arriba" },
              { name: "center", label: "Centro" },
              { name: "flex-end", label: "Abajo" }
            ].map((vAlign) => (
              <button
                key={vAlign.name}
                type="button"
                onClick={() => setProp((p: TextNodeProps) => { p.verticalAlign = vAlign.name as TextNodeProps["verticalAlign"]; })}
                className={`flex items-center justify-center py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  (props.verticalAlign || "flex-start") === vAlign.name
                    ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                    : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                {vAlign.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Grosor de Fuente
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { name: "normal", label: "Normal" },
              { name: "semibold", label: "Semibold" },
              { name: "bold", label: "Bold" }
            ].map((weight) => (
              <button
                key={weight.name}
                type="button"
                onClick={() => setProp((p: TextNodeProps) => { p.fontWeight = weight.name as TextNodeProps["fontWeight"]; })}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                  props.fontWeight === weight.name || (!props.fontWeight && weight.name === "bold")
                    ? "bg-brand-light text-brand border-brand/20 dark:bg-brand-light/20"
                    : "border-border text-muted hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                <Bold className="h-3 w-3" />
                {weight.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection (Theme + Free Choice) */}
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Color del Texto
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              { name: "Principal", value: theme.colors.primary },
              { name: "Secundario", value: theme.colors.secondary },
              { name: "Fondo", value: theme.colors.background },
              { name: "Texto", value: theme.colors.text }
            ].map((swatch) => (
              <button
                key={swatch.name}
                type="button"
                onClick={() => setProp((p: TextNodeProps) => { p.color = swatch.value; })}
                className={`h-6 px-2 text-[8px] font-bold rounded-md border transition-all ${
                  props.color === swatch.value 
                    ? "border-brand ring-1 ring-brand" 
                    : "border-border hover:border-brand/40"
                }`}
                style={{
                  backgroundColor: swatch.value,
                  color: swatch.name === "Fondo" ? "black" : "white"
                }}
              >
                {swatch.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input 
              type="color" 
              value={props.color?.startsWith("var") ? "#171717" : props.color || "#171717"}
              onChange={(e) => setProp((p: TextNodeProps) => { p.color = e.target.value; })}
              className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
            />
            <input 
              type="text"
              value={props.color || ""}
              onChange={(e) => setProp((p: TextNodeProps) => { p.color = e.target.value; })}
              className="flex-grow min-w-0 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground focus:outline-hidden"
              placeholder="#000000"
            />
          </div>
        </div>
      </SettingsSection>

    </div>
  );
};

TextNode.craft = {
  displayName: "Texto",
  props: {
    text: "Haz doble clic para editar este título",
    tagName: "h2",
    textAlign: "left",
    fontWeight: "bold",
    color: "var(--foreground)",
    fontType: "heading",
    width: "auto",
    height: "auto",
    padding: 0,
    useIndividualPadding: false,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    useIndividualMargins: false,
    marginTop: 0,
    marginBottom: 8,
    marginLeft: 0,
    marginRight: 0,
    verticalAlign: "flex-start",
    positionMode: "flow",
    x: 0,
    y: 0,
    zIndex: 1,
    hideOn: [],
  },
  rules: {
    canDrag: (node) => node.data.props.positionMode !== "free",
  },
  related: {
    settings: TextSettings,
  },
};
