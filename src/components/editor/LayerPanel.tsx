"use client";

import React, { useState } from "react";
import { useEditor } from "@craftjs/core";
import { useMultiSelect } from "./components/MultiSelectContext";
import { 
  ChevronDown, 
  ChevronRight, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Sparkles,
  Eye, 
  EyeOff,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Move
} from "lucide-react";

interface LayerNodeProps {
  id: string;
  depth: number;
}

const LayerNode = ({ id, depth }: LayerNodeProps) => {
  const { node, actions } = useEditor((state) => ({
    node: state.nodes[id],
  }));

  const { selectedIds, toggleId } = useMultiSelect();
  const [collapsed, setCollapsed] = useState(false);

  if (!node) return null;

  const isSelected = selectedIds.has(id);
  const isContainer = node.data.name === "Container" || node.data.name === "Contenedor" || id === "ROOT";
  const hasChildren = node.data.nodes && node.data.nodes.length > 0;

  // Icon selector based on component name or craft displayName
  const getIcon = () => {
    const name = node.data.name;
    switch (name) {
      case "Container":
      case "Contenedor":
        return <Layout className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
      case "Texto":
      case "TextNode":
        return <Type className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
      case "Imagen":
      case "ImageNode":
        return <ImageIcon className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
      case "Video":
      case "VideoNode":
        return <VideoIcon className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
      case "Animación":
      case "AnimationNode":
        return <Sparkles className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
      default:
        return <Layout className="h-3.5 w-3.5 text-[#8E8D9B] group-hover:text-[#ED6C31] shrink-0" />;
    }
  };

  const displayName = id === "ROOT" ? "Página Principal" : node.data.displayName || node.data.name;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleId(id, e.shiftKey);
  };

  const handleToggleHidden = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle hidden status in Craft.js props
    const isCurrentlyHidden = node.data.props.hidden || false;
    actions.setProp(id, (props: { hidden?: boolean }) => {
      props.hidden = !isCurrentlyHidden;
    });
  };

  const handleZIndexChange = (e: React.MouseEvent, offset: number) => {
    e.stopPropagation();
    const currentZIndex = node.data.props.zIndex ?? 1;
    actions.setProp(id, (props: { zIndex?: number }) => {
      props.zIndex = Math.max(0, currentZIndex + offset);
    });
  };

  const isHidden = node.data.props.hidden || false;
  const isFree = node.data.props.positionMode === "free";
  const zIndexVal = node.data.props.zIndex ?? 1;

  return (
    <div className="flex flex-col select-none">
      <div 
        onClick={handleClick}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-colors text-xs font-medium ${
          isSelected 
            ? "bg-[#273E92]/20 text-[#ED6C31] border border-[#273E92]/30" 
            : "hover:bg-white/5 text-[#8E8D9B] hover:text-white"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isContainer ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
              className="p-0.5 hover:bg-[#2A2640] rounded-sm text-slate-400 shrink-0 cursor-pointer"
            >
              {hasChildren ? (
                collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <div className="w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 shrink-0" />
          )}

          {getIcon()}
          
          <span className={`truncate ${isHidden ? "opacity-50 line-through text-slate-500" : ""}`}>
            {displayName}
          </span>

          {isFree && (
            <span className="flex items-center gap-0.5 px-1 py-0.2 bg-[#273E92]/20 text-white text-[8px] font-mono font-bold rounded-xs shrink-0 select-none" title={`Posición Libre - Capa Z-Index: ${zIndexVal}`}>
              <Move className="h-2 w-2 text-[#ED6C31]" />
              Z:{zIndexVal}
            </span>
          )}
        </div>

        {id !== "ROOT" && (
          <div className="flex items-center gap-0.5">
            {/* Quick layer ordering controls for free-positioned elements */}
            {isFree && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 mr-1.5 transition-all">
                <button
                  onClick={(e) => handleZIndexChange(e, -1)}
                  className="p-0.5 hover:bg-[#2A2640] rounded-sm text-slate-400 hover:text-white cursor-pointer"
                  title="Enviar atrás (Capa -1)"
                >
                  <ChevronDownIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => handleZIndexChange(e, 1)}
                  className="p-0.5 hover:bg-[#2A2640] rounded-sm text-slate-400 hover:text-white cursor-pointer"
                  title="Traer adelante (Capa +1)"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            )}

            <button
              onClick={handleToggleHidden}
              className={`opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#2A2640] rounded-sm text-slate-400 hover:text-white transition-all cursor-pointer`}
              title={isHidden ? "Mostrar elemento" : "Ocultar elemento"}
            >
              {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>

      {isContainer && hasChildren && !collapsed && (
        <div className="flex flex-col">
          {node.data.nodes.map((childId) => (
            <LayerNode key={childId} id={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayerPanel = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1C1835]">
      <div className="p-4 border-b border-[#2A2640]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8D9B]">
          Árbol de Capas
        </h3>
        <p className="text-[10px] text-muted mt-0.5">
          Estructura de elementos colocados en tu portafolio. Shift + click para selección múltiple.
        </p>
      </div>

      <div className="flex-grow overflow-y-auto p-4 bg-[#1C1835]">
        <LayerNode id="ROOT" depth={0} />
      </div>
    </div>
  );
};