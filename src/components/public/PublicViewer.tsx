"use client";

import React from "react";
import { Editor, Frame } from "@craftjs/core";
import { Container } from "../editor/nodes/Container";
import { TextNode } from "../editor/nodes/TextNode";
import { ImageNode } from "../editor/nodes/ImageNode";
import { VideoNode } from "../editor/nodes/VideoNode";
import { AnimationNode } from "../editor/nodes/AnimationNode";
import { EditorThemeProvider } from "../editor/ThemeContext";
import { MultiSelectProvider } from "../editor/components/MultiSelectContext";
import { CanvasTransformProvider } from "../editor/components/CanvasTransformContext";
import { ResizeProvider } from "../editor/components/ResizeContext";

interface PublicViewerProps {
  content: string; // Serialized Craft.js JSON string
  settings?: Record<string, unknown>; // Optional theme/settings
}

export const PublicViewer = ({ content, settings }: PublicViewerProps) => {
  // Extract custom theme if stored in settings
  const initialTheme = settings?.theme || undefined;

  return (
    <EditorThemeProvider initialTheme={initialTheme}>
      <Editor 
        resolver={{ Container, TextNode, ImageNode, VideoNode, AnimationNode }} 
        enabled={false} // READ-ONLY mode
      >
        <MultiSelectProvider>
          {/* Public rendering: isPreviewMode=true, default viewportWidth="desktop" */}
          <CanvasTransformProvider isPreviewMode={true} viewportWidth="desktop">
            <ResizeProvider>
              {/* Reset zoom/pan visual boundaries and apply background colors */}
              <main className="min-h-screen w-full bg-background text-foreground transition-colors duration-200">
                <Frame data={content} />
              </main>
            </ResizeProvider>
          </CanvasTransformProvider>
        </MultiSelectProvider>
      </Editor>
    </EditorThemeProvider>
  );
};
