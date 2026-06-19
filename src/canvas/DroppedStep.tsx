/**
 * DroppedStep — dnd-kit migration.
 * useSortable no grip do header para reordenar steps.
 * useDroppable na zona interna para receber containers da paleta.
 */

import { useState } from "react";
import { GripVertical, Layers, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { getItemType } from "../constants";
import { useBuilder } from "../BuilderContext";
import { GridOverlay } from "./GridOverlay";
import { DroppedContainer } from "./DroppedContainer";
import { DroppedField } from "./DroppedField";
import { cn } from "../utils/cn";

export const DroppedStep = ({
  id,
  container: _parentContainer,
  index,
}: {
  id: string;
  container: string;
  index: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id, data: { isCanvasItem: true, type: "step", id } });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `zone-${id}` });

  const {
    selectedId,
    setSelected,
    getConfig,
    removeItem,
    containers,
    positionDrag,
  } = useBuilder();
  const config = getConfig(id);
  const children = containers[id]?.children ?? [];
  const isSelected = selectedId === id;
  const isDraggingChild =
    positionDrag && children.includes(positionDrag.itemId);

  const [isHovered, setIsHovered] = useState(false);

  // Cores inline — 3 estados: normal (opaco), hover (vivo), selecionado (full)
  const P = "var(--t-primary, hsl(var(--primary)))";
  const borderColor = isSelected
    ? P
    : isHovered
      ? `color-mix(in srgb, ${P} 60%, transparent)`
      : `color-mix(in srgb, ${P} 25%, transparent)`;
  const headerBg = isSelected
    ? `color-mix(in srgb, ${P} 14%, transparent)`
    : isHovered
      ? `color-mix(in srgb, ${P} 10%, transparent)`
      : `color-mix(in srgb, ${P} 6%, transparent)`;
  const headerBorder = isSelected
    ? `color-mix(in srgb, ${P} 28%, transparent)`
    : `color-mix(in srgb, ${P} 15%, transparent)`;
  const boxShadow = isSelected
    ? `0 0 0 3px color-mix(in srgb, ${P} 20%, transparent)`
    : undefined;

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0 : 1,
  };

  return (
    <div
      ref={setSortableRef}
      style={{
        ...sortableStyle,
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor,
        boxShadow,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelected(id);
      }}
      className="group/step rounded-xl overflow-hidden transition-all"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 border-b px-3 py-2"
        style={{
          backgroundColor: headerBg,
          borderColor: headerBorder,
        }}
      >
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-primary" />
        </div>
        <Layers className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-bold truncate flex-1 text-primary">
          Step {index + 1} — {config.label}
        </span>
        {config.description && (
          <span className="text-[10px] text-muted-foreground truncate hidden md:block">
            {config.description}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeItem(id);
          }}
          className="transition-opacity shrink-0 p-1 rounded hover:bg-destructive/10"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>

      {/* Containers zone — 12-column grid */}
      <div
        ref={setDropRef}
        className={cn(
          "relative p-3 min-h-[80px] gap-2 items-start transition-all duration-150",
          isOver
            ? "bg-blue-500/20 ring-2 ring-inset ring-blue-400/70 shadow-[inset_0_0_0_2px_theme(colors.blue.400/50%)]"
            : "",
        )}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "min-content",
          backgroundImage:
            "radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {/* Grid overlay during container position drag */}
        <GridOverlay
          showGuides={!!isDraggingChild}
          positionDrag={isDraggingChild ? positionDrag : null}
        />

        {children.length === 0 && (
          <p
            className="text-xs text-muted-foreground/50 text-center py-6 italic w-full"
            style={{ gridColumn: "span 12" }}
          >
            Arraste containers aqui
          </p>
        )}
        {children.map((childId) => {
          const type = getItemType(childId);
          if (type === "container")
            return (
              <DroppedContainer key={childId} id={childId} container={id} />
            );
          return <DroppedField key={childId} id={childId} container={id} />;
        })}
      </div>
    </div>
  );
};
