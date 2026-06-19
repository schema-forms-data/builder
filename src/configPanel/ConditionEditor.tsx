/**
 * ConditionEditor — Conditional display logic for a field.
 * Shows human-readable labels instead of raw IDs.
 */

import { Checkbox } from '@schema-forms-data/ui';
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schema-forms-data/ui';
import type { ItemCondition, ConditionOperator } from "../types";
import { EVENT_VARIABLES } from "../constants";

const OPERATORS = [
  { value: "igual", label: "Igual a" },
  { value: "diferente", label: "Diferente de" },
  { value: "vazio", label: "Vazio" },
  { value: "naoVazio", label: "Não vazio" },
  { value: "contem", label: "Contém" },
  { value: "naoContem", label: "Não contém" },
  { value: "maiorQue", label: "Maior que" },
  { value: "menorQue", label: "Menor que" },
  { value: "maiorOuIgual", label: "Maior ou igual a" },
  { value: "menorOuIgual", label: "Menor ou igual a" },
] as const;

const NO_VALUE_OPERATORS: ConditionOperator[] = ["vazio", "naoVazio"];

interface ConditionEditorProps {
  condition: ItemCondition | undefined;
  selectedId: string;
  /** All field IDs available in the form */
  allFieldIds: string[];
  /** Get a field label by its ID */
  getFieldLabel: (id: string) => string;
  onChange: (condition: ItemCondition | undefined) => void;
}

/** Renders a single condition row (when / operator / value / source). */
const ConditionRow = ({
  cond,
  selectedId,
  allFieldIds,
  getFieldLabel,
  onUpdate,
}: {
  cond: ItemCondition;
  selectedId: string;
  allFieldIds: string[];
  getFieldLabel: (id: string) => string;
  onUpdate: (partial: Partial<ItemCondition>) => void;
}) => (
  <div className="space-y-2">
    {/* Source selector */}
    <div className="space-y-1">
      <Label className="text-[10px]">Fonte</Label>
      <Select
        value={cond.source || "campo"}
        onValueChange={(v) =>
          onUpdate({ source: v as "campo" | "evento", when: "" })
        }
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="campo">Campo do formulário</SelectItem>
          <SelectItem value="evento">Variável do evento</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Field/Variable selector */}
    <div className="space-y-1">
      <Label className="text-[10px]">
        {cond.source === "evento" ? "Variável do evento" : "Quando o campo"}
      </Label>
      <Select
        value={cond.when || ""}
        onValueChange={(v) => onUpdate({ when: v })}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue
            placeholder={
              cond.source === "evento"
                ? "Selecione uma variável..."
                : "Selecione um campo..."
            }
          />
        </SelectTrigger>
        <SelectContent>
          {cond.source === "evento"
            ? EVENT_VARIABLES.map((ev) => (
                <SelectItem key={ev.key} value={ev.key}>
                  {ev.label}
                </SelectItem>
              ))
            : allFieldIds
                .filter((fid) => fid !== selectedId)
                .map((fid) => (
                  <SelectItem key={fid} value={fid}>
                    {getFieldLabel(fid)}
                    <span className="text-muted-foreground/50 ml-1 text-[9px] font-mono">
                      ({fid})
                    </span>
                  </SelectItem>
                ))}
        </SelectContent>
      </Select>
    </div>

    {/* Operator */}
    <div className="space-y-1">
      <Label className="text-[10px]">Operador</Label>
      <Select
        value={cond.operator}
        onValueChange={(v) => onUpdate({ operator: v as ConditionOperator })}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Value */}
    {!NO_VALUE_OPERATORS.includes(cond.operator) && (
      <div className="space-y-1">
        <Label className="text-[10px]">Valor</Label>
        <Input
          value={cond.value || ""}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="h-7 text-xs"
          placeholder="Valor esperado"
        />
      </div>
    )}
  </div>
);

export const ConditionEditor = ({
  condition,
  selectedId,
  allFieldIds,
  getFieldLabel,
  onChange,
}: ConditionEditorProps) => {
  const updateCondition = (partial: Partial<ItemCondition>) => {
    if (!condition) return;
    onChange({ ...condition, ...partial });
  };

  const addExtraCondition = () => {
    if (!condition) return;
    const extras = condition.extraConditions ?? [];
    onChange({
      ...condition,
      logicOperator: condition.logicOperator ?? "and",
      extraConditions: [
        ...extras,
        { when: "", operator: "igual", value: "", source: "campo" },
      ],
    });
  };

  const removeExtraCondition = (index: number) => {
    if (!condition) return;
    const extras = (condition.extraConditions ?? []).filter(
      (_, i) => i !== index,
    );
    onChange({
      ...condition,
      extraConditions: extras,
      logicOperator: extras.length ? condition.logicOperator : undefined,
    });
  };

  const updateExtraCondition = (
    index: number,
    partial: Partial<ItemCondition>,
  ) => {
    if (!condition) return;
    const extras = (condition.extraConditions ?? []).map((ec, i) =>
      i === index ? { ...ec, ...partial } : ec,
    );
    onChange({ ...condition, extraConditions: extras });
  };

  const hasExtras = (condition?.extraConditions?.length ?? 0) > 0;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Condicional
      </h4>

      <div className="flex items-center gap-2">
        <Checkbox
          id="has-condition"
          checked={!!condition}
          onCheckedChange={(v) => {
            if (v) {
              onChange({
                when: "",
                operator: "igual",
                value: "",
                source: "campo",
              });
            } else {
              onChange(undefined);
            }
          }}
        />
        <Label htmlFor="has-condition" className="text-xs cursor-pointer">
          Exibir condicionalmente
        </Label>
      </div>

      {condition && (
        <div className="space-y-2 pl-2 border-l-2 border-amber-500/30">
          {/* Condição principal */}
          <ConditionRow
            cond={condition}
            selectedId={selectedId}
            allFieldIds={allFieldIds}
            getFieldLabel={getFieldLabel}
            onUpdate={updateCondition}
          />

          {/* Lógica AND/OR — aparece quando há condições extras */}
          {hasExtras && (
            <div className="space-y-1">
              <Label className="text-[10px]">Lógica</Label>
              <Select
                value={condition.logicOperator ?? "and"}
                onValueChange={(v) =>
                  updateCondition({ logicOperator: v as "and" | "or" })
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="and">
                    E (AND) — todas devem ser verdadeiras
                  </SelectItem>
                  <SelectItem value="or">
                    OU (OR) — pelo menos uma deve ser verdadeira
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Condições extras */}
          {(condition.extraConditions ?? []).map((ec, i) => (
            <div key={i} className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-medium uppercase">
                  {condition.logicOperator === "or" ? "OU" : "E"} — condição{" "}
                  {i + 2}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-[10px] text-destructive hover:text-destructive"
                  onClick={() => removeExtraCondition(i)}
                >
                  Remover
                </Button>
              </div>
              <ConditionRow
                cond={ec}
                selectedId={selectedId}
                allFieldIds={allFieldIds}
                getFieldLabel={getFieldLabel}
                onUpdate={(partial) => updateExtraCondition(i, partial)}
              />
            </div>
          ))}

          {/* Botão para adicionar condição extra */}
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-[10px] w-full mt-1"
            onClick={addExtraCondition}
          >
            + Adicionar condição
          </Button>
        </div>
      )}
    </div>
  );
};
