"use client";

import React from "react";
import { useNode, useEditor } from "@craftjs/core";
import { Resizable } from "re-resizable";
import { useResize } from "./ResizeContext";
import { useMultiSelect } from "./MultiSelectContext";
import { useCanvasTransform } from "./CanvasTransformContext";

interface ResizableWrapperProps {
  width: string;
  height: string;
  lockAspectRatio?: boolean;
  children: React.ReactNode;
}

// Prevent HTML5 Drag from triggering when interacting with resize handles
const cancelDrag = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

// Figma/Webflow-style custom resize handles (no propagation blockers inside here, re-resizable needs these events!)
const LeftHandle = () => (
  <div 
    draggable
    onDragStart={cancelDrag}
    className="absolute left-0 top-0 bottom-0 w-1.5 hover:bg-brand cursor-col-resize flex items-center justify-center transition-colors z-20"
  >
    <div className="h-4 w-1 bg-white border border-brand rounded-sm shadow-xs" />
  </div>
);

const RightHandle = () => (
  <div 
    draggable
    onDragStart={cancelDrag}
    className="absolute right-0 top-0 bottom-0 w-1.5 hover:bg-brand cursor-col-resize flex items-center justify-center transition-colors z-20"
  >
    <div className="h-4 w-1 bg-white border border-brand rounded-sm shadow-xs" />
  </div>
);

const TopHandle = () => (
  <div 
    draggable
    onDragStart={cancelDrag}
    className="absolute top-0 left-0 right-0 h-1.5 hover:bg-brand cursor-row-resize flex items-center justify-center transition-colors z-20"
  >
    <div className="w-4 h-1 bg-white border border-brand rounded-sm shadow-xs" />
  </div>
);

const BottomHandle = () => (
  <div 
    draggable
    onDragStart={cancelDrag}
    className="absolute bottom-0 left-0 right-0 h-1.5 hover:bg-brand cursor-row-resize flex items-center justify-center transition-colors z-20"
  >
    <div className="w-4 h-1 bg-white border border-brand rounded-sm shadow-xs" />
  </div>
);

const BottomRightHandle = () => (
  <div 
    draggable
    onDragStart={cancelDrag}
    className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-white border-2 border-brand rounded-sm cursor-se-resize translate-x-1 translate-y-1 z-30 shadow-sm" 
  />
);

