/**
 * BuilderWrapper — Provides BuilderContext for a given FormSchema.
 * Handles the formSchemaToBuilder conversion and wraps BuilderProvider.
 * Accepts children so the app can compose its own editor UI inside.
 */
import { useMemo, type ReactNode } from "react";
import type { FormSchema } from "@schema-forms-data/core";
import { BuilderProvider } from "./BuilderContext";
import { formSchemaToBuilder } from "./schemaConverter";
import { TooltipProvider } from "@schema-forms-data/ui";

interface BuilderWrapperProps {
  schema: FormSchema | null;
  children: ReactNode;
  uploadTermsPdf?: (
    file: File,
    schemaId: string,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  deleteTermsPdf?: (uploadId: string, schemaId: string) => Promise<void>;
}

export const BuilderWrapper = ({
  schema,
  children,
  uploadTermsPdf,
  deleteTermsPdf,
}: BuilderWrapperProps) => {
  const converted = useMemo(() => {
    if (schema?.steps?.length) return formSchemaToBuilder(schema);
    return null;
  }, [schema]);

  return (
    <TooltipProvider>
      <BuilderProvider
        initialConfigs={converted?.configs}
        initialContainers={converted?.dndState?.containers}
        initialTemplateId={converted?.templateId ?? undefined}
        initialStepConfig={converted?.stepConfig}
        schemaId={schema?.id ?? undefined}
        uploadTermsPdf={uploadTermsPdf}
        deleteTermsPdf={deleteTermsPdf}
      >
        {children}
      </BuilderProvider>
    </TooltipProvider>
  );
};
