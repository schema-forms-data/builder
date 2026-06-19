/**
 * DragGhost — visual preview rendered by DragOverlay during drag operations.
 * Reads state directly from BuilderContext (no props needed for getConfig).
 */
import * as LucideIcons from "lucide-react";
import { GripVertical } from "lucide-react";
import { STRUCTURE_TYPES, FIELD_TYPES } from "./constants";
import { getPresetById } from "@schema-forms-data/templates";
import { useBuilder } from "./BuilderContext";
import { cn } from "./utils/cn";

const ALL_TYPES = [...STRUCTURE_TYPES, ...FIELD_TYPES];

export const DragGhost = ({ data }: { data: unknown }) => {
  const { getConfig } = useBuilder();

  if (!data) return null;

  const d = data as Record<string, unknown>;

  if (d.isPalettePreset) {
    const preset = getPresetById(d.presetId as string);
    return (
      <div className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 shadow-2xl text-xs font-semibold cursor-grabbing pointer-events-none">
        <LucideIcons.Blocks className="h-3.5 w-3.5 shrink-0" />
        {preset?.name ?? "Bloco"}
      </div>
    );
  }

  if (d.isPaletteItem) {
    const meta = ALL_TYPES.find((t) => t.component === d.componentType);
    const Icon = meta?.icon;
    return (
      <div className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 shadow-2xl text-xs font-semibold cursor-grabbing pointer-events-none">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
        {meta?.label ?? (d.componentType as string)}
      </div>
    );
  }

  if (d.isCanvasItem) {
    const { type, id } = d as { type: string; id: string };
    const config = getConfig(id);
    const colors: Record<string, string> = {
      step: "border-primary/80 bg-primary text-primary-foreground",
      container: "border-blue-600 bg-blue-600 text-white",
      field: "border-primary/80 bg-primary text-primary-foreground",
    };
    const labels: Record<string, string> = {
      step: "Step",
      container: "Container",
      field: "Campo",
    };
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1.5 shadow-2xl text-xs font-semibold cursor-grabbing pointer-events-none min-w-[100px] max-w-[200px]",
          colors[type] ?? "border-border bg-card",
        )}
      >
        <GripVertical className="h-3 w-3 opacity-60 shrink-0" />
        <span className="opacity-70 shrink-0">{labels[type] ?? type}:</span>
        <span className="truncate">{config.label || id}</span>
      </div>
    );
  }

  return null;
};
