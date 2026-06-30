"use client";

import React, { useEffect, useRef, useState } from "react";
import { Frame, Element } from "@craftjs/core";
import { Container } from "./nodes/Container";
import { useEditorTheme } from "./ThemeContext";
import { useResize } from "./components/ResizeContext";
import { useCanvasTransform } from "./components/CanvasTransformContext";
import { Minus, Plus, RotateCcw, Monitor, Tablet, Smartphone } from "lucide-react";

interface EditorCanvasProps {
  isPreviewMode?: boolean;
  viewportWidth: "desktop" | "tablet" | "mobile";
  setViewportWidth: React.Dispatch<React.SetStateAction<"desktop" | "tablet" | "mobile">>;
}

export const EditorCanvas = ({ 
  isPreviewMode = false,
  viewportWidth,
  setViewportWidth
}: EditorCanvasProps) => {
  const { theme } = useEditorTheme();
  const { isResizing } = useResize();
  const { zoom, panX, panY, setZoom, setPan, resetTransform, zoomIn, zoomOut } = useCanvasTransform();

  const viewportRef = useRef<HTMLDivElement>(null);
  const hasFittedRef = useRef(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Reset zoom and pan when entering preview mode
  useEffect(() => {
    if (isPreviewMode) {
      resetTransform();
    }
  }, [isPreviewMode, resetTransform]);

  // Handle initial shrink-to-fit auto-zoom on mount
  useEffect(() => {
    if (isPreviewMode) return;
    if (hasFittedRef.current) return;
    const viewport = viewportRef.current;
    if (!viewport) return;

    const resizeObserver = new ResizeObserver(() => {
      const availableWidth = viewport.clientWidth;
      if (availableWidth > 0) {
        hasFittedRef.current = true;
        const targetWidth = 1152;
        const margin = 64; // 32px padding on left/right
        if (availableWidth < targetWidth + margin) {
          const fittedZoom = (availableWidth - margin) / targetWidth;
          setZoom(Math.max(0.25, parseFloat(fittedZoom.toFixed(2))));
        } else {
          setZoom(1);
        }
        // Disconnect after initial fit to allow manual zoom
        resizeObserver.disconnect();
      }
    });

    resizeObserver.observe(viewport);
    return () => {
      resizeObserver.disconnect();
    };
  }, [isPreviewMode, setZoom]);

  // Handle keyboard spacebar detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger pan mode if user is typing in an input/textarea
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === "INPUT" ||
        activeEl.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement).isContentEditable
      );

      if (e.code === "Space" && !isTyping) {
        // Prevent default spacebar page scrolling
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Set up non-passive wheel listener for Ctrl+Scroll zooming
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Zoom action
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
        setZoom((prevZoom) => prevZoom * zoomFactor);
      } else {
        // Normal scroll = Pan canvas
        e.preventDefault();
        // Shift + Wheel = Horizontal Pan
        if (e.shiftKey) {
          setPan((x) => x - e.deltaY * 0.8, (y) => y);
        } else {
          setPan((x) => x - e.deltaX * 0.8, (y) => y - e.deltaY * 0.8);
        }
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [setZoom, setPan]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Pan starts either if Space is pressed, or if middle mouse button (button 1) is clicked
    const isMiddleClick = e.button === 1;
    if (isSpacePressed || isMiddleClick) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX,
        panY
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();

    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    setPan(
      panStartRef.current.panX + dx,
      panStartRef.current.panY + dy
    );
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleFitScreen = () => {
    resetTransform();
    const viewport = viewportRef.current;
    if (viewport) {
      const availableWidth = viewport.clientWidth;
      if (availableWidth > 0) {
        const targetWidth = 1152;
        const margin = 64;
        if (availableWidth < targetWidth + margin) {
          const fittedZoom = (availableWidth - margin) / targetWidth;
          setZoom(Math.max(0.25, parseFloat(fittedZoom.toFixed(2))));
        } else {
          setZoom(1);
        }
      }
    }
  };

  const themeStyles = {
    "--theme-primary": theme.colors.primary,
    "--theme-secondary": theme.colors.secondary,
    "--theme-background": theme.colors.background,
    "--theme-text": theme.colors.text,
    "--theme-heading-font": `${theme.typography.headingFont}, sans-serif`,
    "--theme-body-font": `${theme.typography.bodyFont}, sans-serif`,
    
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: `${theme.typography.bodyFont}, sans-serif`,
  } as React.CSSProperties;

  // Visual cursor state
  const getCursorClass = () => {
    if (isPanning) return "cursor-grabbing";
    if (isSpacePressed) return "cursor-grab";
    return "cursor-default";
  };

  const getCanvasWidth = () => {
    switch (viewportWidth) {
      case "tablet": return "768px";
      case "mobile": return "375px";
      case "desktop":
      default:
        return "1152px";
    }
  };

  return (
    <div 
      ref={viewportRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`flex-1 bg-[#141127] overflow-hidden flex justify-center items-start transition-colors duration-200 relative ${
        isPreviewMode ? "p-0" : "p-6 md:p-8"
      } ${getCursorClass()}`}
    >
      
      {/* Floating Responsive Switcher in Preview Mode */}
      {isPreviewMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1C1835]/90 backdrop-blur-xs border border-[#2A2640] p-1 rounded-xl shadow-md z-30">
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
                    : "text-muted hover:text-white hover:bg-[#141127]"
                }`}
                title={device.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      )}

      {/* Transformation wrapper */}
      <div
        className={`min-h-[600px] transition-all duration-75 overflow-hidden shrink-0 ${
          isPreviewMode && viewportWidth === "desktop"
            ? "border-none shadow-none rounded-none" 
            : "border border-[#2A2640] rounded-2xl shadow-xs"
        }`}
        style={{
          ...themeStyles,
          width: getCanvasWidth(),
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "top center",
          pointerEvents: isResizing ? "none" : undefined,
        }}
      >
        <Frame>
          <Element is={Container} padding={24} canvas />
        </Frame>
      </div>

      {/* Floating Canvas Transform Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-1.5 p-1.5 bg-[#1C1835]/90 backdrop-blur-xs border border-[#2A2640] shadow-md rounded-xl z-30">
        <button
          onClick={zoomOut}
          className="p-1.5 text-muted hover:text-white hover:bg-[#141127] rounded-lg transition-colors cursor-pointer"
          title="Reducir Zoom"
        >
          <Minus className="h-4 w-4" />
        </button>
        
        <span className="text-[10px] font-bold font-mono px-2 text-center min-w-[48px] text-white">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          className="p-1.5 text-muted hover:text-white hover:bg-[#141127] rounded-lg transition-colors cursor-pointer"
          title="Aumentar Zoom"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="w-px h-4 bg-[#2A2640] mx-1" />

        <button
          onClick={handleFitScreen}
          className="p-1.5 text-muted hover:text-white hover:bg-[#141127] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          title="Ajustar Pantalla (100%)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Spacebar Pan Instruction overlay (optional, subtle info) */}
      {!isPreviewMode && isSpacePressed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 bg-[#1C1835]/90 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full shadow-sm border border-[#2A2640] z-30 pointer-events-none">
          Modo Panorámico: Arrastra para mover el lienzo
        </div>
      )}

    </div>
  );
};
