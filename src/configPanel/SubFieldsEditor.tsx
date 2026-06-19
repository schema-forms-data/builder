/**
 * SubFieldsEditor — inline editor for FIELD_ARRAY sub-fields.
 * Allows adding, removing and quick-configuring each sub-field
 * (name, label, type, required, placeholder).
 */

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from '@schema-forms-data/ui';
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schema-forms-data/ui';
import { Checkbox } from '@schema-forms-data/ui';
import { Separator } from '@schema-forms-data/ui';
import { Badge } from '@schema-forms-data/ui';
import { OptionsEditor } from "./OptionsEditor";
import type { ItemConfig } from "../types";

/** Simpler field types allowed as sub-fields inside a FIELD_ARRAY */
const SUB_FIELD_TYPES = [
  { value: "texto", label: "Texto" },
  { value: "textarea", label: "Área de texto" },
  { value: "number", label: "Número" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "cpf", label: "CPF" },
  { value: "cep", label: "CEP" },
  { value: "date", label: "Data" },
  { value: "datetime", label: "Data e hora" },
  { value: "select", label: "Seleção" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
];

interface SubFieldsEditorProps {
  subFields: ItemConfig[];
  onChange: (subFields: ItemConfig[]) => void;
}

export const SubFieldsEditor = ({
  subFields,
  onChange,
}: SubFieldsEditorProps) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const update = (index: number, patch: Partial<ItemConfig>) => {
    const next = subFields.map((sf, i) =>
      i === index ? { ...sf, ...patch } : sf,
    );
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(subFields.filter((_, i) => i !== index));
    setExpanded(null);
  };

  const add = () => {
    const newField: ItemConfig = {
      label: "Novo campo",
      name: `campo_${subFields.length + 1}`,
      fieldType: "texto",
      required: false,
    };
    onChange([...subFields, newField]);
    setExpanded(subFields.length); // expand newly added
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Sub-campos</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1"
          onClick={add}
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </Button>
      </div>

      {subFields.length === 0 && (
        <p className="text-[11px] text-muted-foreground italic py-1">
          Nenhum sub-campo adicionado.
        </p>
      )}

      {subFields.map((sf, i) => (
        <div key={i} className="border rounded-md text-xs overflow-hidden">
          {/* Header row */}
          <div
            className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-muted/40 select-none"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <Badge variant="secondary" className="h-4 text-[9px] px-1 shrink-0">
              {i + 1}
            </Badge>
            <span className="flex-1 truncate font-medium">
              {sf.label || sf.name || "Campo sem nome"}
            </span>
            <span className="text-muted-foreground text-[10px] shrink-0">
              {SUB_FIELD_TYPES.find((t) => t.value === sf.fieldType)?.label ??
                sf.fieldType}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-destructive hover:text-destructive shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                remove(i);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            {expanded === i ? (
              <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
          </div>

          {/* Expanded config */}
          {expanded === i && (
            <div className="px-2 pb-2 space-y-2 border-t bg-muted/20">
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Label</Label>
                  <Input
                    value={sf.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Ex: Nome"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Nome (campo)</Label>
                  <Input
                    value={sf.name || ""}
                    onChange={(e) => update(i, { name: e.target.value })}
                    className="h-7 text-xs"
                    placeholder="Ex: nome"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Tipo de campo</Label>
                  <Select
                    value={sf.fieldType as string}
                    onValueChange={(v) => update(i, { fieldType: v })}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUB_FIELD_TYPES.map((t) => (
                        <SelectItem
                          key={t.value}
                          value={t.value}
                          className="text-xs"
                        >
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Colunas (1-12)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={sf.tamanho ?? ""}
                    onChange={(e) =>
                      update(i, {
                        tamanho: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    className="h-7 text-xs"
                    placeholder="12"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px]">Placeholder</Label>
                <Input
                  value={sf.placeholder || ""}
                  onChange={(e) => update(i, { placeholder: e.target.value })}
                  className="h-7 text-xs"
                  placeholder="Texto de exemplo..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id={`sf-req-${i}`}
                  checked={sf.required || false}
                  onCheckedChange={(v) => update(i, { required: v === true })}
                />
                <Label
                  htmlFor={`sf-req-${i}`}
                  className="text-[10px] cursor-pointer"
                >
                  Obrigatório
                </Label>
              </div>

              {/* Opções — apenas para select/radio/checkbox_group */}
              {["select", "radio", "checkbox_group"].includes(
                sf.fieldType as string,
              ) && (
                <div className="pt-1">
                  <OptionsEditor
                    options={sf.options || []}
                    onChange={(options) => update(i, { options })}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {subFields.length > 0 && <Separator className="mt-1" />}
    </div>
  );
};
