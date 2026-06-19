/**
 * DroppedField — dnd-kit migration.
 * useSortable para reordenar e mover entre containers via grip.
 * Mantm useResizeDrag para o handle de redimensionamento (borda direita).
 */

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  Zap,
  GripHorizontal,
  Type,
  ArrowLeftRight,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getFieldMetaById } from "../constants";
import { useBuilder } from "../BuilderContext";
import { useResizeDrag } from "./useResizeDrag";
import { usePositionDrag } from "./usePositionDrag";
import { cn } from "../utils/cn";

export const DroppedField = ({
  id,
  container,
}: {
  id: string;
  container: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id,
    data: { isCanvasItem: true, type: "field", id, fromContainer: container },
  });

  const {
    selectedId,
    setSelected,
    getConfig,
    updateConfig,
    removeItem,
    setPositionDrag,
    positionDrag,
    pushSnapshot,
  } = useBuilder();
  const config = getConfig(id);
  const meta = getFieldMetaById(id);
  const Icon = meta?.icon || Type;
  const isSelected = selectedId === id;
  const tamanho = config.tamanho || 6;
  const isPositionDragging = positionDrag?.itemId === id;

  const [isHovered, setIsHovered] = useState(false);

  // Cores inline — 3 estados: normal (opaco), hover (vivo), selecionado (full)
  const P = "var(--t-primary, hsl(var(--primary)))";
  const borderColor = isSelected
    ? P
    : isHovered
      ? `color-mix(in srgb, ${P} 60%, transparent)`
      : `color-mix(in srgb, ${P} 25%, transparent)`;
  const boxShadow = isSelected
    ? `0 0 0 2px color-mix(in srgb, ${P} 30%, transparent)`
    : undefined;

  // Resize hook (right-edge handle)
  const { resizeRef, resizing, resizePreview, handleResizeStart } =
    useResizeDrag({
      id,
      currentTamanho: tamanho,
      inicioColuna: config.inicioColuna,
      onResize: (newTamanho) => updateConfig(id, { tamanho: newTamanho }),
      pushSnapshot,
    });

  // Position drag hook (horizontal handle — changes inicioColuna)
  const { handlePositionMouseDown } = usePositionDrag({
    id,
    elementRef: resizeRef,
    onPositionApply: (newInicio) =>
      updateConfig(id, { inicioColuna: newInicio }),
    setPositionDrag,
    setSelected,
    pushSnapshot,
  });

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        (resizeRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
      data-field-id={id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex items-center gap-2 rounded border bg-card/80 backdrop-blur-sm px-2.5 pt-1.5 pb-3.5 cursor-pointer transition-all text-xs",
        resizing && "ring-2 ring-blue-400/50",
        isPositionDragging && "opacity-0 pointer-events-none",
      )}
      style={{
        gridColumn: config.inicioColuna
          ? `${config.inicioColuna} / span ${tamanho}`
          : `span ${tamanho}`,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0 : 1,
        borderColor,
        boxShadow,
      }}
    >
      {/* Position drag handle — horizontal drag changes inicioColuna */}
      <div
        onMouseDown={handlePositionMouseDown}
        onClick={(e) => e.stopPropagation()}
        className="cursor-ew-resize shrink-0 p-0.5 rounded hover:bg-primary/20 transition-colors"
        title="Arrastar para mudar coluna"
      >
        <ArrowLeftRight className="h-3 w-3 text-primary/60" />
      </div>

      {/* Grip: dnd-kit sortable (reorder + cross-container move) */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3 text-primary" />
      </div>

      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="font-medium truncate flex-1">{config.label}</span>
      {config.condition && <Zap className="h-3 w-3 text-amber-500 shrink-0" />}
      {config.required && <span className="text-destructive font-bold">*</span>}
      <span className="text-[9px] text-muted-foreground shrink-0">
        {resizePreview ?? tamanho}/12
      </span>

      {/* Delete */}
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

      {/* ID label */}
      <div className="absolute left-2 -bottom-0.5 font-mono truncate max-w-[90%] pointer-events-none text-[8px] text-muted-foreground/30">
        {id}
      </div>

      {/* Resize handle (right edge) */}
      <div
        data-resize
        onMouseDown={handleResizeStart}
        className="cursor-col-resize absolute right-0 top-0 bottom-0 w-2 hover:bg-primary/20 transition-colors flex items-center justify-center"
      >
        <GripHorizontal className="h-3 w-3 text-primary/40 rotate-90" />
      </div>
    </div>
  );
};
