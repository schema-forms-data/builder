/**
 * DroppedFieldArray — Canvas representation of a FIELD_ARRAY field.
 *
 * Behaves simultaneously as:
 * - A sortable item (via useSortable) — can be reordered among siblings in the parent container
 * - A droppable zone (via useDroppable) — accepts sub-field drops via `zone-${id}`
 *
 * Sub-fields are dragged from the Palette into this zone, just like regular fields
 * into a container.  Each sub-field is rendered as a DroppedField chip.
 */

import {
  List,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { getItemType } from "../constants";
import { useBuilder } from "../BuilderContext";
import { DroppedField } from "./DroppedField";
import { cn } from "../utils/cn";

export const DroppedFieldArray = ({
  id,
  container,
}: {
  id: string;
  container: string;
}) => {
  // ── Sortable: lets this item be reordered inside its parent container ────────
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

  // ── Droppable: inner zone that accepts sub-field drops ───────────────────────
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `zone-${id}`,
  });

  const {
    selectedId,
    setSelected,
    getConfig,
    removeItem,
    moveItem,
    containers,
  } = useBuilder();

  const config = getConfig(id);
  const children = containers[id]?.children ?? [];
  const fieldIds = children.filter((c) => getItemType(c) === "field");
  const isSelected = selectedId === id;
  const tamanho = config.tamanho || 12;

  return (
    <div
      ref={setSortableRef}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
      className={cn(
        "group/fa relative rounded-lg border overflow-hidden transition-all",
        isSortableDragging && "opacity-0 pointer-events-none",
        isSelected
          ? "border-amber-500 ring-2 ring-amber-500/20 shadow-lg"
          : "border-amber-500/30 hover:border-amber-500/55",
      )}
      style={{
        gridColumn: config.inicioColuna
          ? `${config.inicioColuna} / span ${tamanho}`
          : `span ${tamanho}`,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-1.5 border-b px-2 py-1.5 transition-colors",
          isSelected
            ? "bg-amber-500/15 border-amber-500/30"
            : "bg-amber-500/10 border-amber-500/20",
        )}
      >
        {/* Sortable grip */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab shrink-0 p-1 -ml-1 rounded hover:bg-amber-500/20 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-amber-500" />
        </div>

        {/* Move up/down */}
        <div className="flex flex-col -my-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItem(id, "up");
            }}
            className="p-0 hover:bg-amber-500/10 rounded transition-colors"
            title="Mover para cima"
          >
            <ChevronUp className="h-3 w-3 text-muted-foreground hover:text-amber-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              moveItem(id, "down");
            }}
            className="p-0 hover:bg-amber-500/10 rounded transition-colors"
            title="Mover para baixo"
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground hover:text-amber-500" />
          </button>
        </div>

        <List className="h-3.5 w-3.5 text-amber-500 shrink-0" />

        <span className="text-xs font-semibold truncate flex-1 text-amber-700 dark:text-amber-300">
          {config.label}
        </span>

        <span className="text-[10px] text-muted-foreground shrink-0 bg-amber-500/10 px-1.5 rounded">
          {config.itemLabel || "Item"} · {fieldIds.length} campo
          {fieldIds.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeItem(id);
          }}
          className="opacity-0 group-hover/fa:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-destructive/10"
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

      {/* ── Sub-fields droppable zone ──────────────────────────────────────── */}
      <div
        ref={setDropRef}
        className={cn(
          "relative p-2 min-h-[40px] gap-1.5 transition-all duration-150",
          isOver ? "bg-amber-500/10 ring-2 ring-inset ring-amber-500/40" : "",
        )}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "min-content",
        }}
      >
        {fieldIds.length === 0 && (
          <p
            className="text-[10px] text-muted-foreground/60 text-center py-2 italic"
            style={{ gridColumn: "span 12" }}
          >
            Arraste campos aqui
          </p>
        )}

        <SortableContext items={fieldIds} strategy={rectSortingStrategy}>
          {fieldIds.map((childId) => (
            <DroppedField key={childId} id={childId} container={id} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
