/**
 * DroppedContainer — dnd-kit migration.
 * Remove DFF DnD hooks; uses useDroppable + SortableContext para campos.
 * Mantm resize (useResizeDrag) e position/reorder (useUnifiedGripDrag).
 */

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  GripVertical,
  BoxSelect,
  GripHorizontal,
  Trash2,
  EyeOff,
  SquareStack,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { getItemType } from "../constants";
import { useBuilder } from "../BuilderContext";
import { useResizeDrag } from "./useResizeDrag";
import {
  useUnifiedGripDrag,
  type CustomReorderStrategy,
} from "./useUnifiedGripDrag";
import { GridOverlay } from "./GridOverlay";
import { DroppedField } from "./DroppedField";
import { DroppedFieldArray } from "./DroppedFieldArray";
import { cn } from "../utils/cn";

export const DroppedContainer = ({
  id,
  container: _parentContainer,
}: {
  id: string;
  container: string;
}) => {
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `zone-${id}` });

  const {
    selectedId,
    setSelected,
    getConfig,
    updateConfig,
    removeItem,
    moveItem,
    moveItemNoSnapshot,
    setPositionDrag,
    positionDrag,
    reorderDrag,
    setReorderDrag,
    pushSnapshot,
    containers,
  } = useBuilder();

  const config = getConfig(id);
  const children = containers[id]?.children ?? [];
  const fieldIds = children.filter((c) => getItemType(c) === "field");
  const isSelected = selectedId === id;
  const tamanho = config.tamanho || 12;
  const isPositionDragging = positionDrag?.itemId === id;
  const isReorderDragging = reorderDrag?.draggingId === id;
  const isDraggingChildField =
    positionDrag && children.includes(positionDrag.itemId);
  const hasSelectedChild =
    selectedId &&
    children.includes(selectedId) &&
    getItemType(selectedId) === "field";

  const [isHovered, setIsHovered] = useState(false);

  // Cores inline — container: azul quando não selecionado, laranja quando selecionado
  const P = "var(--t-primary, hsl(var(--primary)))";
  const borderColor = isSelected
    ? P
    : isHovered
      ? "rgba(59,130,246,0.55)"
      : "rgba(59,130,246,0.3)";
  const headerBg = isSelected
    ? `color-mix(in srgb, ${P} 15%, transparent)`
    : isHovered
      ? "rgba(59,130,246,0.12)"
      : "rgba(59,130,246,0.07)";
  const headerBorder = isSelected
    ? `color-mix(in srgb, ${P} 30%, transparent)`
    : isHovered
      ? "rgba(59,130,246,0.28)"
      : "rgba(59,130,246,0.18)";
  const boxShadow = isSelected
    ? `0 0 0 3px color-mix(in srgb, ${P} 20%, transparent)`
    : isHovered
      ? "0 0 0 2px rgba(59,130,246,0.25)"
      : undefined;

  // Resize hook
  const { resizeRef, resizing, resizePreview, handleResizeStart } =
    useResizeDrag({
      id,
      currentTamanho: tamanho,
      inicioColuna: config.inicioColuna,
      onResize: (newTamanho) => updateConfig(id, { tamanho: newTamanho }),
      pushSnapshot,
    });

  // Unified grip: horizontal → position drag, vertical → custom reorder among siblings
  const reorderStrategy = useMemo<CustomReorderStrategy>(
    () => ({
      kind: "custom",
      moveItemNoSnapshot,
      pushSnapshot,
      setReorderDrag,
      dataAttribute: "data-container-id",
    }),
    [moveItemNoSnapshot, pushSnapshot, setReorderDrag],
  );

  const { handleGripMouseDown } = useUnifiedGripDrag({
    id,
    elementRef: resizeRef,
    tamanho,
    inicioColuna: config.inicioColuna || 1,
    onPositionApply: (newInicio) =>
      updateConfig(id, { inicioColuna: newInicio }),
    setPositionDrag,
    setSelected,
    reorderStrategy,
  });

  return (
    <>
      <div
        ref={(node) => {
          (resizeRef as React.MutableRefObject<HTMLDivElement | null>).current =
            node;
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(id);
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative rounded-lg border overflow-hidden transition-all",
          resizing && "ring-2 ring-blue-400/50",
          isPositionDragging && "opacity-0 pointer-events-none",
          isReorderDragging && "opacity-50",
        )}
        data-container-id={id}
        style={{
          gridColumn: config.inicioColuna
            ? `${config.inicioColuna} / span ${tamanho}`
            : `span ${tamanho}`,
          minWidth: "80px",
          borderColor,
          boxShadow,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-1.5 border-b px-2 py-1.5 transition-colors"
          style={{
            backgroundColor: headerBg,
            borderColor: headerBorder,
          }}
        >
          {/* Unified grip: drag horizontally → reposition, vertically → reorder */}
          <div
            data-grip
            onMouseDown={handleGripMouseDown}
            className="cursor-grab shrink-0 p-1 -ml-1 rounded hover:bg-primary/20 transition-colors"
          >
            <GripVertical className="h-3.5 w-3.5 text-blue-500" />
          </div>
          {/* Manual reorder buttons */}
          <div className="flex flex-col -my-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveItem(id, "up");
              }}
              className="p-0 hover:bg-primary/10 rounded transition-colors"
              title="Mover para cima"
            >
              <ChevronUp className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveItem(id, "down");
              }}
              className="p-0 hover:bg-primary/10 rounded transition-colors"
              title="Mover para baixo"
            >
              <ChevronDown className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </button>
          </div>
          <BoxSelect className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span
            className={cn(
              "text-xs font-semibold truncate flex-1",
              config.showLabel === false
                ? "text-blue-500/50 italic"
                : "text-blue-700 dark:text-blue-300",
            )}
          >
            {config.label}
          </span>
          {config.showAsCard && (
            <SquareStack className="h-3 w-3 text-blue-400 shrink-0" />
          )}
          {config.showLabel === false && (
            <EyeOff className="h-3 w-3 text-muted-foreground/50 shrink-0" />
          )}
          <span className="text-[10px] text-muted-foreground shrink-0 bg-blue-500/10 px-1.5 rounded">
            {resizePreview ?? tamanho}/12
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeItem(id);
            }}
            className="transition-opacity shrink-0 p-0.5 rounded hover:bg-destructive/10"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </button>
        </div>

        {/* ID */}
        <div className="px-2 -mt-0.5 mb-0.5">
          <span className="text-[8px] text-muted-foreground/30 font-mono">
            {id}
          </span>
        </div>

        {/* Fields zone — sortable + droppable */}
        <div
          ref={setDropRef}
          className={cn(
            "relative p-2 min-h-[40px] gap-1.5 transition-all duration-150",
            isOver
              ? "bg-primary/15 ring-2 ring-inset ring-primary/50"
              : (isDraggingChildField || hasSelectedChild) && "bg-muted/30",
          )}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gridAutoRows: "min-content",
          }}
        >
          {/* Grid overlay for field position drag or field selection */}
          <GridOverlay
            showGuides={!!isDraggingChildField || !!hasSelectedChild}
            positionDrag={isDraggingChildField ? positionDrag : null}
          />

          {children.length === 0 && (
            <p
              className="text-[10px] text-muted-foreground/60 text-center py-2 italic"
              style={{ gridColumn: "span 12" }}
            >
              Arraste campos aqui
            </p>
          )}
          <SortableContext items={fieldIds} strategy={rectSortingStrategy}>
            {children
              .filter((c) => getItemType(c) === "field")
              .map((childId) => {
                const childConfig = getConfig(childId);
                if (childConfig.fieldType === "field_array") {
                  return (
                    <DroppedFieldArray
                      key={childId}
                      id={childId}
                      container={id}
                    />
                  );
                }
                return (
                  <DroppedField key={childId} id={childId} container={id} />
                );
              })}
          </SortableContext>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={handleResizeStart}
          className="cursor-col-resize absolute right-0 top-0 bottom-0 w-2 hover:bg-blue-500/20 transition-colors flex items-center justify-center"
        >
          <GripHorizontal className="h-3 w-3 text-blue-500/40 rotate-90" />
        </div>
      </div>
      {/* Drag cursor tip — segue o mouse quando container está sendo reposicionado */}
      {isPositionDragging &&
        positionDrag &&
        createPortal(
          <div
            style={{
              position: "fixed",
              left: positionDrag.cursorX + 14,
              top: positionDrag.cursorY - 18,
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="flex items-center gap-1 bg-foreground text-background text-[10px] font-mono px-2 py-0.5 rounded shadow-xl border border-border/20"
          >
            <BoxSelect className="h-2.5 w-2.5" />
            col {positionDrag.ghostStart}–
            {positionDrag.ghostStart + positionDrag.ghostSpan - 1}
          </div>,
          document.body,
        )}{" "}
    </>
  );
};