export const ResizableWrapper = ({
  width,
  height,
  lockAspectRatio = false,
  children
}: ResizableWrapperProps) => {
  const { setIsResizing } = useResize();
  const { selectedIds, toggleId } = useMultiSelect();
  const { viewportWidth, isPreviewMode } = useCanvasTransform();

  const { 
    id, 
    connectors: { connect, drag }, 
    canvasNodes, 
    actions: { setProp }, 
    selected, 
    hovered,
    positionMode,
    x,
    y,
    zIndex,
    hideOn
  } = useNode((node) => ({
    canvasNodes: node.data.nodes,
    selected: node.events.selected,
    hovered: node.events.hovered,
    positionMode: node.data.props.positionMode || "flow",
    x: node.data.props.x ?? 0,
    y: node.data.props.y ?? 0,
    zIndex: node.data.props.zIndex ?? 1,
    hideOn: node.data.props.hideOn || [],
  }));

  const { actions: editorActions, query } = useEditor();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  
  // Stash references in a mutable ref object to avoid rebuilding event listeners on every render
  const trackingRef = React.useRef({
    id,
    x,
    y,
    zIndex,
    selected,
    isPreviewMode,
    setProp,
    editorActions,
    toggleId
  });

  React.useEffect(() => {
    trackingRef.current = {
      id,
      x,
      y,
      zIndex,
      selected,
      isPreviewMode,
      setProp,
      editorActions,
      toggleId
    };
  });

  // Native capture-phase listener on the wrapper
  React.useEffect(() => {
    if (positionMode !== "free" || isPreviewMode) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleNativePointerDown = (e: PointerEvent) => {
      const { 
        id: currentId, 
        x: currentX, 
        y: currentY, 
        selected: isSelected, 
        setProp: currentSetProp, 
        editorActions: currentEditorActions, 
        toggleId: currentToggleId 
      } = trackingRef.current;

      const target = e.target as HTMLElement;
      
      // Ignore click/drag if it landed on a resize handle inside this wrapper
      const draggableEl = target.closest("[draggable]");
      const isResizeHandle = 
        (draggableEl && wrapper.contains(draggableEl)) || 
        target.closest(".resizable-handle") ||
        (typeof target.className === "string" && (
          target.className.includes("resize") || 
          target.className.includes("handle")
        ));

      const isInteractive = target.closest("button, input, select, textarea");

      if (isResizeHandle || isInteractive) {
        return; // Bubble up normally so re-resizable handles can receive click
      }

      // Block propagation and prevent default behavior during the native capture phase
      e.stopPropagation();
      e.preventDefault();

      // Trigger node selection manually
      if (e.shiftKey) {
        currentToggleId(currentId, true);
      } else if (!isSelected) {
        currentEditorActions.selectNode(currentId);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      
      const parentElement = wrapper.parentElement;
      if (!parentElement) return;
      
      const parentRect = parentElement.getBoundingClientRect();
      const startPercentX = currentX;
      const startPercentY = currentY;
      
      const handlePointerMove = (moveEvent: PointerEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        // Convert client offset relative to parent container size into percentage
        const percentDeltaX = (deltaX / parentRect.width) * 100;
        const percentDeltaY = (deltaY / parentRect.height) * 100;
        
        const newX = Math.round(Math.max(0, Math.min(100, startPercentX + percentDeltaX)));
        const newY = Math.round(Math.max(0, Math.min(500, startPercentY + percentDeltaY)));
        
        currentSetProp((p: Record<string, unknown> & { x: number; y: number }) => {
          p.x = newX;
          p.y = newY;
        });
      };
      
      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };
      
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    };

    // Use { capture: true } to intercept prior to Craft.js bubble handlers
    wrapper.addEventListener("pointerdown", handleNativePointerDown, { capture: true });

    return () => {
      wrapper.removeEventListener("pointerdown", handleNativePointerDown, { capture: true });
    };
  }, [positionMode, isPreviewMode]);

  const isHiddenOnCurrentViewport = hideOn.includes(viewportWidth);

  // If hidden on current viewport and in preview mode, do not render at all
  if (isHiddenOnCurrentViewport && isPreviewMode) {
    return null;
  }

  // Base layout styles for the outer positioning container (only when in free mode)
  const wrapperStyles: React.CSSProperties = positionMode === "free" ? {
    position: "absolute",
    left: `${x}%`,
    top: `${y}%`,
    zIndex: zIndex,
    transform: "none",
    cursor: "move",
    opacity: isHiddenOnCurrentViewport ? 0.35 : 1,
  } : {
    opacity: isHiddenOnCurrentViewport ? 0.35 : 1,
    maxWidth: "100%",
  };

  // Styles for the resizable itself: Let size prop govern dimensions in free mode (no override)
  const resizableStyles: React.CSSProperties = positionMode === "free" ? {
    position: "relative",
  } : {
    maxWidth: "100%",
  };

  const renderResizable = () => (
    <Resizable
      ref={(ref) => {
        if (ref && ref.resizable) {
          connect(ref.resizable);
        }
      }}
      size={{ 
        width: width || (positionMode === "free" ? "150px" : "100%"), 
        height: height || (positionMode === "free" ? "150px" : "auto") 
      }}
      minWidth={40}
      minHeight={40}
      maxWidth={positionMode === "free" ? undefined : "100%"}
      onResizeStart={(e) => {
        e.stopPropagation();
        setIsResizing(true);
      }}
      onResizeStop={(e, direction, refToElement) => {
        setIsResizing(false);
        setProp((p: { width: string; height: string }) => {
          p.width = refToElement.style.width;
          p.height = refToElement.style.height;
        });

        // Downward child clamping: Check if parent shrunk below child widths (only in flow mode)
        if (positionMode !== "free" && canvasNodes && canvasNodes.length > 0 && refToElement) {
          try {
            const style = window.getComputedStyle(refToElement);
            const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
            const innerWidth = refToElement.clientWidth - paddingX;

            canvasNodes.forEach((childId) => {
              const childNode = query.node(childId).get();
              if (childNode && childNode.dom) {
                const childWidthStyle = childNode.data.props.width;
                if (childWidthStyle && childWidthStyle.endsWith("px")) {
                  const childWidthVal = parseFloat(childWidthStyle);
                  if (childWidthVal > innerWidth) {
                    editorActions.setProp(childId, (props: Record<string, unknown> & { width?: string }) => {
                      props.width = `${Math.floor(innerWidth)}px`;
                    });
                  }
                }
              }
            });
          } catch {
            // Safety fallback
          }
        }
      }}
      enable={{
        top: selected,
        right: selected,
        bottom: selected,
        left: selected,
        bottomRight: selected,
        bottomLeft: selected,
        topLeft: selected,
        topRight: selected,
      }}
      lockAspectRatio={lockAspectRatio}
      handleComponent={selected ? {
        top: <TopHandle />,
        right: <RightHandle />,
        bottom: <BottomHandle />,
        left: <LeftHandle />,
        bottomRight: <BottomRightHandle />,
        bottomLeft: <div draggable onDragStart={cancelDrag} className="absolute bottom-0 left-0 h-3.5 w-3.5 bg-white border-2 border-brand rounded-sm cursor-sw-resize -translate-x-1 translate-y-1 z-30 shadow-sm" />,
        topLeft: <div draggable onDragStart={cancelDrag} className="absolute top-0 left-0 h-3.5 w-3.5 bg-white border-2 border-brand rounded-sm cursor-nw-resize -translate-x-1 -translate-y-1 z-30 shadow-sm" />,
        topRight: <div draggable onDragStart={cancelDrag} className="absolute top-0 right-0 h-3.5 w-3.5 bg-white border-2 border-brand rounded-sm cursor-ne-resize translate-x-1 -translate-y-1 z-30 shadow-sm" />,
      } : undefined}
      className={`transition-all duration-150 relative ${
        positionMode === "free" ? "" : "max-w-full"
      } ${
        selected 
          ? "outline outline-2 outline-brand z-10" 
          : selectedIds.has(id)
            ? "outline outline-2 outline-dashed outline-brand/70 dark:outline-brand/60 z-10 bg-brand/5 dark:bg-brand/10"
            : hovered 
              ? "outline outline-1 outline-brand/40 dark:outline-brand/30 outline-dashed z-10" 
              : ""
      }`}
      style={resizableStyles}
    >
      {/* Visual coordinates and hide indicators in editing mode */}
      {selected && !isPreviewMode && isHiddenOnCurrentViewport && (
        <div className="absolute -top-5 left-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm z-30 select-none uppercase tracking-wider pointer-events-none">
          Oculto en {viewportWidth === "tablet" ? "Tablet" : "Móvil"}
        </div>
      )}
      {selected && !isPreviewMode && positionMode === "free" && (
        <div className="absolute -top-5 right-0 bg-brand text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm z-30 select-none font-mono pointer-events-none">
          X:{x}% Y:{y}% Z:{zIndex}
        </div>
      )}

      <div
        ref={(ref) => {
          if (ref) {
            // Only connect Craft's drag connector in flow mode
            if (positionMode !== "free") {
              drag(ref);
            }
          }
        }}
        onMouseDownCapture={(e) => {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
            toggleId(id, true);
          }
        }}
        onClickCapture={(e) => {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        onMouseUpCapture={(e) => {
          if (e.shiftKey) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className="w-full h-full"
      >
        {children}
      </div>
    </Resizable>
  );

  // If in free mode, wrap in a container that absorbs pointer events to bypass Craft.js reorder DnD
  if (positionMode === "free") {
    return (
      <div
        ref={wrapperRef}
        style={wrapperStyles}
        className="absolute"
      >
        {renderResizable()}
      </div>
    );
  }

  // Otherwise, render Resizable directly so it sits in the parent's flex layout normally
  return renderResizable();
};
