/**
 * LivePreview — Preview do builder usando FormRenderer real.
 *
 * Converte o estado do builder em FormSchema via builderToFormSchema,
 * e renderiza com o FormRenderer do pacote @schema-forms-data/renderer.
 * Handlers de upload e CEP são mocks para o ambiente de preview.
 */

import { useState, useMemo, useCallback } from "react";
import { useBuilder } from "../BuilderContext";
import { builderToFormSchema } from "../schemaConverter";
import {
  FormRenderer,
  DefaultStepIndicator,
} from "@schema-forms-data/renderer";
import type {
  CepLookupResult,
  StepIndicatorProps,
} from "@schema-forms-data/renderer";

// Wrapper que força o indicador de steps a aparecer mesmo com 1 step,
// para o usuário conseguir visualizar a config em tempo real no builder.
const BuilderStepIndicator = (props: StepIndicatorProps) => (
  <DefaultStepIndicator {...props} forceShow />
);
import { PreviewToolbar } from "./PreviewToolbar";
import { CompletedScreen } from "./CompletedScreen";
import type { FormField, FormSchema } from "@schema-forms-data/core";
import { FormSchemaStatus } from "@schema-forms-data/core";

// ── Mock handlers ─────────────────────────────────────────────────────────────

const mockUploadFile = async (
  _file: File,
  _fieldName: string,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  for (let i = 20; i <= 100; i += 20) {
    await new Promise((r) => setTimeout(r, 80));
    onProgress?.(i);
  }
  return `mock-upload-${Date.now()}`;
};

const mockCepLookup = async (_cep: string): Promise<CepLookupResult> => ({});

// ── Mock value generation ─────────────────────────────────────────────────────

const MOCK_MAP: Record<string, unknown> = {
  texto: "Texto de teste",
  textarea: "Texto longo de exemplo para preview do formulário.",
  email: "teste@email.com",
  number: 42,
  telefone: "(11) 99999-9999",
  cpf: "123.456.789-00",
  cep: "01001-000",
  date: new Date().toISOString().slice(0, 10),
  datetime: new Date().toISOString().slice(0, 10),
  time: "10:30",
  password: "Senha123!",
  masked: "123456",
  checkbox: true,
  switch: true,
  slider: 50,
  rating: 4,
  color: "#3B82F6",
  participation_type: { tipo: "todos_os_dias", data: null, genero: null },
  payment_method: { metodo: "pix", valorTotal: 0 },
  date_range: {
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  },
  file: "mock-upload-preview",
};

function getMockForField(field: FormField): unknown {
  const t = field.tipo as string;
  // Tipos que deixamos sem mock (form gerencia seu estado)
  if (t === "hidden" || t === "terms" || t === "field_array") {
    return undefined;
  }
  if (MOCK_MAP[t] !== undefined) return MOCK_MAP[t];
  if (
    (t === "select" || t === "radio" || t === "autocomplete") &&
    field.opcoes?.length
  ) {
    return field.opcoes[0].valor;
  }
  if (t === "checkbox_group" && field.opcoes?.length) {
    return [field.opcoes[0].valor];
  }
  return "Teste";
}

function generateMockValues(schema: FormSchema): Record<string, unknown> {
  const vals: Record<string, unknown> = {};
  for (const step of schema.steps) {
    for (const cont of step.containers) {
      for (const field of cont.campos) {
        const val = getMockForField(field);
        if (val !== undefined) {
          vals[field.nome] = val;
        }
      }
    }
  }
  return vals;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const LivePreview = ({
  eventoData,
}: {
  eventoData?: Record<string, string>;
}) => {
  const { containers, configs, previewTemplateId, stepConfig } = useBuilder();

  const schema = useMemo(
    () =>
      builderToFormSchema({ containers }, configs, {
        nome: "Preview",
        status: FormSchemaStatus.RASCUNHO,
        template: previewTemplateId,
        stepConfig,
      }) as FormSchema,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containers, configs, previewTemplateId, stepConfig],
  );

  // key bumped to reset FormRenderer (re-mount limpa estado interno)
  const [key, setKey] = useState(0);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>(
    {},
  );
  const [completed, setCompleted] = useState(false);

  const fillMock = useCallback(() => {
    setInitialValues(generateMockValues(schema));
    setKey((k) => k + 1);
    setCompleted(false);
  }, [schema]);

  const clearForm = useCallback(() => {
    setInitialValues({});
    setKey((k) => k + 1);
    setCompleted(false);
  }, []);

  const restartForm = useCallback(() => {
    setInitialValues({});
    setKey((k) => k + 1);
    setCompleted(false);
  }, []);

  if (schema.steps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/40 p-6 text-center text-xs text-muted-foreground/50">
        Adicione steps, containers e campos para ver o preview ao vivo
      </div>
    );
  }

  if (completed) {
    return <CompletedScreen onRestart={restartForm} />;
  }

  return (
    <div className="space-y-3">
      {/* Toolbar — sempre usa as cores do builder, fora do TemplateProvider */}
      <div className="px-1">
        <PreviewToolbar onFillMock={fillMock} onClear={clearForm} />
      </div>

      <FormRenderer
        key={key}
        schema={schema}
        initialValues={initialValues}
        template={previewTemplateId}
        externalData={eventoData}
        uploadFile={mockUploadFile}
        cepLookup={mockCepLookup}
        onComplete={async () => setCompleted(true)}
        StepIndicator={BuilderStepIndicator}
      />
    </div>
  );
};
