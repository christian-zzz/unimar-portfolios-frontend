"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Edit3, 
  Globe, 
  Image as ImageIcon, 
  Upload, 
  ExternalLink, 
  CheckCircle2,
  Trash2,
  Loader2,
  Send,
  Plus,
  Check,
  Sparkles,
  Video as VideoIcon,
  FileText
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MediaItem {
  id: string;
  file_name: string;
  file_path: string;
  url: string;
  disk: string;
  mime_type: string;
}

interface Portfolio {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  thumbnail_path: string | null;
  categories?: Category[];
}

export default function PortfolioHubPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Publish / Settings states inside the page
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [publishFile, setPublishFile] = useState<File | null>(null);
  const [publishPreview, setPublishPreview] = useState<string | null>(null);
  const [removePublishThumbnail, setRemovePublishThumbnail] = useState(false);

  // Form states for title and slug
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const publishFileInputRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const getThumbnailUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${apiUrl}/storage/${path}`;
  };

  // Initial Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        // Fetch Portfolio
        const portRes = await fetch(`${apiUrl}/api/portfolio`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });
        
        if (portRes.ok) {
          const portData = await portRes.json();
          setPortfolio(portData);
          setTitle(portData.title);
          setSlug(portData.slug);
          
          // Hydrate categories and cover previews from DB
          setSelectedCategoryIds(portData.categories?.map((c: any) => c.id) || []);
          if (portData.thumbnail_path) {
            setPublishPreview(getThumbnailUrl(portData.thumbnail_path));
          }
        }

        // Fetch categories list
        const catRes = await fetch(`${apiUrl}/api/public/categories`, {
          headers: {
            "Accept": "application/json",
          },
        });
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }

        // Fetch Media library
        const mediaRes = await fetch(`${apiUrl}/api/media`, {
          headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });

        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setMediaList(mediaData.media || []);
        }

      } catch (err) {
        console.error("Failed to load portfolio dashboard data:", err);
        setErrorMessage("Error de conexión al cargar la información del portafolio.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Handle Meta updates (Title & Slug)
  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) return;

    setIsSavingMeta(true);
    setErrorMessage("");
    setIsSaved(false);

    const token = localStorage.getItem("token");
    const oldSlug = portfolio?.slug;

    try {
      const response = await fetch(`${apiUrl}/api/portfolio/meta`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, slug }),
      });

      const data = await response.json();

      if (response.ok) {
        setPortfolio(data.portfolio);
        setTitle(data.portfolio.title);
        setSlug(data.portfolio.slug);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 4000);

        // Revalidate Next.js path caches instantly
        const pathsToRevalidate = [];
        if (oldSlug) pathsToRevalidate.push(`/p/${oldSlug}`);
        if (data.portfolio.slug) pathsToRevalidate.push(`/p/${data.portfolio.slug}`);

        if (pathsToRevalidate.length > 0) {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: pathsToRevalidate }),
          }).catch(err => console.error("Failed to revalidate path caches:", err));
        }
      } else {
        setErrorMessage(data.message || "Error al actualizar la configuración.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión al intentar guardar la configuración.");
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Handle Publish / Save settings inside page
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    if (publishFile) {
      formData.append("thumbnail", publishFile);
    }
    if (removePublishThumbnail) {
      formData.append("remove_thumbnail", "true");
    }
    if (selectedCategoryIds.length > 0) {
      formData.append("categories", selectedCategoryIds.join(","));
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
      setPortfolio(data.portfolio);
      setSelectedCategoryIds(data.portfolio.categories?.map((c: any) => c.id) || []);
      if (data.portfolio.thumbnail_path) {
        setPublishPreview(getThumbnailUrl(data.portfolio.thumbnail_path));
      } else {
        setPublishPreview(null);
      }
      setPublishFile(null);
      setRemovePublishThumbnail(false);

      // Revalidate cache instantly
      if (data.portfolio.slug) {
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paths: [`/p/${data.portfolio.slug}`] }),
        }).catch(err => console.error("Failed to revalidate path caches:", err));
      }

      alert("¡Portafolio publicado y configuración guardada exitosamente!");
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de red al intentar guardar la configuración de publicación.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle Unpublish
  const handleUnpublish = async () => {
    if (!confirm("¿Estás seguro de que deseas retirar tu portafolio del aire? Dejará de ser accesible para el público de inmediato.")) {
      return;
    }

    setIsUnpublishing(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${apiUrl}/api/portfolio/unpublish`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data.portfolio);

        // Revalidate cache instantly so the page immediately returns 404
        if (data.portfolio.slug) {
          await fetch("/api/revalidate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths: [`/p/${data.portfolio.slug}`] }),
          }).catch(err => console.error("Failed to revalidate path caches:", err));
        }

        alert("Tu portafolio ha sido retirado del aire. Ahora está en modo Borrador.");
      } else {
        alert("Ocurrió un error al retirar el portafolio.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al intentar despublicar el portafolio.");
    } finally {
      setIsUnpublishing(false);
    }
  };

  // Handle local file selection for cover/thumbnail
  const handlePublishFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPublishFile(file);
      setPublishPreview(URL.createObjectURL(file));
      setRemovePublishThumbnail(false);
    }
  };

  const toggleCategorySelection = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Trigger File Input Click for library
  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle Media Upload for library
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

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

      if (response.ok) {
        setMediaList((prev) => [data.media, ...prev]);
      } else {
        setErrorMessage(data.message || "Error al subir el archivo.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Error de conexión al intentar subir el archivo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Media Deletion
  const handleDeleteMedia = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo permanentemente? Si está siendo usado en tu lienzo, se romperá.")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${apiUrl}/api/media/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        setMediaList((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("No se pudo eliminar el archivo.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al intentar eliminar el archivo.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] w-full flex flex-col items-center justify-center text-[#8E8D9B]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB598] mb-3" />
        <span className="text-sm font-medium">Cargando portafolio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans select-none">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Mi Portafolio
        </h1>
        <p className="text-xs text-[#E5DEFE]/70 leading-relaxed mt-2 font-medium">
          Gestiona el estado de tu publicación, configura la dirección URL de tu portafolio y administra tu biblioteca de medios.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-2xl text-xs text-red-400 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Big Card: Visual Canvas Editor Launch */}
        <div className="lg:col-span-2 bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 h-48 w-48 rounded-full bg-[#273E92]/5 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                portfolio?.is_published 
                  ? "bg-[#C5E4E4]/10 text-[#C5E4E4] border border-[#C5E4E4]/30" 
                  : "bg-[#FFB598]/10 text-[#FFB598] border border-[#FFB598]/20"
              }`}>
                {portfolio?.is_published ? "Publicado" : "Borrador"}
              </span>
              
              {portfolio?.is_published && (
                <button 
                  onClick={handleUnpublish}
                  disabled={isUnpublishing}
                  className="text-[10px] text-[#FFB598] hover:text-white underline transition-colors cursor-pointer disabled:opacity-50 font-semibold"
                >
                  {isUnpublishing ? "Despublicando..." : "Retirar de producción"}
                </button>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-white">
              {portfolio?.title || "Lienzo Creativo del Portafolio"}
            </h2>
            
            <p className="text-xs text-[#E5DEFE]/70 leading-relaxed max-w-lg font-medium">
              Diseña la disposición de tus obras mediante la herramienta de arrastrar y soltar. Agrega contenedores, textos e imágenes de forma intuitiva.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center relative z-10">
            <Link 
              href="/editor"
              className="flex items-center gap-2 rounded-xl bg-[#273E92] hover:bg-[#273E92]/95 text-white px-5 py-3 text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              Lanzar Editor Visual
            </Link>
            
            {portfolio?.is_published && (
              <a 
                href={`/p/${portfolio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFB598] hover:text-white transition-colors py-2 px-3 border border-[#2A2640] rounded-xl bg-[#141127] hover:bg-[#141127]/80"
              >
                Ver Sitio Público
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Card: Custom URL / Domain Configuration */}
        <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#273E92]/20 border border-[#273E92]/30 text-white">
              <Globe className="h-5 w-5 text-[#ED6C31]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Identidad del Sitio
              </h3>
              <p className="text-xs text-[#E5DEFE]/70 mt-1 leading-relaxed font-medium">
                Personaliza la dirección pública y el título de tu portafolio institucional.
              </p>
            </div>

            <form onSubmit={handleSaveMeta} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#FFB598] uppercase">Título del Portafolio</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Portafolio de diseño"
                  className="w-full rounded-xl border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white focus:border-[#273E92] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-[#FFB598] uppercase">Dirección URL (Slug)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#2A2640] bg-[#141127] text-[10px] text-muted font-mono select-all">
                    /p/
                  </span>
                  <input 
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="mi-url"
                    className="flex-grow min-w-0 rounded-r-xl border border-[#2A2640] bg-[#141127] px-3 py-2 text-xs text-white focus:border-[#273E92] focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSavingMeta}
                className="w-full bg-[#273E92] hover:bg-[#273E92]/95 text-white rounded-xl py-2.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 mt-1.5 flex items-center justify-center gap-1.5"
              >
                {isSavingMeta && <Loader2 className="h-3 w-3 animate-spin text-white" />}
                Guardar Configuración
              </button>
            </form>
          </div>

          {isSaved && (
            <div className="mt-4 flex gap-2 items-center text-xs text-emerald-400 font-semibold bg-emerald-950/10 border border-emerald-900/30 p-2.5 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Configuración actualizada correctamente</span>
            </div>
          )}
        </div>

      </div>

      {/* NEW: In-page Publication & Tag settings */}
      <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6">
        <div className="border-b border-[#2A2640] pb-4 mb-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Configuración de Publicación
          </h3>
          <p className="text-xs text-[#E5DEFE]/70 font-medium">
            Administra los metadatos visuales de tu portafolio y activa su visibilidad pública.
          </p>
        </div>

        <form onSubmit={handlePublishSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Thumbnail Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-[#FFB598] uppercase">
                Imagen de Portada (Miniatura)
              </label>

              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#2A2640] hover:border-[#273E92] rounded-xl p-4 bg-[#141127] transition-colors relative group min-h-[160px]">
                {publishPreview ? (
                  <div className="w-full h-full flex flex-col items-center">
                    <div className="relative w-48 h-28 max-h-[120px] rounded-lg shadow-md overflow-hidden">
                      <Image
                        src={publishPreview}
                        alt="Vista previa de miniatura"
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPublishFile(null);
                        setPublishPreview(null);
                        setRemovePublishThumbnail(true);
                      }}
                      className="mt-2 text-[10px] text-[#FFB598] hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Quitar imagen
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
                    <Upload className="h-8 w-8 text-[#FFB598] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-white font-medium">Subir imagen de portada</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG hasta 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={publishFileInputRef}
                      onChange={handlePublishFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Column 2: Category checklist */}
            <div className="space-y-3">
              <label className="text-[10px] font-medium text-[#FFB598] uppercase">
                Categorías / Etiquetas
              </label>

              {categories.length === 0 ? (
                <p className="text-xs text-[#8E8D9B] italic">Cargando categorías...</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategorySelection(cat.id)}
                        className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#273E92]/20 border-[#273E92] text-white font-medium"
                            : "bg-[#141127] border-[#2A2640] text-[#8E8D9B] hover:text-white"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#C5E4E4] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Action CTA */}
          <div className="flex justify-end pt-4 border-t border-[#2A2640]/50">
            <button
              type="submit"
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ED6C31] hover:bg-[#ED6C31]/95 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {portfolio?.is_published ? "Actualizar Publicación" : "Publicar Portafolio"}
            </button>
          </div>
        </form>
      </div>

      {/* Media Library / Gallery Section */}
      <div className="bg-[#1C1835] border border-[#2A2640] rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A2640] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#273E92]/20 border border-[#273E92]/30 text-white">
              <ImageIcon className="h-5 w-5 text-[#ED6C31]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Biblioteca de Medios
              </h3>
              <p className="text-xs text-[#E5DEFE]/70 font-medium">
                Administra imágenes y recursos multimedia que utilizas en el editor.
              </p>
            </div>
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
            <button 
              type="button" 
              onClick={triggerUploadClick}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 border border-[#2A2640] bg-[#141127] rounded-xl px-4 py-2 text-xs font-semibold text-[#FFB598] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ED6C31]" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {isUploading ? "Subiendo..." : "Subir Archivo"}
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {mediaList.length === 0 ? (
          <div className="py-12 border border-dashed border-[#2A2640] rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-[#141127]/30">
            <ImageIcon className="h-8 w-8 text-slate-600 mb-2 stroke-1" />
            <span className="text-xs text-slate-500 font-semibold">Tu biblioteca está vacía</span>
            <span className="text-[10px] text-slate-500 mt-1">Sube tus archivos para utilizarlos en el portafolio</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {mediaList.map((item) => {
              const isImage = item.mime_type && item.mime_type.startsWith("image/");
              const isVideo = item.mime_type && item.mime_type.startsWith("video/");
              const isAnimation = item.mime_type === "application/json" || item.file_name.endsWith(".json");

              return (
                <div 
                  key={item.id} 
                  className="aspect-square bg-[#141127] border border-[#2A2640] rounded-2xl relative overflow-hidden group hover:border-[#273E92] transition duration-150"
                >
                  {isImage ? (
                    <Image
                      src={item.url}
                      alt={item.file_name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                      className="object-cover rounded-2xl"
                    />
                  ) : isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full">
                      <VideoIcon className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
                      <span className="text-[9px] font-bold truncate max-w-full px-1 text-slate-300">{item.file_name}</span>
                    </div>
                  ) : isAnimation ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full">
                      <Sparkles className="h-6 w-6 stroke-1 mb-1 text-[#ED6C31]" />
                      <span className="text-[9px] font-bold truncate max-w-full px-1 text-slate-300">{item.file_name}</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-slate-400 select-none bg-[#141127] h-full">
                      <FileText className="h-6 w-6 stroke-1 mb-1" />
                      <span className="text-[9px] font-bold truncate max-w-full px-1 text-slate-300">{item.file_name}</span>
                    </div>
                  )}
                  
                  {/* Delete button on hover */}
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150 cursor-pointer"
                    title="Eliminar archivo"
                  >
                    <div className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded-xl border border-red-500/30 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              );
            })}
            
            {/* Quick Upload Slot inside the grid */}
            <button
              onClick={triggerUploadClick}
              disabled={isUploading}
              className="aspect-square border border-dashed border-[#2A2640] hover:border-[#273E92]/70 bg-[#141127]/40 hover:bg-[#141127]/80 rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-colors cursor-pointer disabled:opacity-50 animate-fade-in"
            >
              <Plus className="h-6 w-6 text-slate-500 mb-2 stroke-[2]" />
              <span className="text-[10px] text-slate-500 font-bold uppercase">Subir</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
