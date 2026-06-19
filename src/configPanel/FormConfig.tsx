/**
 * FormConfig — Painel de configurações de nível do formulário.
 *
 * Aparece no ConfigPanel quando nenhum item está selecionado.
 * Edita schema.stepConfig — sobrescreve os valores do template para
 * este formulário específico.
 */

import { Checkbox } from "@schema-forms-data/ui";
import { Label } from "@schema-forms-data/ui";
import { Separator } from "@schema-forms-data/ui";
import { useBuilder } from "../BuilderContext";
import { TemplateSelector } from "../TemplateSelector";
import type {
  StepIndicatorVariant,
  StepIndicatorPosition,
  StepIndicatorOrientation,
} from "@schema-forms-data/core";

const VARIANTS: { value: StepIndicatorVariant; label: string }[] = [
  { value: "numbers", label: "Números" },
  { value: "icons", label: "Ícones" },
  { value: "icons-labeled", label: "Ícones + rótulo" },
];

const POSITIONS: { value: StepIndicatorPosition; label: string }[] = [
  { value: "top-center", label: "Centralizado" },
  { value: "top-left", label: "Esquerda" },
];

const ORIENTATIONS: { value: StepIndicatorOrientation; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "vertical", label: "Vertical (sidebar)" },
];

export const FormConfig = () => {
  const { stepConfig, updateStepConfig } = useBuilder();

  return (
    <div className="space-y-5">
      {/* Template de Preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Template visual
        </p>
        <TemplateSelector />
      </div>

      <Separator />

      {/* Indicador de steps */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Indicador de steps
        </p>

        {/* Show step indicators */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="sc-show-indicators"
            checked={stepConfig.showStepIndicators !== false}
            onCheckedChange={(v) =>
              updateStepConfig({ showStepIndicators: v === true })
            }
          />
          <Label
            htmlFor="sc-show-indicators"
            className="text-xs cursor-pointer"
          >
            Exibir indicador de steps
          </Label>
        </div>

        {/* Show progress bar */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="sc-show-progress"
            checked={stepConfig.showProgressBar === true}
            onCheckedChange={(v) =>
              updateStepConfig({ showProgressBar: v === true })
            }
          />
          <Label htmlFor="sc-show-progress" className="text-xs cursor-pointer">
            Exibir barra de progresso
          </Label>
        </div>
      </div>

      <Separator />

      {/* Variante */}
      <div className="space-y-2">
        <Label className="text-xs">Variante visual</Label>
        <div className="flex flex-col gap-1.5">
          {VARIANTS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() =>
                updateStepConfig({ stepIndicatorVariant: v.value })
              }
              className={`text-left text-xs px-3 py-1.5 rounded-md border transition-colors ${
                stepConfig.stepIndicatorVariant === v.value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        {!stepConfig.stepIndicatorVariant && (
          <p className="text-[10px] text-muted-foreground">
            Herdado do template
          </p>
        )}
      </div>

      <Separator />

      {/* Orientação */}
      <div className="space-y-2">
        <Label className="text-xs">Orientação</Label>
        <div className="flex gap-2">
          {ORIENTATIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() =>
                updateStepConfig({ stepIndicatorOrientation: o.value })
              }
              className={`flex-1 text-xs px-2 py-1.5 rounded-md border transition-colors ${
                stepConfig.stepIndicatorOrientation === o.value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {!stepConfig.stepIndicatorOrientation && (
          <p className="text-[10px] text-muted-foreground">
            Herdado do template
          </p>
        )}
      </div>

      <Separator />

      {/* Posição */}
      <div className="space-y-2">
        <Label className="text-xs">Posição (desktop)</Label>
        <div className="flex gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() =>
                updateStepConfig({ stepIndicatorPosition: p.value })
              }
              className={`flex-1 text-xs px-2 py-1.5 rounded-md border transition-colors ${
                stepConfig.stepIndicatorPosition === p.value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {!stepConfig.stepIndicatorPosition && (
          <p className="text-[10px] text-muted-foreground">
            Herdado do template
          </p>
        )}
      </div>
    </div>
  );
};
