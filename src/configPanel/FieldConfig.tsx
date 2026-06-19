/**
 * FieldConfig — Configuration panel for field items.
 * Orchestrates GridSizeEditor, ValidationEditor, OptionsEditor, ConditionEditor.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@schema-forms-data/ui";
import { Label } from "@schema-forms-data/ui";
import { Checkbox } from "@schema-forms-data/ui";
import { Textarea } from "@schema-forms-data/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@schema-forms-data/ui";
import { Separator } from "@schema-forms-data/ui";
import { Button } from "@schema-forms-data/ui";
import { Progress } from "@schema-forms-data/ui";
import {
  Lock,
  ScrollText,
  Upload,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { FIELD_TYPES } from "../constants";
import { GridSizeEditor } from "./GridSizeEditor";
import { ValidationEditor } from "./ValidationEditor";
import { OptionsEditor } from "./OptionsEditor";
import { ConditionEditor } from "./ConditionEditor";
import { SubFieldsEditor } from "./SubFieldsEditor";
import { VarPicker } from "./VarPicker";
import { useBuilder } from "../BuilderContext";
import type { ItemConfig } from "../types";

interface FieldConfigProps {
  config: ItemConfig;
  selectedId: string;
  allFieldIds: string[];
  getFieldLabel: (id: string) => string;
  onUpdate: (partial: Partial<ItemConfig>) => void;
}

type TermsUploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string; progress: number }
  | { status: "error"; message: string };

export const FieldConfig = ({
  config,
  selectedId,
  allFieldIds,
  getFieldLabel,
  onUpdate,
}: FieldConfigProps) => {
  const fieldType = config.fieldType || "texto";
  const hasOptions = [
    "select",
    "radio",
    "checkbox_group",
    "autocomplete",
  ].includes(fieldType);
  const isFieldArray = fieldType === "field_array";
  const isLocked = config.locked === true;
  const isParticipationType = fieldType === "participation_type";
  const isPaymentMethod = fieldType === "payment_method";
  const isTerms = fieldType === "terms";
  const isFile = fieldType === "file";
  const isSlider = fieldType === "slider";
  const isDisabledOrReadOnly = !!(config.isDisabled || config.isReadOnly);
  const isRating = fieldType === "rating";
  const isDateRange = fieldType === "date_range";
  const isSubForm = fieldType === "sub_form";

  // ── Termos: upload de PDF ────────────────────────────────────────────────
  const { schemaId, uploadTermsPdf, deleteTermsPdf } = useBuilder();
  const [pdfMode, setPdfMode] = useState<"link" | "upload">(
    config.termoPdfUploadId ? "upload" : "link",
  );
  const [uploadState, setUploadState] = useState<TermsUploadState>({
    status: "idle",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const handleDeletePdf = useCallback(
    async (uploadId: string) => {
      onUpdate({ termoPdfUploadId: undefined });
      if (deleteTermsPdf && schemaId) {
        try {
          await deleteTermsPdf(uploadId, schemaId);
        } catch {
          /* ignora erro de delete no storage */
        }
      }
    },
    [deleteTermsPdf, schemaId, onUpdate],
  );

  const processTermsPdf = useCallback(
    async (file: File) => {
      // Validação de MIME em runtime — o atributo `accept` do input é apenas hint do OS
      if (file.type !== "application/pdf") {
        setUploadState({
          status: "error",
          message: "Apenas arquivos PDF são permitidos.",
        });
        return;
      }
      if (!schemaId) {
        setUploadState({
          status: "error",
          message: "Salve o schema primeiro para habilitar o upload de PDF.",
        });
        return;
      }
      if (!uploadTermsPdf) {
        setUploadState({
          status: "error",
          message:
            "Upload de PDF não configurado. Forneça a prop uploadTermsPdf ao BuilderProvider.",
        });
        return;
      }
      const previousId = config.termoPdfUploadId;
      setUploadState({ status: "uploading", fileName: file.name, progress: 0 });
      try {
        const uploadId = await uploadTermsPdf(file, schemaId, (pct) =>
          setUploadState((prev) =>
            prev.status === "uploading" ? { ...prev, progress: pct } : prev,
          ),
        );
        if (!mountedRef.current) return;
        if (previousId && deleteTermsPdf) {
          try {
            await deleteTermsPdf(previousId, schemaId);
          } catch {
            /* ignora */
          }
        }
        if (!mountedRef.current) return;
        onUpdate({ termoPdfUploadId: uploadId, termoPdfUrl: undefined });
        setUploadState({ status: "idle" });
      } catch (err) {
        if (!mountedRef.current) return;
        setUploadState({
          status: "error",
          message:
            err instanceof Error ? err.message : "Falha no upload do PDF.",
        });
      }
    },
    [
      schemaId,
      uploadTermsPdf,
      deleteTermsPdf,
      config.termoPdfUploadId,
      onUpdate,
    ],
  );
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Lock badge — mostrado para campos de blocos pré-configurados */}
      {isLocked && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2">
          <Lock className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Campo bloqueado
            </p>
            <p className="text-[10px] text-muted-foreground">
              Tipo, nome e ID são fixos (integração automática)
            </p>
          </div>
        </div>
      )}

      {/* Participation Type — campo de sistema especial */}
      {isParticipationType && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/30 px-3 py-2">
          <Lock className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium text-primary">
              Tipo de Participação
            </p>
            <p className="text-[10px] text-muted-foreground">
              Datas, preços e vagas são carregados automaticamente do evento
            </p>
          </div>
        </div>
      )}

      {/* Terms — campo de termos e condições */}
      {isTerms && (
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/30 px-3 py-2">
          <ScrollText className="h-4 w-4 text-primary shrink-0" />
          <div>
            <p className="text-xs font-medium text-primary">
              Termos e Condições
            </p>
            <p className="text-[10px] text-muted-foreground">
              Configure o texto ou URL do PDF abaixo
            </p>
          </div>
        </div>
      )}

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

      {/* Para participation_type / payment_method: mostrar só label e hint */}
      {isParticipationType || isPaymentMethod ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Dica (hint)</Label>
            <Input
              value={config.hint || ""}
              onChange={(e) => onUpdate({ hint: e.target.value })}
              className="h-8 text-sm"
              placeholder="Texto de ajuda abaixo do campo"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="req"
              checked={config.required || false}
              onCheckedChange={(v) => onUpdate({ required: v === true })}
            />
            <Label htmlFor="req" className="text-xs cursor-pointer">
              Campo obrigatório
            </Label>
          </div>
        </div>
      ) : isTerms ? (
        /* Termos: label + hint já exibidos acima; aqui só conteúdo dos termos */
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs">Dica (hint)</Label>
            <Input
              value={config.hint || ""}
              onChange={(e) => onUpdate({ hint: e.target.value })}
              className="h-8 text-sm"
              placeholder="Ex: Leia os termos antes de continuar"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="req"
              checked={config.required || false}
              onCheckedChange={(v) => onUpdate({ required: v === true })}
            />
            <Label htmlFor="req" className="text-xs cursor-pointer">
              Campo obrigatório
            </Label>
          </div>
          <Separator />
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Conteúdo dos termos
            </h4>
            <div className="space-y-1">
              <Label className="text-xs">Texto dos termos</Label>
              <Textarea
                value={config.termoTexto || ""}
                onChange={(e) =>
                  onUpdate({ termoTexto: e.target.value || undefined })
                }
                className="text-sm min-h-[120px] resize-y"
                placeholder="Escreva aqui os termos e condições que o usuário deverá ler e aceitar..."
              />
            </div>

            {/* PDF: toggle link / upload */}
            <div className="space-y-2">
              <Label className="text-xs">PDF dos termos (opcional)</Label>
              <div className="flex gap-1 p-0.5 bg-muted rounded-md">
                <button
                  type="button"
                  onClick={() => setPdfMode("link")}
                  className={`flex-1 text-[11px] py-1 rounded transition-colors ${
                    pdfMode === "link"
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Link externo
                </button>
                <button
                  type="button"
                  onClick={() => setPdfMode("upload")}
                  className={`flex-1 text-[11px] py-1 rounded transition-colors ${
                    pdfMode === "upload"
                      ? "bg-background shadow-sm font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload de PDF
                </button>
              </div>

              {pdfMode === "link" ? (
                <div className="space-y-1">
                  <Input
                    value={config.termoPdfUrl || ""}
                    onChange={(e) =>
                      onUpdate({ termoPdfUrl: e.target.value || undefined })
                    }
                    className="h-8 text-sm"
                    placeholder="https://exemplo.com/termos.pdf"
                  />
                  <p className="text-[9px] text-muted-foreground">
                    URL pública de um PDF. Tem prioridade sobre o texto acima.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Arquivo já enviado */}
                  {config.termoPdfUploadId && uploadState.status === "idle" ? (
                    <div className="flex items-center gap-2 rounded border border-green-500/40 bg-green-500/10 px-2 py-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <span className="text-[11px] text-green-700 dark:text-green-400 flex-1">
                        PDF enviado ✓
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() =>
                          handleDeletePdf(config.termoPdfUploadId!)
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}

                  {/* Estado de upload */}
                  {uploadState.status === "uploading" ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span className="truncate">{uploadState.fileName}</span>
                        <span className="ml-auto">{uploadState.progress}%</span>
                      </div>
                      <Progress value={uploadState.progress} className="h-1" />
                    </div>
                  ) : null}

                  {/* Erro */}
                  {uploadState.status === "error" ? (
                    <div className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 px-2 py-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      <span className="text-[11px] text-destructive">
                        {uploadState.message}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-auto"
                        onClick={() => setUploadState({ status: "idle" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : null}

                  {/* Botão selecionar */}
                  {uploadState.status !== "uploading" ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) processTermsPdf(f);
                          e.target.value = "";
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs gap-1.5"
                        disabled={!schemaId}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {config.termoPdfUploadId
                          ? "Substituir PDF"
                          : "Selecionar PDF"}
                      </Button>
                      {!schemaId && (
                        <p className="text-[9px] text-muted-foreground">
                          Salve o schema uma vez para habilitar o upload.
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Name (JSON key) */}
          <div className="space-y-1">
            <Label className="text-xs">Nome (chave)</Label>
            <Input
              value={config.name || selectedId.replace(/^field_/, "")}
              onChange={(e) => !isLocked && onUpdate({ name: e.target.value })}
              className="h-8 text-xs font-mono"
              placeholder="nome_do_campo"
              disabled={isLocked}
            />
            {isLocked ? (
              <p className="text-[9px] text-amber-500">
                ID fixo — necessário para auto-preenchimento
              </p>
            ) : (
              <p className="text-[9px] text-muted-foreground">
                Usado como chave no JSON do formulário
              </p>
            )}
          </div>

          {/* Field Type */}
          <div className="space-y-1">
            <Label className="text-xs">Tipo do campo</Label>
            <Select
              value={fieldType}
              onValueChange={(v) => !isLocked && onUpdate({ fieldType: v })}
              disabled={isLocked}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((f) => (
                  <SelectItem key={f.component} value={f.component}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid Size & Position */}
          <GridSizeEditor
            tamanho={config.tamanho || 6}
            inicioColuna={config.inicioColuna || 1}
            defaultTamanho={6}
            onTamanhoChange={(v) => onUpdate({ tamanho: v })}
            onPositionChange={(col) => onUpdate({ inicioColuna: col })}
          />

          {/* Placeholder — not applicable for file or field_array */}
          {fieldType !== "file" && !isFieldArray && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Placeholder</Label>
                <VarPicker />
              </div>
              <Input
                value={config.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="h-8 text-sm"
                placeholder="Texto de exemplo..."
              />
            </div>
          )}

          {/* Hint */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Dica (hint)</Label>
              <VarPicker />
            </div>
            <Input
              value={config.hint || ""}
              onChange={(e) => onUpdate({ hint: e.target.value })}
              className="h-8 text-sm"
              placeholder="Texto de ajuda abaixo do campo"
            />
          </div>

          {/* Default value — not applicable for file, field_array or sub_form */}
          {fieldType !== "file" && !isFieldArray && !isSubForm && (
            <div className="space-y-1">
              <Label className="text-xs">Valor padrão</Label>
              <Input
                value={config.defaultValue || ""}
                onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                className="h-8 text-sm"
                placeholder="Valor inicial do campo"
              />
            </div>
          )}

          {/* Initial value — runtime (supports {{evento.x}}) */}
          {fieldType !== "file" && !isFieldArray && !isSubForm && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Valor inicial (runtime)</Label>
                <VarPicker />
              </div>
              <Input
                value={config.initialValue || ""}
                onChange={(e) =>
                  onUpdate({ initialValue: e.target.value || undefined })
                }
                className="h-8 text-sm"
                placeholder="{{evento.nome}} ou valor fixo"
              />
              <p className="text-[9px] text-muted-foreground">
                Sobrepõe "Valor padrão" — suporta variáveis{" "}
                <code>{"{{evento.x}}"}</code>
              </p>
            </div>
          )}

          {/* Required — not applicable for field_array (controlled by minItems) or sub_form */}
          {!isFieldArray && !isSubForm && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="req"
                checked={config.required || false}
                onCheckedChange={(v) => onUpdate({ required: v === true })}
              />
              <Label htmlFor="req" className="text-xs cursor-pointer">
                Campo obrigatório
              </Label>
            </div>
          )}

          {/* isReadOnly / isDisabled */}
          {!isFieldArray && !isSubForm && !isLocked && !isFile && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="readonly"
                  checked={config.isReadOnly || false}
                  onCheckedChange={(v) =>
                    onUpdate({ isReadOnly: v === true || undefined })
                  }
                />
                <Label htmlFor="readonly" className="text-xs cursor-pointer">
                  Somente leitura
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="disabled"
                  checked={config.isDisabled || false}
                  onCheckedChange={(v) =>
                    onUpdate({ isDisabled: v === true || undefined })
                  }
                />
                <Label htmlFor="disabled" className="text-xs cursor-pointer">
                  Desabilitado
                </Label>
              </div>
            </div>
          )}

          {/* SLIDER config */}
          {isSlider && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Slider
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Mínimo</Label>
                    <Input
                      type="number"
                      value={config.minValue ?? 0}
                      onChange={(e) =>
                        onUpdate({ minValue: Number(e.target.value) })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Máximo</Label>
                    <Input
                      type="number"
                      value={config.maxValue ?? 100}
                      onChange={(e) =>
                        onUpdate({ maxValue: Number(e.target.value) })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Passo</Label>
                    <Input
                      type="number"
                      min={1}
                      value={config.step ?? 1}
                      onChange={(e) =>
                        onUpdate({ step: Number(e.target.value) })
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* RATING config */}
          {isRating && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Avaliação
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Número de estrelas</Label>
                  <Select
                    value={String(config.maxRating ?? 5)}
                    onValueChange={(v) => onUpdate({ maxRating: Number(v) })}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} estrelas
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* DATE_RANGE config */}
          {isDateRange && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Período
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Label da data inicial</Label>
                  <Input
                    value={config.dateRangeStartLabel ?? "Data inicial"}
                    onChange={(e) =>
                      onUpdate({ dateRangeStartLabel: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Label da data final</Label>
                  <Input
                    value={config.dateRangeEndLabel ?? "Data final"}
                    onChange={(e) =>
                      onUpdate({ dateRangeEndLabel: e.target.value })
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {!isFieldArray && <Separator />}

          {/* Validation — not applicable for field_array, terms, disabled or readonly */}
          {!isFieldArray && !isTerms && !isDisabledOrReadOnly && (
            <ValidationEditor
              fieldType={fieldType}
              validation={config.validation}
              onChange={(validation) => onUpdate({ validation })}
            />
          )}

          {/* Options */}
          {hasOptions && (
            <>
              <Separator />
              {/* Estilo visual — somente para radio */}
              {fieldType === "radio" && (
                <div className="space-y-1">
                  <Label className="text-xs">Estilo visual</Label>
                  <Select
                    value={config.visualStyle || "card"}
                    onValueChange={(v) =>
                      onUpdate({ visualStyle: v as "default" | "card" })
                    }
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card (padrão)</SelectItem>
                      <SelectItem value="default">Radio simples</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <OptionsEditor
                options={config.options || []}
                onChange={(options) => onUpdate({ options })}
              />
            </>
          )}

          {/* FIELD_ARRAY configuration */}
          {isFieldArray && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">
                  Lista de itens
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Mín. itens</Label>
                    <Input
                      type="number"
                      min={0}
                      value={config.minItems ?? ""}
                      onChange={(e) =>
                        onUpdate({
                          minItems: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Máx. itens</Label>
                    <Input
                      type="number"
                      min={0}
                      value={config.maxItems ?? ""}
                      onChange={(e) =>
                        onUpdate({
                          maxItems: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      className="h-8 text-sm"
                      placeholder="Sem limite"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Label do item</Label>
                  <Input
                    value={config.itemLabel || ""}
                    onChange={(e) =>
                      onUpdate({ itemLabel: e.target.value || undefined })
                    }
                    className="h-8 text-sm"
                    placeholder="Ex: Contato"
                  />
                  <p className="text-[9px] text-muted-foreground">
                    Prefixo exibido em cada item (ex: "Contato 1", "Contato 2")
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Label do botão adicionar</Label>
                  <Input
                    value={config.addLabel || ""}
                    onChange={(e) =>
                      onUpdate({ addLabel: e.target.value || undefined })
                    }
                    className="h-8 text-sm"
                    placeholder="Ex: Adicionar contato"
                  />
                </div>

                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Os sub-campos são configurados visualmente no canvas:
                    arraste campos da paleta para dentro da caixa laranja.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SUB_FORM configuration */}
          {isSubForm && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sub-formulário
                </h4>
                <div className="space-y-1">
                  <Label className="text-xs">Título do grupo (opcional)</Label>
                  <Input
                    value={config.subSchemaTitle || ""}
                    onChange={(e) =>
                      onUpdate({ subSchemaTitle: e.target.value || undefined })
                    }
                    className="h-8 text-sm"
                    placeholder="Ex: Endereço, Responsável..."
                  />
                </div>
                <SubFieldsEditor
                  subFields={config.subSchemaFields || []}
                  onChange={(subSchemaFields) => onUpdate({ subSchemaFields })}
                />
              </div>
            </>
          )}

          {/* Conditional — not applicable for disabled, readonly or terms */}
          {!isDisabledOrReadOnly && !isTerms && (
            <>
              <Separator />
              <ConditionEditor
                condition={config.condition}
                selectedId={selectedId}
                allFieldIds={allFieldIds}
                getFieldLabel={getFieldLabel}
                onChange={(condition) => onUpdate({ condition })}
              />
            </>
          )}

          {/* Cleared value — shown only when a condition is set */}
          {!isDisabledOrReadOnly && !isTerms && config.condition && (
            <div className="space-y-1">
              <Label className="text-xs">Valor ao ocultar (clearedValue)</Label>
              <Input
                value={config.clearedValue ?? ""}
                onChange={(e) =>
                  onUpdate({ clearedValue: e.target.value || undefined })
                }
                className="h-8 text-sm"
                placeholder="Deixar vazio = não limpar"
              />
              <p className="text-[9px] text-muted-foreground">
                Valor aplicado automaticamente quando o campo fica oculto.
              </p>
            </div>
          )}

          {/* resolvePropsKey — advanced */}
          {!isFieldArray && !isSubForm && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Resolver de props (avançado)
              </Label>
              <Input
                value={config.resolvePropsKey || ""}
                onChange={(e) =>
                  onUpdate({ resolvePropsKey: e.target.value || undefined })
                }
                className="h-8 text-xs font-mono"
                placeholder="chaveDoResolver"
              />
              <p className="text-[9px] text-muted-foreground">
                Registre este key em{" "}
                <code>{"RendererContext.fieldResolvers"}</code> para opções
                dinâmicas.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
