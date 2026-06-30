"use client";

import React, { useState } from "react";
import { useEditor, Element } from "@craftjs/core";
import { Container } from "./nodes/Container";
import { TextNode } from "./nodes/TextNode";
import { ImageNode } from "./nodes/ImageNode";
import { VideoNode } from "./nodes/VideoNode";
import { AnimationNode } from "./nodes/AnimationNode";
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Layers, 
  Video as VideoIcon, 
  Sparkles
} from "lucide-react";
import { LayerPanel } from "./LayerPanel";
import { MediaSidebar } from "./MediaSidebar";

export const Toolbox = () => {
  const { connectors: { create } } = useEditor();
  const [activeTab, setActiveTab] = useState<"tools" | "layers" | "media">("tools");

  // Helper to render label & icon for active view
  const getActiveTabDetails = () => {
    switch (activeTab) {
      case "layers":
        return { name: "Capas", icon: Layers };
      case "media":
        return { name: "Archivos", icon: ImageIcon };
      case "tools":
      default:
        return { name: "Herramientas", icon: Layout };
    }
  };

  const ActiveDetails = getActiveTabDetails();

  return (
    <div className="flex h-full select-none transition-colors duration-200 shrink-0">
      {/* Outer Sidebar (Thin) */}
      <div className="w-14 border-r border-[#2A2640] bg-[#1C1835] flex flex-col items-center py-4 gap-4">
        {[
          { id: "tools", icon: Layout, label: "Herramientas" },
          { id: "layers", icon: Layers, label: "Capas" },
          { id: "media", icon: ImageIcon, label: "Archivos" }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "tools" | "layers" | "media")}
              className={`p-3 rounded-xl transition-all cursor-pointer relative group ${
                isActive 
                  ? "bg-[#273E92] text-white shadow-md" 
                  : "text-[#8E8D9B] hover:text-white hover:bg-[#141127]"
              }`}
              title={tab.label}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>

      {/* Inner Sidebar (Wide) */}
      <div className="w-52 border-r border-[#2A2640] bg-[#141127] flex flex-col h-full">
        {/* Tab Content Header */}
        <div className="px-5 py-4 border-b border-[#2A2640] shrink-0">
          <span className="text-[10px] font-medium tracking-wider text-[#FFB598]">
            {ActiveDetails.name}
          </span>
        </div>

        {/* Tab Content Body */}
        <div className="flex-grow flex flex-col min-h-0 overflow-y-auto">
          {activeTab === "tools" ? (
            <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto bg-[#141127]">
              {/* Container Element */}
              <div 
                ref={(ref) => {
                  if (ref) create(ref, <Element is={Container} padding={20} canvas />);
                }}
                className="flex flex-col items-center justify-center gap-3 p-3 aspect-square bg-[#1C1835] hover:bg-[#FFB598] border border-[#2A2640] hover:border-[#FFB598] rounded-xl cursor-grab transition-all group"
              >
                <Layout className="h-6 w-6 text-[#FFB598] group-hover:text-[#141127] transition-colors" />
                <span className="text-[10px] font-medium text-[#FFB598] group-hover:text-[#141127] transition-colors text-center">
                  Contenedor
                </span>
              </div>

              {/* Text Element */}
              <div 
                ref={(ref) => {
                  if (ref) create(ref, <TextNode text="Haz doble click para editar" />);
                }}
                className="flex flex-col items-center justify-center gap-3 p-3 aspect-square bg-[#1C1835] hover:bg-[#FFB598] border border-[#2A2640] hover:border-[#FFB598] rounded-xl cursor-grab transition-all group"
              >
                <Type className="h-6 w-6 text-[#FFB598] group-hover:text-[#141127] transition-colors" />
                <span className="text-[10px] font-medium text-[#FFB598] group-hover:text-[#141127] transition-colors text-center">
                  Texto
                </span>
              </div>

              {/* Image Element */}
              <div 
                ref={(ref) => {
                  if (ref) create(ref, <ImageNode />);
                }}
                className="flex flex-col items-center justify-center gap-3 p-3 aspect-square bg-[#1C1835] hover:bg-[#FFB598] border border-[#2A2640] hover:border-[#FFB598] rounded-xl cursor-grab transition-all group"
              >
                <ImageIcon className="h-6 w-6 text-[#FFB598] group-hover:text-[#141127] transition-colors" />
                <span className="text-[10px] font-medium text-[#FFB598] group-hover:text-[#141127] transition-colors text-center">
                  Imagen
                </span>
              </div>

              {/* Video Element */}
              <div 
                ref={(ref) => {
                  if (ref) create(ref, <VideoNode />);
                }}
                className="flex flex-col items-center justify-center gap-3 p-3 aspect-square bg-[#1C1835] hover:bg-[#FFB598] border border-[#2A2640] hover:border-[#FFB598] rounded-xl cursor-grab transition-all group"
              >
                <VideoIcon className="h-6 w-6 text-[#FFB598] group-hover:text-[#141127] transition-colors" />
                <span className="text-[10px] font-medium text-[#FFB598] group-hover:text-[#141127] transition-colors text-center">
                  Video
                </span>
              </div>

              {/* Animation Element */}
              <div 
                ref={(ref) => {
                  if (ref) create(ref, <AnimationNode />);
                }}
                className="flex flex-col items-center justify-center gap-3 p-3 aspect-square bg-[#1C1835] hover:bg-[#FFB598] border border-[#2A2640] hover:border-[#FFB598] rounded-xl cursor-grab transition-all group"
              >
                <Sparkles className="h-6 w-6 text-[#FFB598] group-hover:text-[#141127] transition-colors" />
                <span className="text-[10px] font-medium text-[#FFB598] group-hover:text-[#141127] transition-colors text-center">
                  Animación
                </span>
              </div>
            </div>
          ) : activeTab === "layers" ? (
            <div className="flex-grow bg-[#1C1835] overflow-y-auto">
              <LayerPanel />
            </div>
          ) : (
            <div className="flex-grow bg-[#1C1835] overflow-y-auto">
              <MediaSidebar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
