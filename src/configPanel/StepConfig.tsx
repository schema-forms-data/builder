/**
 * StepConfig — Configuration panel for step items.
 */

import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Checkbox } from '@schema-forms-data/ui';
import { IconPicker } from '@schema-forms-data/ui';
import type { ItemConfig } from "../types";
import { VarPicker } from "./VarPicker";

interface StepConfigProps {
  config: ItemConfig;
  onUpdate: (partial: Partial<ItemConfig>) => void;
}

export const StepConfig = ({ config, onUpdate }: StepConfigProps) => (
  <div className="space-y-4">
    {/* Label */}
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Label</Label>
        <VarPicker />
      </div>
      <Input
        value={config.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        className="h-8 text-sm"
      />
    </div>

    {/* Description */}
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Descrição</Label>
        <VarPicker />
      </div>
      <Input
        value={config.description || ""}
        onChange={(e) => onUpdate({ description: e.target.value })}
        className="h-8 text-sm"
        placeholder="Descrição do step"
      />
    </div>

    {/* Icon */}
    <IconPicker
      value={config.icone}
      onChange={(name) => onUpdate({ icone: name })}
    />

    {/* Show label toggle */}
    <div className="flex items-center gap-2">
      <Checkbox
        id="step-show-label"
        checked={config.showLabel !== false}
        onCheckedChange={(v) => onUpdate({ showLabel: v === true })}
      />
      <Label htmlFor="step-show-label" className="text-xs cursor-pointer">
        Exibir título no formulário
      </Label>
    </div>
  </div>
);
