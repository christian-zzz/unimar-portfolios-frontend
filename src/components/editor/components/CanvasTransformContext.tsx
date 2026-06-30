"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface CanvasTransformContextType {
  zoom: number;
  panX: number;
  panY: number;
  setZoom: (zoom: number | ((z: number) => number)) => void;
  setPan: (panX: number | ((x: number) => number), panY: number | ((y: number) => number)) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
  viewportWidth: "desktop" | "tablet" | "mobile";
  isPreviewMode: boolean;
}

const CanvasTransformContext = createContext<CanvasTransformContextType | undefined>(undefined);

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3.0;
export const ZOOM_STEP = 0.1;

export const CanvasTransformProvider = ({ 
  viewportWidth = "desktop",
  isPreviewMode = false,
  children 
}: { 
  viewportWidth?: "desktop" | "tablet" | "mobile";
  isPreviewMode?: boolean;
  children: React.ReactNode;
}) => {
  const [zoom, setZoomState] = useState(1);
  const [panX, setPanXState] = useState(0);
  const [panY, setPanYState] = useState(0);

  const setZoom = useCallback((val: number | ((z: number) => number)) => {
    setZoomState((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    });
  }, []);

  const setPan = useCallback((
    x: number | ((prevX: number) => number),
    y: number | ((prevY: number) => number)
  ) => {
    setPanXState((prevX) => (typeof x === "function" ? x(prevX) : x));
    setPanYState((prevY) => (typeof y === "function" ? y(prevY) : y));
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => z + ZOOM_STEP), [setZoom]);
  const zoomOut = useCallback(() => setZoom((z) => z - ZOOM_STEP), [setZoom]);
  const resetTransform = useCallback(() => {
    setZoomState(1);
    setPanXState(0);
    setPanYState(0);
  }, []);

  return (
    <CanvasTransformContext.Provider
      value={{
        zoom,
        panX,
        panY,
        setZoom,
        setPan,
        zoomIn,
        zoomOut,
        resetTransform,
        viewportWidth,
        isPreviewMode,
      }}
    >
      {children}
    </CanvasTransformContext.Provider>
  );
};

export const useCanvasTransform = () => {
  const context = useContext(CanvasTransformContext);
  if (!context) {
    throw new Error("useCanvasTransform must be used within a CanvasTransformProvider");
  }
  return context;
};
