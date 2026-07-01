"use client";

import React, { useState, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";
import { ImageNode } from "./nodes/ImageNode";
import { VideoNode } from "./nodes/VideoNode";
import { AnimationNode } from "./nodes/AnimationNode";
import { showError, confirmAction } from "@/lib/alerts";
import { 
  Upload, 
  Trash2, 
  Loader2, 
  FileText, 
  AlertCircle, 
  Check, 
  FileWarning,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles
} from "lucide-react";

interface MediaItem {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  file_name: string;
  file_path: string;
  mime_type: string;
  size: number;
  disk: string;
  url: string;
  created_at: string;
  updated_at: string;
}

// Sub-component for rendering custom collapsible sections in Media Grid
const MediaSection = ({ 
  title, 
  count,
  icon: Icon,
  children 
}: { 
  title: string; 
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode; 
}) => {
  const [open, setOpen] = useState(true);
  if (count === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      <button 
        type="button" 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between text-left text-[10px] font-bold uppercase tracking-wider text-[#8E8D9B] hover:text-white transition-colors cursor-pointer border-b border-[#2A2640] pb-1"
      >
        <span className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-[#ED6C31]" />
          {title} ({count})
        </span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {open && <div className="grid grid-cols-2 gap-2 mt-2">{children}</div>}
    </div>
  );
};

export const MediaSidebar = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Craft.js integration to know if an Image/Video/Animation is selected
  const { actions, connectors: { create }, selectedNode } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selectedNode = null;
    if (currentNodeId) {
      selectedNode = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        props: state.nodes[currentNodeId].data.props,
      };
    }
    return {
      selectedNode,
    };
  });

  const isImageSelected = selectedNode?.name === "ImageNode";
  const isVideoSelected = selectedNode?.name === "VideoNode";
  const isAnimationSelected = selectedNode?.name === "AnimationNode";
  const isMediaSelected = isImageSelected || isVideoSelected || isAnimationSelected;

  // Fetch media library on mount
  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/media`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (response.ok && data.media) {
        setMediaList(data.media);
      } else {
        setError(data.message || "Error al cargar la galería.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la biblioteca multimedia.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia();

    const handleMediaUploaded = () => {
      fetchMedia();
    };

    window.addEventListener("media-uploaded", handleMediaUploaded);
    return () => {
      window.removeEventListener("media-uploaded", handleMediaUploaded);
    };
  }, []);

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
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo excede el tamaño máximo permitido de 10 MB.");
      return;
    }

    setIsUploading(true);
    setError(null);

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
        // Prepend to current list (merge the generated URL into the object)
        const newMedia = { ...data.media, url: data.url };
        setMediaList((prev) => [newMedia, ...prev]);
        
        // Auto-assign to currently selected compatible Node if possible
        const isImage = data.media.mime_type.startsWith("image/");
        const isVideo = data.media.mime_type.startsWith("video/");
        const isAnimation = data.media.mime_type === "application/json" || data.media.file_name.endsWith(".json");

        if (selectedNode && ((isImageSelected && isImage) || (isVideoSelected && isVideo) || (isAnimationSelected && isAnimation))) {
          actions.setProp(selectedNode.id, (props: Record<string, unknown> & { src?: string }) => {
            props.src = data.url;
          });
        }
      } else {
        setError(data.message || "Error al subir el archivo.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al subir el archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    const confirmed = await confirmAction("¿Estás seguro de que deseas eliminar este archivo?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const response = await fetch(`${apiUrl}/api/media/${mediaId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMediaList((prev) => prev.filter((item) => item.id !== mediaId));
        
        // Clear src in selected Node if the deleted file was used as src
        if (selectedNode && isMediaSelected && selectedNode.props.src && (selectedNode.props.src as string).includes(mediaId)) {
          actions.setProp(selectedNode.id, (props: Record<string, unknown> & { src?: string }) => {
            props.src = "";
          });
        }
      } else {
        showError(data.message || "No se pudo eliminar el archivo.");
      }
    } catch (err) {
      console.error(err);
      showError("Error al intentar conectar con el servidor.");
    }
  };

  const handleSelectMedia = (url: string, isImage: boolean, isVideo: boolean, isAnimation: boolean) => {
    if (selectedNode && ((isImageSelected && isImage) || (isVideoSelected && isVideo) || (isAnimationSelected && isAnimation))) {
      actions.setProp(selectedNode.id, (props: Record<string, unknown> & { src?: string }) => {
        props.src = url;
      });
    }
  };

  // Group media by type
  const images = mediaList.filter(item => item.mime_type.startsWith("image/"));
  const videos = mediaList.filter(item => item.mime_type.startsWith("video/"));
  const animations = mediaList.filter(item => item.mime_type === "application/json" || item.file_name.endsWith(".json"));
  const documents = mediaList.filter(
    item => !item.mime_type.startsWith("image/") && 
            !item.mime_type.startsWith("video/") && 
            item.mime_type !== "application/json" && 
            !item.file_name.endsWith(".json")
  );

  const renderMediaCard = (media: MediaItem) => {
    const isImage = media.mime_type.startsWith("image/");
    const isVideo = media.mime_type.startsWith("video/");
    const isAnimation = media.mime_type === "application/json" || media.file_name.endsWith(".json");
    
    // Check if the current file is linked to the selected node
    const isUsed = selectedNode && isMediaSelected && selectedNode.props.src === media.url;
    
    // Check if the selected node matches the media type
    const isCompatible = selectedNode && ((isImageSelected && isImage) || 
                         (isVideoSelected && isVideo) || 
                         (isAnimationSelected && isAnimation));

    return (
      <div
        key={media.id}
        ref={(ref) => {
          if (ref) {
            if (isImage) {
              create(ref, <ImageNode src={media.url} alt={media.file_name} />);
            } else if (isVideo) {
              create(ref, <VideoNode src={media.url} />);
            } else if (isAnimation) {
              create(ref, <AnimationNode src={media.url} />);
            }
          }
        }}
        onClick={() => handleSelectMedia(media.url, isImage, isVideo, isAnimation)}
        className={`group relative border rounded-xl overflow-hidden aspect-square cursor-grab transition-all bg-[#141127] ${
          isUsed 
            ? "border-[#273E92] ring-2 ring-[#273E92] ring-offset-1 ring-offset-[#141127]" 
            : isCompatible
              ? "border-[#273E92]/50 hover:border-[#273E92]"
              : "border-[#2A2640] opacity-90 hover:opacity-100"
        }`}
        title={isCompatible ? "Arrastra este elemento al lienzo o haz clic en 'Aplicar'" : media.file_name}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.url}
            alt={media.file_name}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        ) : isVideo ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none pointer-events-none bg-[#141127]">
            <VideoIcon className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
            <span className="text-[8px] font-bold truncate max-w-full px-1">{media.file_name}</span>
          </div>
        ) : isAnimation ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none pointer-events-none bg-[#141127]">
            <Sparkles className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
            <span className="text-[8px] font-bold truncate max-w-full px-1">{media.file_name}</span>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none pointer-events-none">
            <FileText className="h-6 w-6 stroke-1 mb-1" />
            <span className="text-[8px] font-bold truncate max-w-full px-1">{media.file_name}</span>
          </div>
        )}

        {/* Hover Actions overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center gap-1.5 z-10">
          {isCompatible && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectMedia(media.url, isImage, isVideo, isAnimation);
              }}
              className="py-1 px-2.5 bg-[#273E92] text-white text-[9px] font-bold rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Aplicar
            </button>
          )}
          
          {(isImage || isVideo || isAnimation) ? (
            <span className="text-[8px] font-bold text-white uppercase tracking-wider select-none pointer-events-none">
              Arrastrar
            </span>
          ) : (
            <span className="text-[8px] font-bold text-white uppercase tracking-wider select-none pointer-events-none truncate max-w-full">
              {media.file_name}
            </span>
          )}
        </div>

        {/* Badges/Overlays */}
        {isUsed && (
          <div className="absolute top-1 left-1 p-0.5 bg-[#273E92] text-white rounded-md shadow-sm z-10">
            <Check className="h-3 w-3" />
          </div>
        )}

        {/* Delete Button */}
        <button
          onClick={(e) => handleDelete(e, media.id)}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-500 hover:bg-red-650 text-white rounded-md transition-all shadow-xs cursor-pointer z-20"
          title="Eliminar archivo"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1C1835]">
      
      {/* Title */}
      <div className="p-4 border-b border-[#2A2640]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B]">
          Biblioteca de Medios
        </h3>
        <p className="text-[10px] text-muted mt-0.5">
          Sube tus archivos y arrástralos al lienzo o selecciónalos para aplicar a tu lienzo.
        </p>
      </div>

      {/* Mini Dropzone */}
      <div className="p-4 border-b border-[#2A2640] bg-[#141127]">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive 
              ? "border-[#273E92] bg-[#273E92]/20" 
              : "border-[#2A2640] hover:border-[#273E92]/40 bg-[#1C1835] hover:bg-[#273E92]/10"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/json,video/*"
          />

          {isUploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#ED6C31]" />
              <span className="text-[10px] font-bold text-white">Subiendo...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <Upload className="h-4 w-4 text-[#ED6C31]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Subir Archivo</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-red-400 font-semibold bg-red-950/20 p-2 rounded-lg border border-red-900/30">
            <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
            <p className="truncate">{error}</p>
          </div>
        )}
      </div>

      {/* Library Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center text-muted">
            <Loader2 className="h-5 w-5 animate-spin text-[#ED6C31]" />
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Cargando biblioteca...</span>
          </div>
        ) : mediaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted">
            <FileWarning className="h-8 w-8 stroke-1 text-slate-500" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono mt-3 text-slate-400">Sin Archivos</span>
            <p className="text-[9px] text-slate-500 max-w-xs mt-1">Sube tus archivos para agregarlos al portafolio.</p>
          </div>
        ) : (
          <>
            {/* Categorized Sections */}
            <MediaSection title="Imágenes y GIFs" count={images.length} icon={ImageIcon}>
              {images.map(renderMediaCard)}
            </MediaSection>

            <MediaSection title="Videos" count={videos.length} icon={VideoIcon}>
              {videos.map(renderMediaCard)}
            </MediaSection>

            <MediaSection title="Lottie Animaciones" count={animations.length} icon={Sparkles}>
              {animations.map(renderMediaCard)}
            </MediaSection>

            <MediaSection title="Documentos / Otros" count={documents.length} icon={FileText}>
              {documents.map(renderMediaCard)}
            </MediaSection>
          </>
        )}
      </div>

      {/* Helper Context Banner */}
      <div className="p-3 bg-[#141127] border-t border-[#2A2640]">
        {isImageSelected ? (
          <p className="text-[9px] text-[#ED6C31] font-semibold text-center uppercase tracking-wider">
            💡 Arrastra la imagen o clica &quot;Aplicar&quot;
          </p>
        ) : isVideoSelected ? (
          <p className="text-[9px] text-[#ED6C31] font-semibold text-center uppercase tracking-wider">
            🎬 Arrastra el video o clica &quot;Aplicar&quot;
          </p>
        ) : isAnimationSelected ? (
          <p className="text-[9px] text-[#ED6C31] font-semibold text-center uppercase tracking-wider">
            ✨ Arrastra la animación o clica &quot;Aplicar&quot;
          </p>
        ) : (
          <p className="text-[9px] text-muted text-center uppercase tracking-wider">
            Selecciona un elemento en el lienzo para editarlo
          </p>
        )}
      </div>

    </div>
  );
};