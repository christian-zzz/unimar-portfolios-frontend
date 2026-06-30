"use client";

import { useState, useEffect, useRef } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { EditorThemeProvider } from "@/components/editor/ThemeContext";
import { Editor, useEditor } from "@craftjs/core";
import { Toolbox } from "@/components/editor/Toolbox";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { SettingsPanel } from "@/components/editor/SettingsPanel";
import { Container } from "@/components/editor/nodes/Container";
import { TextNode } from "@/components/editor/nodes/TextNode";
import { ImageNode } from "@/components/editor/nodes/ImageNode";
import { VideoNode } from "@/components/editor/nodes/VideoNode";
import { AnimationNode } from "@/components/editor/nodes/AnimationNode";
import { ResizeProvider } from "@/components/editor/components/ResizeContext";
import { CanvasTransformProvider } from "@/components/editor/components/CanvasTransformContext";
import { MultiSelectProvider } from "@/components/editor/components/MultiSelectContext";
import { EditorTopbar } from "@/components/editor/EditorTopbar";
import { 
  Loader2, 
  X
} from "lucide-react";

interface EditorPortfolio {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  draft_content: unknown;
  published_content: unknown;
  settings: unknown;
  thumbnail_path: string | null;
  categories?: Array<{ id: string }>;
}

function EditorWorkspaceContent() {
  const [showTopbar, setShowTopbar] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [portfolio, setPortfolio] = useState<EditorPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { actions: craftActions } = useEditor();
  const [draftContent, setDraftContent] = useState<unknown>(null);
  const hasDeserializedRef = useRef(false);

  // Load the portfolio on mount
  useEffect(() => {
    const fetchPortfolio = async () => {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      try {
        const response = await fetch(`${apiUrl}/api/portfolio`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPortfolio(data);

          if (data.draft_content) {
            setDraftContent(data.draft_content);
          }
        }
      } catch (err) {
        console.error("Error al cargar portafolio:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Deserialize once Craft.js is ready and content has loaded
  useEffect(() => {
    if (draftContent && !hasDeserializedRef.current) {
      hasDeserializedRef.current = true;
      craftActions.deserialize(draftContent as Parameters<typeof craftActions.deserialize>[0]);
    }
  }, [draftContent, craftActions]);

  // Toggle Craft.js edit mode dynamically when in Preview mode
  useEffect(() => {
    craftActions.setOptions((options) => {
      options.enabled = !isPreviewMode;
    });
  }, [isPreviewMode, craftActions]);

  // Listen for Escape key to exit preview mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPreviewMode) {
        setIsPreviewMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#141127] font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ED6C31]" />
          <p className="text-xs text-muted font-medium">Cargando portafolio de diseño...</p>
        </div>
      </div>
    );
  }

  return (
    <CanvasTransformProvider viewportWidth={viewportWidth} isPreviewMode={isPreviewMode}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground transition-colors duration-200 font-sans select-none">
        
        {/* Extracted Topbar - now inside Editor context */}
        <EditorTopbar
          portfolioSlug={portfolio?.slug || null}
          isPublished={portfolio?.is_published || false}
          viewportWidth={viewportWidth}
          setViewportWidth={setViewportWidth}
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
          showTopbar={showTopbar}
          setShowTopbar={setShowTopbar}
          onPublishSuccess={(updatedPortfolio) => setPortfolio(updatedPortfolio)}
        />

        {/* Floating Button to Show Topbar if Hidden (Edit mode only) */}
        {!showTopbar && !isPreviewMode && (
          <button
            onClick={() => setShowTopbar(true)}
            className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 bg-[#1C1835] text-white rounded-xl shadow-lg border border-[#2A2640] hover:bg-[#141127] transition-all text-xs font-semibold cursor-pointer animate-fade-in"
          >
            Mostrar Barra
          </button>
        )}

        {/* Floating Close Button for Vista Previa */}
        {isPreviewMode && (
          <button
            onClick={() => setIsPreviewMode(false)}
            className="fixed top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2 bg-[#1C1835] hover:bg-[#141127] text-white rounded-full shadow-lg border border-[#2A2640] transition-all text-xs font-semibold cursor-pointer select-none"
            title="Salir de Vista Previa (o presiona Esc)"
          >
            <X className="h-3.5 w-3.5" />
            Cerrar Vista Previa
          </button>
        )}

        {/* Immersive 3-Pane Visual Editor Workspace */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          <ResizeProvider>
            {/* Left Pane: Toolbox Elements (Hidden in preview mode) */}
            {!isPreviewMode && <Toolbox />}

            {/* Center Pane: Interactive Live Canvas */}
            <EditorCanvas 
              isPreviewMode={isPreviewMode} 
              viewportWidth={viewportWidth} 
              setViewportWidth={setViewportWidth} 
            />

            {/* Right Pane: Property & Style Inspector (Hidden in preview mode) */}
            {!isPreviewMode && <SettingsPanel />}
          </ResizeProvider>
        </div>

      </div>
    </CanvasTransformProvider>
  );
}

export default function EditorWorkspacePage() {
  return (
    <AuthProvider>
      <EditorThemeProvider>
        <Editor resolver={{ Container, TextNode, ImageNode, VideoNode, AnimationNode }}>
          <MultiSelectProvider>
            <EditorWorkspaceContent />
          </MultiSelectProvider>
        </Editor>
      </EditorThemeProvider>
    </AuthProvider>
  );
}
