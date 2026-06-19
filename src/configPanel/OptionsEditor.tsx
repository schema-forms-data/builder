/**
 * OptionsEditor — Edit options for select/radio/checkbox_group fields.
 * Uses stable IDs per option to avoid React key issues.
 */

import { useCallback, useRef } from "react";
import { Input } from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
import { Trash2, Plus, GripVertical } from "lucide-react";
import type { FieldOption } from "../types";
import { VarPicker } from "./VarPicker";

interface OptionsEditorProps {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}

export const OptionsEditor = ({ options, onChange }: OptionsEditorProps) => {
  // IDs estáveis por opção — vivem apenas no editor, não no schema
  const stableIds = useRef<string[]>([]);
  if (stableIds.current.length < options.length) {
    for (let i = stableIds.current.length; i < options.length; i++) {
      stableIds.current.push(`opt-${Math.random().toString(36).slice(2)}`);
    }
  }

  const updateOption = useCallback(
    (idx: number, field: keyof FieldOption, value: string) => {
      const newOpts = [...options];
      newOpts[idx] = { ...newOpts[idx], [field]: value };
      onChange(newOpts);
    },
    [options, onChange],
  );

  const removeOption = useCallback(
    (idx: number) => {
      stableIds.current.splice(idx, 1);
      onChange(options.filter((_, i) => i !== idx));
    },
    [options, onChange],
  );

  const addOption = useCallback(() => {
    onChange([...options, { value: "", label: "" }]);
  }, [options, onChange]);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Opções
      </h4>

      {options.map((opt, idx) => (
        <div key={stableIds.current[idx]} className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <Input
            value={opt.value}
            onChange={(e) => updateOption(idx, "value", e.target.value)}
            className="h-7 text-xs flex-1"
            placeholder="Valor"
          />
          <div className="flex items-center gap-0.5 flex-1">
            <Input
              value={opt.label}
              onChange={(e) => updateOption(idx, "label", e.target.value)}
              className="h-7 text-xs flex-1"
              placeholder="Label"
            />
            <VarPicker />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => removeOption(idx)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={addOption}
      >
        <Plus className="h-3 w-3 mr-1" /> Adicionar opção
      </Button>
    </div>
  );
};
