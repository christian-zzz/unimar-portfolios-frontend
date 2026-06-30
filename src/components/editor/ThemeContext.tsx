"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
}

export interface EditorTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
}

interface ThemeContextType {
  theme: EditorTheme;
  setColors: (colors: Partial<ThemeColors>) => void;
  setTypography: (typography: Partial<ThemeTypography>) => void;
}

const DEFAULT_COLORS: ThemeColors = {
  primary: "#4f46e5",    // Brand Indigo
  secondary: "#10b981",  // Emerald Accent
  background: "#ffffff", // White Canvas
  text: "#171717",       // Neutral Text
};

const DEFAULT_TYPOGRAPHY: ThemeTypography = {
  headingFont: "Inter",
  bodyFont: "Inter",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const EditorThemeProvider = ({ 
  children,
  initialTheme
}: { 
  children: React.ReactNode;
  initialTheme?: EditorTheme;
}) => {
  const [colors, setColorsState] = useState<ThemeColors>(initialTheme?.colors || DEFAULT_COLORS);
  const [typography, setTypographyState] = useState<ThemeTypography>(initialTheme?.typography || DEFAULT_TYPOGRAPHY);

  // Initialize theme from localStorage on client-side mount
  useEffect(() => {
    if (initialTheme) return;
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("editor_global_theme");
      if (storedTheme) {
        try {
          const parsed = JSON.parse(storedTheme);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (parsed.colors) setColorsState({ ...DEFAULT_COLORS, ...parsed.colors });
          if (parsed.typography) setTypographyState({ ...DEFAULT_TYPOGRAPHY, ...parsed.typography });
        } catch (e) {
          console.error("Error loading theme from localStorage:", e);
        }
      }
    }
  }, [initialTheme]);

  // Sync back to localStorage when state changes
  useEffect(() => {
    if (initialTheme) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("editor_global_theme", JSON.stringify({ colors, typography }));
    }
  }, [colors, typography, initialTheme]);

  // Inject Google Fonts stylesheet dynamically based on current typography selection
  useEffect(() => {
    const fontsToLoad = Array.from(new Set([typography.headingFont, typography.bodyFont]));
    const fontFamiliesParam = fontsToLoad
      .map(font => `family=${font.replace(/\s+/g, "+")}:wght@300;400;500;600;700;800;900`)
      .join("&");
    
    const fontHref = `https://fonts.googleapis.com/css2?${fontFamiliesParam}&display=swap`;

    let linkTag = document.getElementById("editor-google-fonts") as HTMLLinkElement | null;
    if (!linkTag) {
      linkTag = document.createElement("link");
      linkTag.id = "editor-google-fonts";
      linkTag.rel = "stylesheet";
      document.head.appendChild(linkTag);
    }
    linkTag.href = fontHref;
  }, [typography.headingFont, typography.bodyFont]);

  const setColors = (newColors: Partial<ThemeColors>) => {
    setColorsState((prev) => ({ ...prev, ...newColors }));
  };

  const setTypography = (newTypography: Partial<ThemeTypography>) => {
    setTypographyState((prev) => ({ ...prev, ...newTypography }));
  };

  return (
    <ThemeContext.Provider value={{ theme: { colors, typography }, setColors, setTypography }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useEditorTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useEditorTheme must be used within an EditorThemeProvider");
  }
  return context;
};
