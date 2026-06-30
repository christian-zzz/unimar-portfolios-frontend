"use client";

import { useNode, useEditor } from "@craftjs/core";
import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import { ResizableWrapper } from "../components/ResizableWrapper";
import { PositionSettings } from "../components/PositionSettings";
import { 
  Sparkles, 
  Link as LinkIcon, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  AlertCircle
} from "lucide-react";

export interface AnimationNodeProps {
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  width?: string;
  height?: string;
  borderRadius?: number;
  positionMode?: "flow" | "free";
  x?: number;
  y?: number;
  zIndex?: number;
  hideOn?: string[];
}

export const AnimationNode = ({
  src = "",
  autoplay = true,
  loop = true,
  width = "100%",
  height = "auto",
  borderRadius = 12
}: AnimationNodeProps) => {
  const { actions: { setProp } } = useNode();
  const { enabled: isEditorEnabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch Lottie JSON content when URL changes
  useEffect(() => {
    if (!src) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimationData(null);
      return;
    }

    let isMounted = true;
    fetch(`/api/proxy/lottie?url=${encodeURIComponent(src)}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo descargar la animación JSON.");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setAnimationData(data);
          setError(null);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setError("Error al cargar la animación.");
          setAnimationData(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

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
      if (file.name.endsWith(".json") || file.type === "application/json") {
        await uploadAnimationFile(file);
      } else {
        alert("Solo se permiten archivos JSON de animación (Lottie).");
      }
    }
  };

  const uploadAnimationFile = async (file: File) => {
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
        setProp((p: AnimationNodeProps) => {
          p.src = data.url;
        });
        window.dispatchEvent(new Event("media-uploaded"));
      } else {
        alert(data.message || "Error al subir la animación.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de red al subir la animación.");
    } finally {
      setIsUploading(false);
    }
  };

  const containerStyles: React.CSSProperties = {
    borderRadius: `${borderRadius}px`,
    overflow: "hidden",
    width: "100%",
    height: "100%",
  };

  return (
    <ResizableWrapper width={width} height={height}>
      <div
        style={containerStyles}
        onDragEnter={src || !isEditorEnabled ? undefined : handleDrag}
        onDragOver={src || !isEditorEnabled ? undefined : handleDrag}
        onDragLeave={src || !isEditorEnabled ? undefined : handleDrag}
        onDrop={src || !isEditorEnabled ? undefined : handleDrop}
        className={`relative border border-[#2A2640] bg-[#141127] w-full h-full min-h-[140px] flex items-center justify-center ${
          dragActive && isEditorEnabled ? "border-[#273E92] border-2" : ""
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#ED6C31]" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono mt-2">
              Subiendo Animación Lottie...
            </span>
          </div>
        ) : animationData ? (
          <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={autoplay}
            style={{ width: "100%", height: "100%" }}
          />
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center p-8 text-red-400">
            <AlertCircle className="h-6 w-6 mb-2" />
            <span className="text-[9px] uppercase font-mono">{error}</span>
          </div>
        ) : !isEditorEnabled ? (
          // Clean public empty placeholder
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <Sparkles className="h-6 w-6 stroke-1 mb-2" />
            <span className="text-[9px] uppercase font-bold tracking-widest font-mono">
              Lienzo de animación
            </span>
          </div>
        ) : (
          // Clean Bento placeholder
          <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <Sparkles className={`h-8 w-8 stroke-1 ${dragActive ? "text-[#ED6C31] scale-110" : "text-[#8E8D9B]"} transition-all duration-200`} />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono mt-2 text-white">
              {dragActive ? "¡Suelta para Subir!" : "Animación Lottie sin origen"}
            </span>
            <p className="text-[9px] text-[#8E8D9B] max-w-xs mt-1 leading-relaxed">
              {dragActive 
                ? "Suelta el JSON aquí para cargarlo automáticamente" 
                : "Suelta una animación Lottie (.json) aquí o usa la pestaña Archivos."}
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

export const AnimationSettings = () => {
  const { actions: { setProp }, props } = useNode((node) => ({
    props: node.data.props,
  }));

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
            onChange={(e) => setProp((p: AnimationNodeProps) => { p.src = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            placeholder="https://ejemplo.com/animacion.json"
          />
        </div>

        {/* Upload Lottie Instructions */}
        <div className="pt-2">
          <div className="p-3 bg-[#273E92]/10 border border-[#273E92]/30 rounded-xl text-center">
            <Sparkles className="h-4 w-4 text-[#ED6C31] mx-auto mb-1.5" />
            <span className="text-[10px] font-bold text-[#ED6C31] uppercase tracking-wider block mb-1">
              ¿Añadir Animación?
            </span>
            <p className="text-[9px] text-[#8E8D9B] leading-relaxed">
              Arrastra un archivo JSON de Lottie directamente sobre el cuadro vacío, o arrastra un archivo desde la pestaña <strong className="text-white">Archivos</strong>.
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Accordion 2: Reproducción */}
      <SettingsSection title="Reproducción" defaultOpen={true}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Auto-reproducción
            </label>
            <input 
              type="checkbox"
              checked={props.autoplay ?? true}
              onChange={(e) => setProp((p: AnimationNodeProps) => { p.autoplay = e.target.checked; })}
              className="accent-[#ED6C31] cursor-pointer h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[10px] font-medium text-[#FFB598]">
              Bucle (Loop)
            </label>
            <input 
              type="checkbox"
              checked={props.loop ?? true}
              onChange={(e) => setProp((p: AnimationNodeProps) => { p.loop = e.target.checked; })}
              className="accent-[#ED6C31] cursor-pointer h-4 w-4"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Accordion 3: Estilo */}
      <SettingsSection title="Estilo" defaultOpen={true}>
        {/* Width Control */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-[#FFB598]">
            Ancho (Width)
          </label>
          <input 
            type="text"
            value={props.width || ""}
            onChange={(e) => setProp((p: AnimationNodeProps) => { p.width = e.target.value; })}
            className="w-full rounded-lg border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden"
            placeholder="Ej. 100%, 200px"
          />
        </div>

        {/* Border Radius Slider */}
        <div className="space-y-1.5 pt-2">
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
            onChange={(e) => setProp((p: AnimationNodeProps) => { p.borderRadius = parseInt(e.target.value); })}
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

AnimationNode.craft = {
  displayName: "Animación",
  props: {
    src: "",
    autoplay: true,
    loop: true,
    width: "100%",
    height: "auto",
    borderRadius: 12,
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
    settings: AnimationSettings,
  },
};