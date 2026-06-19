/**
 * Palette — dnd-kit migration.
 * Each item uses useDraggable; data is read in FormSchemaBuilder's onDragEnd.
 */
import { GripVertical, ChevronDown } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { FIELD_TYPES, STRUCTURE_TYPES } from "./constants";
import {
  PRESET_BLOCKS,
  PRESET_STEP_BLOCKS,
} from "@schema-forms-data/templates";
import * as LucideIcons from "lucide-react";
import { useBuilder } from "./BuilderContext";

const PRESET_CATEGORY_LABELS: Record<string, string> = {
  personal: "Pessoal",
  address: "Endereço",
  health: "Saúde",
  event: "Evento",
  payment: "Pagamento",
  emergency: "Emergência",
};

const FIELD_GROUP_LABELS: Record<string, string> = {
  texto: "Texto",
  selecao: "Seleção",
  range: "Numérico / Visual",
  data: "Data e Hora",
  contato: "Contato / Endereço",
  outros: "Arquivo / Outros",
};

export const Palette = () => {
  const grouped = FIELD_TYPES.reduce<Record<string, typeof FIELD_TYPES>>(
    (acc, f) => {
      const g = (f as typeof f & { group?: string }).group ?? "outros";
      if (!acc[g]) acc[g] = [];
      acc[g].push(f);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-4">
      {/* Structure */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Estrutura
        </h2>
        {STRUCTURE_TYPES.map((item) => (
          <PaletteItem
            key={item.component}
            component={item.component}
            label={item.label}
            icon={item.icon}
            color={item.color}
          />
        ))}
      </div>

      {/* Fields — grouped */}
      {Object.entries(grouped).map(([group, fields]) => (
        <CollapsibleGroup
          key={group}
          label={FIELD_GROUP_LABELS[group] ?? group}
        >
          {fields.map((field) => (
            <PaletteItem
              key={field.component}
              component={field.component}
              label={field.label}
              icon={field.icon}
              color="border-border"
            />
          ))}
        </CollapsibleGroup>
      ))}

      {/* Preset Blocks */}
      <CollapsibleGroup label="Blocos pré-configurados" defaultOpen={false}>
        {PRESET_BLOCKS.map((block) => (
          <PresetBlockItem key={block.id} block={block} />
        ))}
      </CollapsibleGroup>

      {/* Preset Step Blocks */}
      <CollapsibleGroup label="Blocos de steps" defaultOpen={false}>
        {PRESET_STEP_BLOCKS.map((block) => (
          <PresetStepBlockItem key={block.id} block={block} />
        ))}
      </CollapsibleGroup>
    </div>
  );
};

// ─── Collapsible group ───────────────────────────────────────────────────────

const CollapsibleGroup = ({
  label,
  children,
  defaultOpen = true,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
};

const PaletteItem = ({
  component,
  label,
  icon: Icon,
  color,
}: {
  component: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${component}`,
      data: { isPaletteItem: true, componentType: component },
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab flex items-center gap-2 rounded-lg border px-3 py-2 select-none hover:bg-accent transition-colors ${color} ${isDragging ? "opacity-50" : ""}`}
      style={{
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
      }}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

const PresetBlockItem = ({
  block,
}: {
  block: (typeof PRESET_BLOCKS)[number];
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `preset-${block.id}`,
      data: { isPalettePreset: true, presetId: block.id },
    });

  const Icon = block.icon
    ? ((LucideIcons as Record<string, unknown>)[block.icon] as
        | React.FC<{ className?: string }>
        | undefined)
    : undefined;

  const categoryLabel =
    PRESET_CATEGORY_LABELS[block.category] ?? block.category;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 select-none hover:bg-primary/10 transition-colors ${isDragging ? "opacity-50" : ""}`}
      style={{
        transform: isDragging ? undefined : CSS.Translate.toString(transform),
      }}
      title={block.description}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
      {Icon ? (
        <Icon className="h-4 w-4 text-primary shrink-0" />
      ) : (
        <LucideIcons.Blocks className="h-4 w-4 text-primary shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">{block.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {categoryLabel}
        </span>
      </div>
    </div>
  );
};

const PresetStepBlockItem = ({
  block,
}: {
  block: (typeof PRESET_STEP_BLOCKS)[number];
}) => {
  const { addPresetStepBlock } = useBuilder();

  const Icon = block.icon
    ? ((LucideIcons as Record<string, unknown>)[block.icon] as
        | React.FC<{ className?: string }>
        | undefined)
    : undefined;

  return (
    <button
      type="button"
      onClick={() => addPresetStepBlock(block)}
      className="w-full flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 cursor-pointer select-none hover:bg-amber-500/15 transition-colors text-left"
      title={block.description}
    >
      {Icon ? (
        <Icon className="h-4 w-4 text-amber-400 shrink-0" />
      ) : (
        <LucideIcons.Layers className="h-4 w-4 text-amber-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block truncate">{block.name}</span>
        <span className="text-[10px] text-muted-foreground">
          {block.steps.length} steps
        </span>
      </div>
      <span className="text-[10px] text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5 shrink-0">
        +{block.steps.length} steps
      </span>
    </button>
  );
};
