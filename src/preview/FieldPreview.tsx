/**
 * FieldPreview — Renders a single interactive field in the preview.
 * Fixed: checkbox_group now properly tracks state.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Checkbox } from '@schema-forms-data/ui';
import { Textarea } from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schema-forms-data/ui';
import { Badge } from '@schema-forms-data/ui';
import {
  Zap,
  AlertCircle,
  Plus,
  Trash2,
  CalendarCheck2,
  CalendarDays,
  Users,
  Info,
  Wallet,
  ScrollText,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../utils/cn";
import { getInputType } from "../utils/inputTypeMap";
import type { ItemConfig } from "../types";
import type { PreviewField } from "../utils/treeTraversal";
const formatCurrency = (centavos: number): string =>
  `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;

interface FieldPreviewProps {
  config: ItemConfig;
  fieldId: string;
  value: string;
  onChange: (v: string) => void;
  visible: boolean;
  error?: string;
  subFields?: PreviewField[];
  eventoData?: Record<string, string>;
  /** Todos os valores do form — usado por payment_method para ler tipo_participacao do step anterior */
  allValues?: Record<string, string>;
}

// ──────────────────────────────────────────────────────────────────────────────
// FieldArrayPreview
// ──────────────────────────────────────────────────────────────────────────────
const FieldArrayPreview = ({
  config,
  fieldId: _fieldId,
  subFields,
  tamanho,
  error,
  onChange,
  value,
}: {
  config: ItemConfig;
  fieldId: string;
  subFields: PreviewField[];
  tamanho: number;
  error?: string;
  onChange?: (v: string) => void;
  value?: string;
}) => {
  const minItems = config.minItems ?? 1;
  const maxItems = config.maxItems ?? 10;
  const itemLabel = config.itemLabel || "Item";
  const addLabel = config.addLabel || `Adicionar ${itemLabel}`;

  // Ref to track the last JSON value we reported to parent (avoids feedback loop)
  const lastReportedRef = useRef<string>(value || "");

  // Build an empty item from current sub-fields
  const emptyItem = useCallback(
    () => Object.fromEntries(subFields.map((sf) => [sf.id, ""])),
    [subFields],
  );

  // Initialize from value prop if available, otherwise 1 empty item
  const [items, setItems] = useState<Record<string, string>[]>(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [emptyItem()];
  });

  // Per-sub-field validation errors: key = "${itemIdx}.${sf.id}"
  const [sfErrors, setSfErrors] = useState<Record<string, string>>({});

  // Sync items when value changes externally (mock fill, clear form)
  useEffect(() => {
    if (value === lastReportedRef.current) return;
    lastReportedRef.current = value || "";
    if (!value) {
      setItems([emptyItem()]);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) setItems(parsed);
    } catch {}
  }, [value, emptyItem]);

  // Validate sub-fields when parent signals error (step submitted)
  useEffect(() => {
    if (!error) {
      setSfErrors({});
      return;
    }
    const errs: Record<string, string> = {};
    items.forEach((itemValues, idx) => {
      subFields.forEach((sf) => {
        const val = itemValues[sf.id] ?? "";
        if (sf.config.required && !val.trim()) {
          errs[`${idx}.${sf.id}`] = "Campo obrigatório";
        }
      });
    });
    setSfErrors(errs);
  }, [error, items, subFields]);

  const reportToParent = (nextItems: Record<string, string>[]) => {
    if (!onChange) return;
    const payload = nextItems.map((item) => {
      const obj: Record<string, string> = {};
      subFields.forEach((sf) => {
        obj[sf.id] = item[sf.id] ?? "";
      });
      return obj;
    });
    const json = JSON.stringify(payload);
    lastReportedRef.current = json;
    onChange(json);
  };

  const addItem = () => {
    if (items.length >= maxItems) return;
    const next = [...items, emptyItem()];
    setItems(next);
    reportToParent(next);
  };

  const removeItem = (idx: number) => {
    if (items.length <= minItems) return;
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    reportToParent(next);
  };

  const updateField = (itemIdx: number, sfId: string, val: string) => {
    const next = items.map((item, i) =>
      i === itemIdx ? { ...item, [sfId]: val } : item,
    );
    setItems(next);
    reportToParent(next);
    // Clear sub-field error on change
    setSfErrors((prev) => {
      const updated = { ...prev };
      delete updated[`${itemIdx}.${sfId}`];
      return updated;
    });
  };

  return (
    <div className="space-y-2" style={{ gridColumn: `span ${tamanho}` }}>
      {/* Campo label */}
      {config.label && (
        <Label className="text-sm font-medium">{config.label}</Label>
      )}

      <div className="space-y-3">
        {items.map((itemValues, idx) => (
          <div
            key={idx}
            className="rounded-xl border bg-card p-4 space-y-3 shadow-sm"
          >
            {/* Item header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold">
                  {itemLabel} {idx + 1}
                </span>
              </div>
              {items.length > minItems && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive/60 hover:text-destructive"
                  onClick={() => removeItem(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sub-fields */}
            {subFields.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Sem sub-campos configurados
              </p>
            ) : (
              <div className="grid grid-cols-12 gap-3">
                {subFields.map((sf) => {
                  const sfType = sf.config.fieldType || "texto";
                  const sfSpan = sf.config.tamanho || 6;
                  const sfVal = itemValues[sf.id] ?? "";
                  const setVal = (v: string) => updateField(idx, sf.id, v);
                  const sfErr = sfErrors[`${idx}.${sf.id}`];
                  return (
                    <div
                      key={sf.id}
                      className="space-y-1"
                      style={{ gridColumn: `span ${sfSpan}` }}
                    >
                      <Label className="text-xs font-medium">
                        {sf.config.label}
                        {sf.config.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </Label>
                      {sfType === "textarea" ? (
                        <Textarea
                          placeholder={sf.config.placeholder}
                          className={
                            sfErr ? "text-sm border-destructive" : "text-sm"
                          }
                          value={sfVal}
                          onChange={(e) => setVal(e.target.value)}
                        />
                      ) : sfType === "select" ? (
                        <Select value={sfVal} onValueChange={setVal}>
                          <SelectTrigger
                            className={
                              sfErr ? "text-sm border-destructive" : "text-sm"
                            }
                          >
                            <SelectValue
                              placeholder={
                                sf.config.placeholder || "Selecione..."
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {(sf.config.options || []).map((opt, oi) => (
                              <SelectItem
                                key={`${oi}-${opt.value}`}
                                value={opt.value || `__opt_${oi}`}
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : sfType === "checkbox" ? (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={sfVal === "true"}
                            onCheckedChange={(v) => setVal(v ? "true" : "")}
                          />
                          <span className="text-sm text-muted-foreground">
                            {sf.config.placeholder || sf.config.label}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={getInputType(sfType)}
                          placeholder={sf.config.placeholder}
                          className={
                            sfErr ? "text-sm border-destructive" : "text-sm"
                          }
                          value={sfVal}
                          onChange={(e) => setVal(e.target.value)}
                        />
                      )}
                      {sfErr && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          {sfErr}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500 font-semibold"
        onClick={addItem}
        disabled={items.length >= maxItems}
      >
        <Plus className="h-4 w-4 mr-2" />
        {addLabel}
      </Button>

      {/* Hint / max info */}
      {config.maxItems && (
        <p className="text-xs text-center text-muted-foreground">
          Máximo de {config.maxItems} {(itemLabel || "item").toLowerCase()}
          {config.maxItems !== 1 ? "s" : ""}
        </p>
      )}
      {!config.maxItems && config.hint && (
        <p className="text-xs text-muted-foreground">{config.hint}</p>
      )}

      {/* Root error (e.g. mínimo de itens) */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────
// FieldPreview
// ──────────────────────────────────────────────────────────────────────────────
export const FieldPreview = ({
  config,
  fieldId,
  value,
  onChange,
  visible,
  error,
  subFields,
  eventoData,
  allValues,
}: FieldPreviewProps) => {
  const fieldType = config.fieldType || "texto";
  const tamanho = config.tamanho || 6;
  const isReadOnly = config.isReadOnly ?? false;
  const isDisabled = config.isDisabled ?? false;

  if (!visible) return null;

  // FIELD_ARRAY — render interactive list preview
  if (fieldType === "field_array") {
    return (
      <FieldArrayPreview
        config={config}
        fieldId={fieldId}
        subFields={subFields ?? []}
        tamanho={tamanho}
        error={error}
        onChange={onChange}
        value={value}
      />
    );
  }

  const errorClass = error ? "border-destructive" : "";

  return (
    <div
      className={cn(
        "space-y-1",
        isDisabled && "opacity-50 pointer-events-none",
      )}
      style={{
        gridColumn: config.inicioColuna
          ? `${config.inicioColuna} / span ${tamanho}`
          : `span ${tamanho}`,
      }}
    >
      {/* Label — oculto para "terms" pois o label já aparece dentro do card */}
      {fieldType !== "terms" && (
        <div className="flex items-center gap-1">
          <Label className="text-sm font-medium">
            {config.label}
            {config.required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          {config.condition && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 border-amber-500/50 text-amber-600"
            >
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              cond
            </Badge>
          )}
        </div>
      )}

      {/* Field body */}
      {fieldType === "textarea" ? (
        <Textarea
          placeholder={config.placeholder}
          className={cn("text-sm", errorClass)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isReadOnly}
          disabled={isDisabled}
        />
      ) : fieldType === "select" ? (
        <Select
          value={value}
          onValueChange={onChange}
          disabled={isDisabled || isReadOnly}
        >
          <SelectTrigger className={cn("text-sm", errorClass)}>
            <SelectValue placeholder={config.placeholder || "Selecione..."} />
          </SelectTrigger>
          <SelectContent>
            {(config.options || []).map((opt, i) => (
              <SelectItem
                key={`${i}-${opt.value}`}
                value={opt.value || `__opt_${i}`}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : fieldType === "checkbox" ? (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value === "true"}
            onCheckedChange={(v) => onChange(v ? "true" : "")}
            disabled={isDisabled || isReadOnly}
          />
          <span className="text-sm text-muted-foreground">
            {config.placeholder || config.label}
          </span>
        </div>
      ) : fieldType === "checkbox_group" ? (
        <CheckboxGroupField
          config={config}
          value={value}
          onChange={onChange}
          disabled={isDisabled || isReadOnly}
        />
      ) : fieldType === "radio" ? (
        <div className="space-y-2">
          {(config.options || [{ value: "1", label: "Opção 1" }]).map(
            (opt, i) =>
              config.visualStyle === "default" ? (
                <div
                  key={`${i}-${opt.value}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    readOnly
                    checked={value === opt.value}
                    disabled={isDisabled}
                    className="accent-orange-500"
                  />
                  <span className="text-sm">{opt.label}</span>
                </div>
              ) : (
                <div
                  key={`${i}-${opt.value}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all bg-card border-border",
                    !isReadOnly && !isDisabled && "cursor-pointer",
                  )}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={value === opt.value}
                    disabled={isDisabled}
                    className="accent-orange-500"
                  />
                  <span className="text-sm flex-1">{opt.label}</span>
                </div>
              ),
          )}
        </div>
      ) : fieldType === "participation_type" ? (
        (() => {
          const valor = parseInt(eventoData?.["evento.valor"] ?? "0") || 0;
          const valorPorDia =
            parseInt(eventoData?.["evento.valorPorDia"] ?? "0") || 0;
          const vagasTotal = eventoData?.["evento.vagasTotal"];
          const vagasPorDia = eventoData?.["evento.vagasPorDia"];
          const vagasMasculinas = eventoData?.["evento.vagasMasculinas"];
          const vagasFemininas = eventoData?.["evento.vagasFemininas"];
          const mostraGenero =
            !!(vagasMasculinas && Number(vagasMasculinas) > 0) &&
            !!(vagasFemininas && Number(vagasFemininas) > 0);
          const inicio = eventoData?.["evento.dataInicioEvento"];
          const fim = eventoData?.["evento.dataFimEvento"];

          const formatDate = (iso?: string) =>
            iso
              ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4)
              : "—";
          const periodo =
            inicio && fim
              ? `${formatDate(inicio)} a ${formatDate(fim)}`
              : "Período do evento";
          const totalDias =
            inicio && fim
              ? Math.round(
                  (new Date(fim.slice(0, 10) + "T00:00:00Z").getTime() -
                    new Date(inicio.slice(0, 10) + "T00:00:00Z").getTime()) /
                    86400000,
                ) + 1
              : 0;
          const multiDia = totalDias > 1;

          // Parse current selection from value (JSON string)
          let current: {
            tipo?: string;
            data?: string | null;
            genero?: string | null;
          } = {};
          try {
            current = value ? JSON.parse(value) : {};
          } catch {
            /* empty */
          }
          const tipoAtual = current.tipo ?? null;
          const diaAtual = current.data ?? null;
          const generoAtual = current.genero ?? null;

          const selectTipo = (tipo: string) =>
            onChange(
              JSON.stringify({
                tipo,
                data: null,
                ...(mostraGenero ? { genero: generoAtual } : {}),
              }),
            );
          const selectDia = (data: string) =>
            onChange(
              JSON.stringify({
                tipo: "por_dia",
                data,
                ...(mostraGenero ? { genero: generoAtual } : {}),
              }),
            );
          const selectGenero = (genero: string) =>
            onChange(
              JSON.stringify({ tipo: tipoAtual, data: diaAtual, genero }),
            );

          // Gera dias do evento
          const dias: string[] = [];
          if (multiDia && inicio && fim) {
            const cur = new Date(inicio.slice(0, 10) + "T00:00:00Z");
            const end = new Date(fim.slice(0, 10) + "T00:00:00Z");
            let g = 0;
            while (cur <= end && g++ < 60) {
              dias.push(cur.toISOString().slice(0, 10));
              cur.setUTCDate(cur.getUTCDate() + 1);
            }
          }
          const formatDia = (iso: string) => {
            const [y, m, d] = iso.split("-").map(Number);
            const date = new Date(Date.UTC(y, m - 1, d));
            const dd = String(d).padStart(2, "0");
            const mm = String(m).padStart(2, "0");
            const wd = new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              timeZone: "UTC",
            }).format(date);
            return `${dd}/${mm} — ${wd.charAt(0).toUpperCase()}${wd.slice(1)}`;
          };

          return (
            <div className="space-y-2">
              {/* Seleção de sexo — só aparece se AMBOS os gêneros têm vagas */}
              {mostraGenero && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs text-muted-foreground shrink-0">
                    Você é:
                  </span>
                  <div className="flex gap-2">
                    {(["masculino", "feminino"] as const).map((val) => {
                      const lbl =
                        val === "masculino" ? "Masculino" : "Feminino";
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => selectGenero(val)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                            generoAtual === val
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/60",
                          )}
                        >
                          {lbl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Card: todos os dias */}
              <button
                type="button"
                onClick={() => selectTipo("todos_os_dias")}
                className={cn(
                  "w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all bg-card",
                  tipoAtual === "todos_os_dias"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 p-2 rounded-lg shrink-0",
                    tipoAtual === "todos_os_dias"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <CalendarCheck2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">
                    Participar todos os dias
                  </p>
                  <p className="text-xs text-muted-foreground">{periodo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      tipoAtual === "todos_os_dias"
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {valor > 0 ? formatCurrency(valor) : "R$ —,—"}
                  </p>
                  {vagasTotal && (
                    <p className="text-xs text-emerald-500 flex items-center justify-end gap-1">
                      <Users className="w-3 h-3" />
                      {vagasTotal} vagas
                    </p>
                  )}
                </div>
              </button>

              {/* Card: participar um dia */}
              {multiDia ? (
                <button
                  type="button"
                  onClick={() => selectTipo("por_dia")}
                  className={cn(
                    "w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition-all bg-card",
                    tipoAtual === "por_dia"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 p-2 rounded-lg shrink-0",
                      tipoAtual === "por_dia"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Participar um dia</p>
                    <p className="text-xs text-muted-foreground">
                      Escolha o dia desejado
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        tipoAtual === "por_dia"
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {valorPorDia > 0 ? formatCurrency(valorPorDia) : "R$ —,—"}
                    </p>
                    {vagasPorDia && (
                      <p className="text-xs text-emerald-500 flex items-center justify-end gap-1">
                        <Users className="w-3 h-3" />
                        {vagasPorDia} vagas/dia
                      </p>
                    )}
                  </div>
                </button>
              ) : inicio ? (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Evento de 1 dia — a opção &quot;Participar um dia&quot; não
                    é exibida.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card opacity-40">
                  <div className="mt-0.5 p-2 rounded-lg shrink-0 bg-muted text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Participar um dia</p>
                    <p className="text-xs text-muted-foreground italic">
                      Visível se evento tiver 2+ dias
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">R$ —,—</p>
                  </div>
                </div>
              )}

              {/* Sub-seleção de dias */}
              {tipoAtual === "por_dia" && dias.length > 0 && (
                <div className="pl-2 space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                    Selecione o dia:
                  </p>
                  {dias.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => selectDia(iso)}
                      className={cn(
                        "w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border transition-all",
                        diaAtual === iso
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                            diaAtual === iso
                              ? "border-primary bg-primary"
                              : "border-muted-foreground",
                          )}
                        >
                          {diaAtual === iso && (
                            <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </span>
                        <span className="text-sm">{formatDia(iso)}</span>
                      </div>
                      {vagasPorDia && (
                        <span className="text-xs text-emerald-500">
                          {vagasPorDia} vagas
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()
      ) : fieldType === "payment_method" ? (
        (() => {
          const TAXA_CARTAO_DIA = 0.0315;
          const TAXA_CARTAO_TODOS = 0.124;

          // Lê tipo_participacao do step anterior (ID fixo do campo locked)
          const partRaw = allValues?.["_participation_type_field"] ?? "";
          let partValue: { tipo?: string | null; data?: string | null } = {};
          try {
            partValue = partRaw ? JSON.parse(partRaw) : {};
          } catch {
            /* */
          }
          const tipoPart = partValue.tipo ?? null;

          const valorEvento = Number(eventoData?.["evento.valor"] ?? 0) || 0;
          const valorPorDia =
            Number(eventoData?.["evento.valorPorDia"] ?? 0) || 0;
          const valorBase =
            tipoPart === "por_dia" && valorPorDia > 0
              ? valorPorDia
              : valorEvento;

          const tipoLabel =
            tipoPart === "por_dia"
              ? (() => {
                  if (!partValue.data) return "Um dia";
                  const [y, m, d] = (partValue.data as string).split("-");
                  return `${d}/${m}/${y}`;
                })()
              : "Todos os dias";

          type Opcao = {
            id: string;
            label: string;
            desc: string;
            taxa: number;
            parcelas: number;
            taxaLabel?: string;
          };
          const opcoes: Opcao[] =
            tipoPart === "por_dia"
              ? [
                  {
                    id: "pix",
                    label: "PIX",
                    desc: "Transferência instantânea (à vista)",
                    taxa: 0,
                    parcelas: 0,
                  },
                  {
                    id: "dinheiro",
                    label: "Dinheiro",
                    desc: "Pagamento em espécie",
                    taxa: 0,
                    parcelas: 0,
                  },
                  {
                    id: "cartao",
                    label: "Cartão de Crédito",
                    desc: "Débito ou crédito na maquininha",
                    taxa: TAXA_CARTAO_DIA,
                    parcelas: 0,
                    taxaLabel: `Taxa InfinityPay: ${(TAXA_CARTAO_DIA * 100).toFixed(2).replace(".", ",")}%`,
                  },
                ]
              : [
                  {
                    id: "pix",
                    label: "PIX à Vista",
                    desc: "Pagamento instantâneo sem parcelamento",
                    taxa: 0,
                    parcelas: 0,
                  },
                  {
                    id: "pix_parcelado",
                    label: "PIX Parcelado",
                    desc: "Parcelado em até 7x sem juros",
                    taxa: 0,
                    parcelas: 7,
                  },
                  {
                    id: "cartao",
                    label: "Cartão de Crédito",
                    desc: "Parcelado em até 12x",
                    taxa: TAXA_CARTAO_TODOS,
                    parcelas: 12,
                    taxaLabel: `Taxa InfinityPay: ${(TAXA_CARTAO_TODOS * 100).toFixed(2).replace(".", ",")}%`,
                  },
                  {
                    id: "dinheiro",
                    label: "Dinheiro",
                    desc: "Pagamento em espécie",
                    taxa: 0,
                    parcelas: 0,
                  },
                ];

          let current: { metodo?: string } = {};
          try {
            current = value ? JSON.parse(value) : {};
          } catch {
            /* */
          }
          const metodoAtual = current.metodo ?? null;

          const selecionar = (opcao: Opcao) => {
            const valorTotal =
              Math.round(valorBase * (1 + opcao.taxa) * 100) / 100;
            const update: Record<string, unknown> = {
              metodo: opcao.id,
              valorTotal,
            };
            if (opcao.parcelas > 1) update.parcelas = opcao.parcelas;
            onChange(JSON.stringify(update));
          };

          return (
            <div className="space-y-4">
              {/* Resumo da participação */}
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Tipo de participação
                  </p>
                  <p className="font-semibold">{tipoLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Valor base</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(valorBase)}
                  </p>
                </div>
              </div>

              {/* Aviso */}
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
                <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200">
                  <span className="font-bold text-amber-400">Importante:</span>{" "}
                  Para validar a inscrição e garantir sua vaga, o pagamento deve
                  ser realizado no ato da inscrição.
                </p>
              </div>

              <p className="text-sm font-semibold text-primary">
                Selecione a forma de pagamento:
              </p>

              {/* Cards */}
              <div className="space-y-3">
                {opcoes.map((opcao) => {
                  const selecionado = metodoAtual === opcao.id;
                  const valorTotal =
                    Math.round(valorBase * (1 + opcao.taxa) * 100) / 100;
                  const temParcelas = opcao.parcelas > 1;
                  const valorParcela = temParcelas
                    ? Math.round((valorTotal / opcao.parcelas) * 100) / 100
                    : null;
                  return (
                    <button
                      key={opcao.id}
                      type="button"
                      onClick={() => selecionar(opcao)}
                      className={cn(
                        "w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all bg-card",
                        selecionado
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                          selecionado ? "bg-primary/20" : "bg-muted",
                        )}
                      >
                        <Wallet
                          className={cn(
                            "h-5 w-5",
                            selecionado
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">
                          {opcao.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {opcao.desc}
                        </p>
                        {opcao.taxaLabel && (
                          <p className="text-xs text-amber-400 mt-0.5">
                            * {opcao.taxaLabel}
                          </p>
                        )}
                        {opcao.taxa > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Total com taxa: {formatCurrency(valorTotal)}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {temParcelas ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {opcao.parcelas}x de
                            </p>
                            <p className="text-base font-bold text-primary">
                              {formatCurrency(valorParcela!)}
                            </p>
                          </>
                        ) : (
                          <p className="text-base font-bold text-primary">
                            {formatCurrency(valorTotal)}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()
      ) : fieldType === "terms" ? (
        (() => {
          const isAccepted = value === "accepted";
          const termoTexto = config.termoTexto;
          const termoPdfUrl = config.termoPdfUrl;
          const hasPdfUploaded = !!config.termoPdfUploadId;
          const hasContent = !!(termoTexto || termoPdfUrl || hasPdfUploaded);
          return (
            <div
              className={cn(
                "rounded-lg border p-4 space-y-4 transition-colors",
                isAccepted
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-border bg-muted/30",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">
                    {config.label || "Termos e condições"}
                  </span>
                </div>
                {hasContent ? (
                  <div className="flex items-center gap-1.5">
                    {hasPdfUploaded && (
                      <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium border border-green-500/40 bg-green-500/10 rounded px-1.5 py-0.5">
                        PDF enviado ✓
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => {
                        /* preview: sem ação real */
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ler termos
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Conteúdo não configurado
                  </span>
                )}
              </div>

              {/* Linha de aceite */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={isAccepted}
                  onCheckedChange={(v) => onChange(v ? "accepted" : "")}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug flex-1">
                  Li e aceito{" "}
                  {config.label ? `"${config.label}"` : "os termos e condições"}
                </span>
                {isAccepted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                )}
              </label>
            </div>
          );
        })()
      ) : fieldType === "file" ? (
        <Input
          type="file"
          className={cn("text-sm", errorClass)}
          disabled={isDisabled || isReadOnly}
        />
      ) : fieldType === "hidden" ? (
        <p className="text-xs text-muted-foreground italic">Campo oculto</p>
      ) : (
        <Input
          type={getInputType(fieldType)}
          placeholder={config.placeholder}
          className={cn("text-sm", errorClass)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isReadOnly}
          disabled={isDisabled}
        />
      )}

      {/* Error / Hint */}
      {error ? (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : config.hint ? (
        <p className="text-xs text-muted-foreground">{config.hint}</p>
      ) : null}
    </div>
  );
};

/**
 * Fix: checkbox_group now properly tracks checked items as comma-separated string.
 * The original code had stateless checkboxes (no onChange).
 */
const CheckboxGroupField = ({
  config,
  value,
  onChange,
  disabled: groupDisabled,
}: {
  config: ItemConfig;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => {
  const selected = new Set(value ? value.split(",") : []);
  const options = config.options?.length
    ? config.options
    : [{ value: "1", label: "Opção 1" }];

  const toggle = (optValue: string) => {
    if (groupDisabled) return;
    const next = new Set(selected);
    if (next.has(optValue)) next.delete(optValue);
    else next.add(optValue);
    onChange(Array.from(next).join(","));
  };

  return (
    <div className="space-y-1">
      {options.map((opt, i) => (
        <div key={`${i}-${opt.value}`} className="flex items-center gap-2">
          <Checkbox
            checked={selected.has(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            disabled={opt.disabled || groupDisabled}
          />
          <span className="text-sm">{opt.label}</span>
        </div>
      ))}
    </div>
  );
};
