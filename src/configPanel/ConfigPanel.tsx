/**
 * ConfigPanel — Orchestrator.
 *
 * Detects item type (step / container / field) and renders
 * the corresponding sub-panel. All heavy UI lives in the sub-components.
 */

import { useBuilder } from "../BuilderContext";
import { getItemType } from "../constants";
import { Separator } from "@schema-forms-data/ui";
import { StepConfig } from "./StepConfig";
import { ContainerConfig } from "./ContainerConfig";
import { FieldConfig } from "./FieldConfig";
import { FormConfig } from "./FormConfig";

export const ConfigPanel = () => {
  const { selectedId, getConfig, updateConfig, getAllFieldIds } = useBuilder();

  if (!selectedId) {
    return (
      <div className="rounded-xl border bg-card p-4 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Formulário</h3>
        </div>
        <Separator />
        <FormConfig />
      </div>
    );
  }

  const config = getConfig(selectedId);
  const type = getItemType(selectedId);

  const handleUpdate = (partial: Parameters<typeof updateConfig>[1]) =>
    updateConfig(selectedId, partial);

  const allFieldIds = getAllFieldIds().filter((id) => id !== selectedId);

  const getFieldLabel = (id: string): string => {
    const cfg = getConfig(id);
    return cfg.label || id;
  };

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          {type === "step"
            ? "Step"
            : type === "container"
              ? "Container"
              : "Campo"}
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {selectedId}
        </span>
      </div>

      <Separator />

      {/* Delegated config */}
      {type === "step" && (
        <StepConfig config={config} onUpdate={handleUpdate} />
      )}

      {type === "container" && (
        <ContainerConfig config={config} onUpdate={handleUpdate} />
      )}

      {type === "field" && (
        <FieldConfig
          config={config}
          selectedId={selectedId}
          allFieldIds={allFieldIds}
          getFieldLabel={getFieldLabel}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};
