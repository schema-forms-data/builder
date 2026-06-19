/**
 * BuilderShell — Composição de BuilderWrapper + BuilderDndContext em um único componente.
 *
 * Substitui o padrão repetitivo:
 * ```tsx
 * <BuilderWrapper schema={schema} uploadTermsPdf={...} deleteTermsPdf={...}>
 *   <BuilderDndContext onError={onError}>
 *     {children}
 *   </BuilderDndContext>
 * </BuilderWrapper>
 * ```
 *
 * Por:
 * ```tsx
 * <BuilderShell schema={schema} uploadTermsPdf={...} deleteTermsPdf={...} onError={onError}>
 *   {children}
 * </BuilderShell>
 * ```
 *
 * `BuilderWrapper` e `BuilderDndContext` continuam exportados para casos que precisem
 * de controle granular sobre o layout ou os sensores de DnD.
 */
import type { ReactNode } from "react";
import type { FormSchema } from "@schema-forms-data/core";
import { BuilderWrapper } from "./BuilderWrapper";
import { BuilderDndContext } from "./BuilderDndContext";

interface BuilderShellProps {
  schema: FormSchema | null;
  children: ReactNode;
  /** Callback de erro exibido quando o DnD falha (ex: drop inválido). */
  onError?: (message: string) => void;
  uploadTermsPdf?: (
    file: File,
    schemaId: string,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  deleteTermsPdf?: (uploadId: string, schemaId: string) => Promise<void>;
}

export const BuilderShell = ({
  schema,
  children,
  onError,
  uploadTermsPdf,
  deleteTermsPdf,
}: BuilderShellProps) => (
  <BuilderWrapper
    schema={schema}
    uploadTermsPdf={uploadTermsPdf}
    deleteTermsPdf={deleteTermsPdf}
  >
    <BuilderDndContext onError={onError}>{children}</BuilderDndContext>
  </BuilderWrapper>
);
