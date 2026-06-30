"use client";

import { useNode, useEditor } from "@craftjs/core";
import React, { useState } from "react";
import { ResizableWrapper } from "../components/ResizableWrapper";
import { PositionSettings } from "../components/PositionSettings";
import { 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Compass, 
  ChevronDown, 
  ChevronRight,
  Maximize2,
  Loader2
} from "lucide-react";

export interface ImageNodeProps {
  src?: string;
  alt?: string;
  borderRadius?: number;
  aspectRatio?: "aspect-auto" | "aspect-square" | "aspect-video" | "aspect-4/3";
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill";
  positionMode?: "flow" | "free";
  x?: number;
  y?: number;
  zIndex?: number;
  hideOn?: string[];
}

export const ImageNode = ({
  src = "",
  alt = "Imagen de portafolio",
  borderRadius = 12,
  aspectRatio = "aspect-video",
  width = "100%",
  height = "auto",
  objectFit = "cover"
}: ImageNodeProps) => {
  const { actions: { setProp } } = useNode();
  const { enabled: isEditorEnabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isFreeAspect = aspectRatio === "aspect-auto";

  const getLockRatio = () => {
    switch (aspectRatio) {
      case "aspect-square": return 1;
      case "aspect-video": return 16 / 9;
      case "aspect-4/3": return 4 / 3;
      case "aspect-auto":
      default:
        return false;
    }
  };

  const containerStyles: React.CSSProperties = {
    borderRadius: `${borderRadius}px`,
    overflow: "hidden",
    transition: "all 0.2s ease",
    width: "100%",
    height: "100%",
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "aspect-square": return "aspect-square";
      case "aspect-video": return "aspect-video";
      case "aspect-4/3": return "aspect-4/3";
      case "aspect-auto":
      default:
        return "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        await uploadImageFile(file);
      } else {
        alert("Solo se permiten archivos de imagen en este componente.");
      }
    }
  };

  const uploadImageFile = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/media/upload`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setProp((p: ImageNodeProps) => {
          p.src = data.url;
        });
        
        // Dispatch global event so sidebar gallery automatically updates!
        window.dispatchEvent(new Event("media-uploaded"));
      } else {
        alert(data.message || "Error al subir la imagen.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al subir la imagen.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ResizableWrapper 
      width={width} 
      height={height} 
      lockAspectRatio={getLockRatio()}
    >
      <div
        style={containerStyles}
        onDragEnter={src || !isEditorEnabled ? undefined : handleDrag}
        onDragOver={src || !isEditorEnabled ? undefined : handleDrag}
        onDragLeave={src || !isEditorEnabled ? undefined : handleDrag}
        onDrop={src || !isEditorEnabled ? undefined : handleDrop}
        className={`relative transition-all border border-[#2A2640] bg-[#141127] w-full h-full ${
          !isFreeAspect ? getAspectClass() : ""
        } ${dragActive && isEditorEnabled ? "border-[#273E92] border-2" : ""}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#141127] text-white w-full h-full min-h-[140px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#ED6C31]" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono mt-2">
              Subiendo Imagen...
            </span>
          </div>
        ) : src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full block"
            style={{
              objectFit,
              width: "100%",
              height: "100%",
            }}
          />
        ) : !isEditorEnabled ? (
          // Clean public empty placeholder
          <div 
            className={`flex flex-col items-center justify-center text-center p-8 text-muted w-full h-full transition-all bg-[#141127] ${
              isFreeAspect && height === "auto" ? "min-h-[140px]" : ""
            }`}
          >
            <ImageIcon className="h-6 w-6 stroke-1 text-slate-500" />
            <span className="text-[9px] uppercase font-bold tracking-widest font-mono mt-2 text-slate-500">
              Espacio de imagen
            </span>
          </div>
        ) : (
          // Clean Bento placeholder
          <div 
            className={`flex flex-col items-center justify-center text-center p-8 text-muted w-full h-full transition-all bg-[#141127] ${
              isFreeAspect && height === "auto" ? "min-h-[140px]" : ""
            }`}
          >
            <ImageIcon className={`h-8 w-8 stroke-1 ${dragActive ? "text-[#ED6C31] scale-110" : "text-[#8E8D9B]"} transition-all duration-200`} />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono mt-2 text-white">
              {dragActive ? "¡Suelta para Subir!" : "Imagen sin origen"}
            </span>
            <p className="text-[9px] text-[#8E8D9B] max-w-xs mt-1 leading-relaxed">
              {dragActive 
                ? "Suelta la imagen para cargarla automáticamente" 
                : "Suelta una imagen aquí desde tu PC o usa la pestaña Archivos."}
            </p>
          </div>
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

export const ImageSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

  const isFreeAspect = props.aspectRatio === "aspect-auto";

  return (
    <div className="space-y-2 select-none">
      
      <PositionSettings />

      {/* Accordion 1: Contenido */}
      <SettingsSection title="Contenido" defaultOpen={true}>
        {/* URL Source Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1">
            <LinkIcon className="h-3 w-3" />
            Dirección URL (Source)
          </label>
          <input 
            type="text"
            value={props.src || ""}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.src = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {/* Upload Image Instructions */}
        <div className="pt-2">
          <div className="p-3 bg-[#273E92]/10 border border-[#273E92]/30 rounded-xl text-center">
            <ImageIcon className="h-4 w-4 text-[#ED6C31] mx-auto mb-1.5" />
            <span className="text-[10px] font-bold text-[#ED6C31] uppercase tracking-wider block mb-1">
              ¿Añadir Imagen?
            </span>
            <p className="text-[9px] text-[#8E8D9B] leading-relaxed">
              Arrastra una imagen desde tu ordenador directamente sobre el cuadro vacío, o arrastra un archivo desde la pestaña <strong className="text-white">Archivos</strong>.
            </p>
          </div>
        </div>

        {/* Alternative Text (Alt description) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1">
            <Compass className="h-3 w-3" />
            Descripción Alt (SEO)
          </label>
          <input 
            type="text"
            value={props.alt || ""}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.alt = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            placeholder="Ej. Diseño tridimensional de marca"
          />
        </div>
      </SettingsSection>

      {/* Accordion 2: Dimensiones */}
      <SettingsSection title="Dimensiones" defaultOpen={true}>
        {/* Width Control */}
        <div className="space-y-2">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Ancho (Width)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Completo", value: "100%" },
              { name: "Mitad", value: "50%" },
              { name: "Tercio", value: "33.3%" },
              { name: "Auto", value: "auto" }
            ].map((opt) => (
              <button
                key={opt.name}
                type="button"
                onClick={() => setProp((p: ImageNodeProps) => { p.width = opt.value; })}
                className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                  props.width === opt.value
                    ? "bg-[#273E92] text-white border-[#273E92]"
                    : "border-[#2A2640] text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
          <input 
            type="text"
            value={props.width || ""}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.width = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            placeholder="Ej. 100%, 300px, 20rem"
          />
        </div>

        {/* Height Control (Only applicable if Aspect Ratio is auto) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`text-[10px] font-bold uppercase tracking-wider text-[#8E8D9B]`}>
              Alto (Height)
            </label>
            {!isFreeAspect && (
              <span className="text-[8px] uppercase tracking-wider font-bold text-[#ED6C31] font-mono">
                Aspecto bloqueado
              </span>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!isFreeAspect}
              onClick={() => setProp((p: ImageNodeProps) => { p.height = "auto"; })}
              className={`px-2 py-1 text-[9px] font-bold rounded border transition-all ${
                props.height === "auto" && isFreeAspect
                  ? "bg-[#273E92] text-white border-[#273E92]"
                  : "border-[#2A2640] text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30"
              }`}
            >
              Automático (Auto)
            </button>
          </div>
          <input 
            type="text"
            disabled={!isFreeAspect}
            value={props.height || ""}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.height = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white focus:outline-hidden disabled:opacity-45 disabled:bg-[#141127]/50"
            placeholder="Ej. auto, 250px, 15rem"
          />
        </div>

        {/* Aspect Ratio Picker */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Proporción de Aspecto
          </label>
          <select
            value={props.aspectRatio ?? "aspect-video"}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.aspectRatio = e.target.value as ImageNodeProps["aspectRatio"]; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-2 py-1.5 text-xs text-white focus:outline-hidden"
          >
            <option value="aspect-auto">Libre (Sizing Libre)</option>
            <option value="aspect-square">Cuadrado (1:1)</option>
            <option value="aspect-video">Panorámico (16:9)</option>
            <option value="aspect-4/3">Clásico (4:3)</option>
          </select>
        </div>

        {/* Object Fit Control */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598] flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            Escalado (Object Fit)
          </label>
          <select
            value={props.objectFit ?? "cover"}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.objectFit = e.target.value as ImageNodeProps["objectFit"]; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-2 py-1.5 text-xs text-white focus:outline-hidden"
          >
            <option value="cover">Recortar (Cover - Llena la caja)</option>
            <option value="contain">Contener (Contain - Muestra entera)</option>
            <option value="fill">Estirar (Fill - Deforma ajustando)</option>
          </select>
        </div>
      </SettingsSection>

      {/* Accordion 3: Estética */}
      <SettingsSection title="Estética" defaultOpen={true}>
        {/* Border Radius Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Bordes Redondeados
            </label>
            <span className="text-xs font-mono font-semibold text-white">{props.borderRadius ?? 12}px</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="48" 
            step="2"
            value={props.borderRadius ?? 12}
            onChange={(e) => setProp((p: ImageNodeProps) => { p.borderRadius = parseInt(e.target.value); })}
            className="w-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #C5E4E4 0%, #C5E4E4 ${((props.borderRadius ?? 12) * 100) / 48}%, #2A2640 ${((props.borderRadius ?? 12) * 100) / 48}%, #2A2640 100%)`
            }}
          />
        </div>
      </SettingsSection>

    </div>
  );
};

ImageNode.craft = {
  displayName: "Imagen",
  props: {
    src: "",
    alt: "Imagen de portafolio",
    borderRadius: 12,
    aspectRatio: "aspect-video",
    width: "100%",
    height: "auto",
    objectFit: "cover",
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
    settings: ImageSettings,
  },
};