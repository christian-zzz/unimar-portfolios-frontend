"use client";

import React from "react";
import { useEditor } from "@craftjs/core";
import { SlidersHorizontal, Trash2 } from "lucide-react";
import { GlobalSettings } from "./GlobalSettings";
import { useMultiSelect } from "./components/MultiSelectContext";
import { BatchSettings } from "./BatchSettings";

export const SettingsPanel = () => {
  const { selectedIds, isMultiSelect, clearSelection } = useMultiSelect();
  
  const { actions, selected } = useEditor((state) => {
    const [currentNodeId] = state.events.selected;
    let selectedNode = null;

    if (currentNodeId) {
      selectedNode = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        isDeletable: currentNodeId !== "ROOT",
        props: state.nodes[currentNodeId].data.props,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
      };
    }

    return {
      selected: selectedNode,
    };
  });

  const handleDelete = () => {
    if (isMultiSelect) {
      selectedIds.forEach((id) => {
        if (id !== "ROOT") {
          actions.delete(id);
        }
      });
      clearSelection();
    } else if (selected) {
      actions.delete(selected.id);
    }
  };

  const hasDeletableSelection = isMultiSelect 
    ? Array.from(selectedIds).some((id) => id !== "ROOT")
    : selected?.isDeletable;

  return (
    <div className="w-72 border-l border-[#2A2640] bg-[#141127] flex flex-col h-full transition-colors duration-200 select-none">
      <div className="px-5 py-4 flex items-center justify-between bg-[#141127] border-b border-[#2A2640]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
          Propiedades
        </h3>
        <div className="flex items-center gap-2">
          {hasDeletableSelection && (
            <button
              onClick={handleDelete}
              className="text-red-400 hover:text-red-500 p-1 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer mr-1"
              title={isMultiSelect ? "Eliminar elementos seleccionados" : "Eliminar elemento"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <SlidersHorizontal className="h-4 w-4 text-[#ED6C31]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 bg-[#141127]">
        {isMultiSelect ? (
          <BatchSettings />
        ) : selected ? (
          <div className="space-y-4">
            <div className="pb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#FFB598]">
                Componente: {selected.name}
              </span>
            </div>

            {/* Render dynamic settings component if registered on related */}
            {selected.settings && React.createElement(selected.settings)}
          </div>
        ) : (
          <GlobalSettings />
        )}
      </div>
    </div>
  );
};