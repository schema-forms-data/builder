/**
 * StepContent — Renders containers and fields for the current step.
 */

import { cn } from '../utils/cn';
import { evaluateCondition } from "../utils/evaluateCondition";
import { FieldPreview } from "./FieldPreview";
import type { ItemConfig } from "../types";

export interface PreviewField {
  id: string;
  config: ItemConfig;
  subFields?: PreviewField[];
}
export interface PreviewContainer {
  id: string;
  config: ItemConfig;
  fields: PreviewField[];
}
export interface PreviewStep {
  id: string;
  config: ItemConfig;
  containers: PreviewContainer[];
}

interface StepContentProps {
  step: PreviewStep;
  stepIndex: number;
  formValues: Record<string, string>;
  errors: Record<string, string>;
  eventoData?: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export const StepContent = ({
  step,
  stepIndex,
  formValues,
  errors,
  eventoData,
  onChange,
}: StepContentProps) => (
  <div className="rounded-xl border bg-card p-5 space-y-5">
    <div>
      {step.config.showLabel !== false && (
        <h2 className="text-base font-bold text-foreground">
          Step {stepIndex + 1} — {step.config.label}
        </h2>
      )}
      {step.config.description && (
        <p className="text-sm text-muted-foreground mt-0.5">
          {step.config.description}
        </p>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {step.containers.map((cont) => (
        <div
          key={cont.id}
          className={cn(
            "space-y-3",
            cont.config.showAsCard && "rounded-lg border bg-card p-4 shadow-sm",
          )}
          style={{
            gridColumn: cont.config.inicioColuna
              ? `${cont.config.inicioColuna} / span ${cont.config.tamanho || 12}`
              : `span ${cont.config.tamanho || 12}`,
          }}
        >
          {cont.config.showLabel !== false &&
            cont.config.label !== "Novo Container" && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {cont.config.label}
                </h3>
                {cont.config.description && (
                  <p className="text-xs text-muted-foreground">
                    {cont.config.description}
                  </p>
                )}
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {cont.fields.map((field) => (
              <FieldPreview
                key={field.id}
                config={field.config}
                fieldId={field.id}
                subFields={field.subFields}
                value={formValues[field.id] || ""}
                onChange={(v) => onChange(field.id, v)}
                visible={evaluateCondition(
                  field.config.condition,
                  formValues,
                  eventoData,
                )}
                error={errors[field.id]}
                eventoData={eventoData}
                allValues={formValues}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
