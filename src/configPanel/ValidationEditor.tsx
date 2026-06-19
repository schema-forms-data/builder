/**
 * ValidationEditor — Validation settings for a field.
 * Shows only the sections relevant to the current field type.
 */

import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { RegexPicker } from "./RegexPicker";
import { FileTypesPicker } from "./FileTypesPicker";
import { FileSizeEditor } from "./FileSizeEditor";
import type { ItemValidation } from "../types";

interface ValidationEditorProps {
  fieldType: string;
  validation: ItemValidation | undefined;
  onChange: (validation: ItemValidation) => void;
}

/** Field types that support text-length constraints */
const TEXT_LIKE_TYPES = new Set([
  "texto",
  "textarea",
  "email",
  "password",
  "url",
  "phone",
  "tel",
  "cpf",
  "cnpj",
  "cep",
  "rg",
]);

export const ValidationEditor = ({
  fieldType,
  validation,
  onChange,
}: ValidationEditorProps) => {
  const updateVal = (key: keyof ItemValidation, raw: string) => {
    const numericKeys = [
      "minLength",
      "maxLength",
      "min",
      "max",
      "maxFileSize",
      "minAge",
      "maxAge",
    ] as const;
    const isNumeric = (numericKeys as readonly string[]).includes(key);
    const value = isNumeric
      ? raw
        ? Number(raw)
        : undefined
      : raw || undefined;
    onChange({ ...validation, [key]: value });
  };

  const isFile = fieldType === "file";
  const showTextLength = TEXT_LIKE_TYPES.has(fieldType);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase">
        Validação
      </h4>

      {/* Min/Max characters — only for text-like fields */}
      {showTextLength && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Min caracteres</Label>
            <Input
              type="number"
              min={0}
              value={validation?.minLength ?? ""}
              onChange={(e) => updateVal("minLength", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Max caracteres</Label>
            <Input
              type="number"
              min={0}
              value={validation?.maxLength ?? ""}
              onChange={(e) => updateVal("maxLength", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Min/Max value (number fields) */}
      {fieldType === "number" && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Valor mínimo</Label>
            <Input
              type="number"
              value={validation?.min ?? ""}
              onChange={(e) => updateVal("min", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Valor máximo</Label>
            <Input
              type="number"
              value={validation?.max ?? ""}
              onChange={(e) => updateVal("max", e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>
      )}

      {/* Date range (date/datetime fields) */}
      {(fieldType === "date" || fieldType === "datetime") && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Data mínima</Label>
              <Input
                type="date"
                value={validation?.minDate ?? ""}
                onChange={(e) => updateVal("minDate", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Data máxima</Label>
              <Input
                type="date"
                value={validation?.maxDate ?? ""}
                onChange={(e) => updateVal("maxDate", e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">Idade mínima (anos)</Label>
              <Input
                type="number"
                min={0}
                value={validation?.minAge ?? ""}
                onChange={(e) => updateVal("minAge", e.target.value)}
                className="h-7 text-xs"
                placeholder="ex: 18"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Idade máxima (anos)</Label>
              <Input
                type="number"
                min={0}
                value={validation?.maxAge ?? ""}
                onChange={(e) => updateVal("maxAge", e.target.value)}
                className="h-7 text-xs"
                placeholder="ex: 60"
              />
            </div>
          </div>
        </div>
      )}

      {/* File validation — types + size */}
      {isFile && (
        <div className="space-y-3">
          <FileTypesPicker
            value={validation?.fileTypes}
            onChange={(types) => onChange({ ...validation, fileTypes: types })}
          />
          <FileSizeEditor
            value={validation?.maxFileSize}
            onChange={(bytes) =>
              onChange({ ...validation, maxFileSize: bytes })
            }
          />
        </div>
      )}

      {/* Regex — not applicable for file fields */}
      {!isFile && (
        <RegexPicker
          value={validation?.regex ?? ""}
          message={validation?.regexMessage ?? ""}
          onChange={(regex, regexMessage) =>
            onChange({ ...validation, regex, regexMessage })
          }
        />
      )}
    </div>
  );
};
