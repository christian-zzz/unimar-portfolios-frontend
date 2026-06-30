"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Loader2, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (thumbnail: File | null, selectedCategoryIds: string[], removeThumbnail: boolean) => Promise<void>;
  isPublishing: boolean;
  initialThumbnailPath?: string | null;
  initialSelectedCategoryIds?: string[];
}

export const PublishModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
  initialThumbnailPath,
  initialSelectedCategoryIds,
}: PublishModalProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/public/categories`, {
          headers: {
            "Accept": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories for publish:", err);
      }
    };

    fetchCategories();

    // Populate initial selections
    if (initialSelectedCategoryIds) {
      setSelectedIds(initialSelectedCategoryIds);
    } else {
      setSelectedIds([]);
    }

    if (initialThumbnailPath) {
      const isAbsolute = initialThumbnailPath.startsWith("http");
      setThumbnailPreview(isAbsolute ? initialThumbnailPath : `${apiUrl}/storage/${initialThumbnailPath}`);
      setThumbnailFile(null);
      setRemoveThumbnail(false);
    } else {
      setThumbnailPreview(null);
      setThumbnailFile(null);
      setRemoveThumbnail(false);
    }
  }, [isOpen, initialThumbnailPath, initialSelectedCategoryIds, apiUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setRemoveThumbnail(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePublish = () => {
    onConfirm(thumbnailFile, selectedIds, removeThumbnail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="bg-[#1C1835] border border-[#2A2640] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2A2640]">
          <h3 className="text-sm font-medium uppercase tracking-wider text-white">
            Publicar Portafolio
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#8E8D9B] hover:text-white hover:bg-[#141127] rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Cover image uploader */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#8E8D9B]">
              Imagen de Portada (Miniatura)
            </label>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#2A2640] hover:border-[#273E92] rounded-xl p-4 bg-[#141127] transition-colors relative group min-h-[160px]">
              {thumbnailPreview ? (
                <div className="w-full h-full flex flex-col items-center">
                  <div className="relative w-48 h-28 max-h-[120px] rounded-lg shadow-md overflow-hidden">
                    <Image
                      src={thumbnailPreview}
                      alt="Vista previa de miniatura"
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                      setRemoveThumbnail(true);
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
                  <span className="text-[10px] text-[#8E8D9B] mt-1">PNG, JPG hasta 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Categories select */}
          <div className="space-y-2">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[#8E8D9B]">
              Selecciona Categorías / Etiquetas
            </label>
            
            {categories.length === 0 ? (
              <p className="text-xs text-[#8E8D9B] italic">Cargando categorías...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
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

        {/* Footer actions */}
        <div className="bg-[#141127] px-6 py-4 flex justify-end gap-3 border-t border-[#2A2640]">
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 rounded-lg border border-[#2A2640] text-xs font-medium text-[#8E8D9B] hover:text-white hover:bg-[#1C1835] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#273E92] hover:bg-[#1d3070] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isPublishing ? "Publicando..." : "Confirmar y Publicar"}
          </button>
        </div>

      </div>
    </div>
  );
};
