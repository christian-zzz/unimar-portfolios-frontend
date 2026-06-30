"use client";

import React, { createContext, useContext, useState } from "react";

interface ResizeContextType {
  isResizing: boolean;
  setIsResizing: (val: boolean) => void;
}

const ResizeContext = createContext<ResizeContextType | undefined>(undefined);

export const ResizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isResizing, setIsResizing] = useState(false);

  return (
    <ResizeContext.Provider value={{ isResizing, setIsResizing }}>
      {children}
    </ResizeContext.Provider>
  );
};

export const useResize = () => {
  const context = useContext(ResizeContext);
  if (!context) {
    throw new Error("useResize must be used within a ResizeProvider");
  }
  return context;
};
