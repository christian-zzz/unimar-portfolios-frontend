"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import Link from "next/link";
import { showSuccess, showError } from "@/lib/alerts";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Eye, 
  EyeOff, 
  Moon, 
  Loader2, 
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink
} from "lucide-react";
import { useTheme } from "next-themes";
import { PublishModal } from "./components/PublishModal";

interface EditorTopbarProps {
  portfolioSlug: string | null;
  isPublished: boolean;
  viewportWidth: "desktop" | "tablet" | "mobile";
  setViewportWidth: (val: "desktop" | "tablet" | "mobile") => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  showTopbar: boolean;
  setShowTopbar: (val: boolean) => void;
  onPublishSuccess: (portfolio: any) => void;
  portfolio: any;
}

export const EditorTopbar = ({
  portfolioSlug,
  viewportWidth,
  setViewportWidth,
  isPreviewMode,
  setIsPreviewMode,
  showTopbar,
  setShowTopbar,
  onPublishSuccess,
  portfolio
}: EditorTopbarProps) => {
  const { setTheme } = useTheme();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = React.useState(false);

  const { query } = useEditor();

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    
    // Craft.js native canvas serialization
    const content = query.serialize();

    try {
      const response = await fetch(`${apiUrl}/api/portfolio/save`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          draft_content: JSON.parse(content),
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el borrador.");
      }
    } catch (err) {
      console.error(err);
      showError("Error de red al intentar guardar el borrador.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (thumbnail: File | null, categoryIds: string[], removeThumbnail: boolean) => {
    setIsPublishing(true);
    const token = localStorage.getItem("token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const formData = new FormData();
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    if (removeThumbnail) {
      formData.append("remove_thumbnail", "true");
    }
    if (categoryIds.length > 0) {
      formData.append("categories", categoryIds.join(","));
    }

    try {
      const response = await fetch(`${apiUrl}/api/portfolio/publish`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo publicar el portafolio.");
      }

      const data = await response.json();
      onPublishSuccess(data.portfolio);

      // On-demand revalidation call
      if (portfolioSlug) {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: [`/p/${portfolioSlug}`] }),
        }).catch(err => console.error("Failed to revalidate:", err));
      }

      showSuccess("¡Felicidades! Tu portafolio ha sido publicado exitosamente.");
      setIsPublishModalOpen(false);
    } catch (err) {
      console.error(err);
      showError("Error de red al intentar publicar el portafolio.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!showTopbar || isPreviewMode) return null;

  return (
    <header className="h-14 border-b border-[#2A2640] bg-[#1C1835] flex items-center justify-between px-6 shrink-0 z-40 transition-all duration-200">
      {/* Left side: Back to Dashboard & Brand Logo */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white transition-colors py-1.5 px-3 border border-[#2A2640] bg-[#141127] rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 border-l border-[#2A2640] pl-4">
          <span className="font-tactic text-base font-black text-brand-orange leading-tight">
            Folium.
          </span>
        </div>

        {portfolioSlug && (
          <a
            href={`/p/${portfolioSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold text-[#ED6C31] hover:underline uppercase tracking-wider bg-[#ED6C31]/20 px-2 py-1 rounded-md"
          >
            Ver en vivo
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Responsive Viewport Switcher */}
      <div className="hidden md:flex items-center gap-1 bg-[#141127] border border-[#2A2640] p-1 rounded-xl">
        {[
          { id: "desktop", icon: Monitor, label: "Escritorio" },
          { id: "tablet", icon: Tablet, label: "Tablet" },
          { id: "mobile", icon: Smartphone, label: "Móvil" }
        ].map((device) => {
          const Icon = device.icon;
          const isActive = viewportWidth === device.id;
          return (
            <button
              key={device.id}
              onClick={() => setViewportWidth(device.id as "desktop" | "tablet" | "mobile")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isActive 
                  ? "bg-[#273E92] text-white" 
                  : "text-muted hover:text-white hover:bg-[#1C1835]"
              }`}
              title={device.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Action CTAs */}
      <div className="flex items-center gap-3">
        
        {/* Save Draft */}
        <button
          onClick={handleSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#2A2640] hover:bg-[#141127] rounded-lg transition-colors cursor-pointer disabled:opacity-50 text-white"
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ED6C31]" />
          ) : (
            <Save className="h-3.5 w-3.5 text-muted" />
          )}
          {isSaving ? "Guardando..." : "Guardar Borrador"}
        </button>
        
        {/* Publish */}
        <button
          onClick={() => setIsPublishModalOpen(true)}
          disabled={isPublishing}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#273E92] hover:bg-[#273E92]/95 text-white rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
        >
          {isPublishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {isPublishing ? "Publicando..." : "Publicar"}
        </button>

        {/* Vista Previa Button */}
        <button
          onClick={() => setIsPreviewMode(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#2A2640] hover:bg-[#141127] rounded-lg transition-colors cursor-pointer text-white"
          title="Vista previa del portafolio"
        >
          <Eye className="h-3.5 w-3.5 text-muted" />
          Vista Previa
        </button>

        {/* Hide Topbar Trigger */}
        <button
          onClick={() => setShowTopbar(false)}
          className="p-1.5 text-muted hover:text-white rounded-lg transition-colors hover:bg-[#141127] cursor-pointer"
          title="Ocultar barra superior (Modo inmersivo)"
        >
          <EyeOff className="h-4 w-4" />
        </button>

        {/* Inline Theme Toggle */}
        <button
          onClick={() => setTheme("dark")} // Keep locked to dark
          className="p-1.5 text-muted hover:text-white rounded-lg transition-colors hover:bg-[#141127] border border-[#2A2640] cursor-pointer"
        >
          <Moon className="h-4 w-4 text-[#C5E4E4]" />
        </button>
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
        isPublishing={isPublishing}
        initialThumbnailPath={portfolio?.thumbnail_path}
        initialSelectedCategoryIds={portfolio?.categories?.map((c: any) => c.id)}
      />
    </header>
  );
};
