"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useEditor } from "@craftjs/core";

interface MultiSelectContextType {
  selectedIds: Set<string>;
  toggleId: (id: string, shiftKey: boolean) => void;
  selectIds: (ids: string[]) => void;
  clearSelection: () => void;
  isMultiSelect: boolean;
}

const MultiSelectContext = createContext<MultiSelectContextType | undefined>(undefined);

export const MultiSelectProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { actions } = useEditor();
  const isShiftClickingRef = useRef(false);

  // Sync state when Craft.js deselection happens or selected elements change
  const currentCraftSelection = useEditor((state) => state.events.selected);

  useEffect(() => {
    if (isShiftClickingRef.current) {
      return;
    }
    const selectionArray = Array.from(currentCraftSelection || []);
    // If Craft.js selection becomes empty, clear multi-select
    if (selectionArray.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIds((prev) => (prev.size === 0 ? prev : new Set()));
    } else if (selectionArray.length === 1) {
      // If single node is selected via canvas click, make sure it's the only one in multi-select
      const onlyId = selectionArray[0];
      setSelectedIds((prev) => {
        if (prev.size > 1 && prev.has(onlyId)) {
          return prev;
        }
        if (prev.size !== 1 || !prev.has(onlyId)) {
          return new Set([onlyId]);
        }
        return prev;
      });
    }
  }, [currentCraftSelection]);

  const toggleId = (id: string, shiftKey: boolean) => {
    if (id === "ROOT") return;

    if (shiftKey) {
      const next = new Set(selectedIds);
      if (next.has(id)) {
        next.delete(id);
        setSelectedIds(next);
        isShiftClickingRef.current = true;
        if (next.size > 0) {
          const arr = Array.from(next);
          actions.selectNode(arr[arr.length - 1]);
        } else {
          actions.selectNode(undefined as unknown as string);
        }
      } else {
        next.add(id);
        setSelectedIds(next);
        isShiftClickingRef.current = true;
        actions.selectNode(id);
      }
      setTimeout(() => {
        isShiftClickingRef.current = false;
      }, 50);
    } else {
      const next = new Set([id]);
      setSelectedIds(next);
      actions.selectNode(id);
    }
  };

  const selectIds = (ids: string[]) => {
    const validIds = ids.filter((id) => id !== "ROOT");
    setSelectedIds(new Set(validIds));
    if (validIds.length > 0) {
      actions.selectNode(validIds[validIds.length - 1]);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    actions.selectNode(undefined as unknown as string);
  };

  const isMultiSelect = selectedIds.size > 1;

  return (
    <MultiSelectContext.Provider
      value={{
        selectedIds,
        toggleId,
        selectIds,
        clearSelection,
        isMultiSelect,
      }}
    >
      {children}
    </MultiSelectContext.Provider>
  );
};

export const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error("useMultiSelect must be used within a MultiSelectProvider");
  }
  return context;
};
