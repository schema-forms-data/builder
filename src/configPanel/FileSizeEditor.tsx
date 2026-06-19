/**
 * FileSizeEditor — Number input + unit (MB / GB) selector.
 * Stores and sends bytes; displays human-friendly units.
 */

import { useState, useEffect, useMemo } from "react";
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schema-forms-data/ui';

const MB = 1_048_576; // 2^20
const GB = 1_073_741_824; // 2^30

type Unit = "MB" | "GB";

interface FileSizeEditorProps {
  /** Value in bytes */
  value: number | undefined;
  /** Callback with value in bytes */
  onChange: (bytes: number | undefined) => void;
}

/** Determine best unit for display */
function deriveUnit(bytes: number): Unit {
  if (bytes >= GB && bytes % GB === 0) return "GB";
  return "MB";
}

/** Convert bytes to display value in the given unit */
function toDisplay(bytes: number, unit: Unit): number {
  return unit === "GB" ? bytes / GB : bytes / MB;
}

/** Convert display value to bytes */
function toBytes(display: number, unit: Unit): number {
  return Math.round(display * (unit === "GB" ? GB : MB));
}

export const FileSizeEditor = ({ value, onChange }: FileSizeEditorProps) => {
  const initialUnit = useMemo<Unit>(
    () => (value ? deriveUnit(value) : "MB"),
    // intentionally run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [unit, setUnit] = useState<Unit>(initialUnit);
  const [display, setDisplay] = useState<string>(
    value ? String(toDisplay(value, initialUnit)) : "",
  );

  // Sync from external value changes
  useEffect(() => {
    if (value === undefined) {
      setDisplay("");
      return;
    }
    const u = deriveUnit(value);
    setUnit(u);
    setDisplay(String(toDisplay(value, u)));
  }, [value]);

  const handleDisplayChange = (raw: string) => {
    setDisplay(raw);
    const num = parseFloat(raw);
    if (raw.trim() === "" || isNaN(num) || num <= 0) {
      onChange(undefined);
    } else {
      onChange(toBytes(num, unit));
    }
  };

  const handleUnitChange = (newUnit: Unit) => {
    setUnit(newUnit);
    const num = parseFloat(display);
    if (!isNaN(num) && num > 0) {
      onChange(toBytes(num, newUnit));
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px]">Tamanho máximo do arquivo</Label>
      <div className="flex gap-1.5">
        <Input
          type="number"
          min={0}
          step="any"
          value={display}
          onChange={(e) => handleDisplayChange(e.target.value)}
          placeholder="Ex: 10"
          className="h-8 text-xs flex-1"
        />
        <Select value={unit} onValueChange={(v) => handleUnitChange(v as Unit)}>
          <SelectTrigger className="w-[72px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MB">MB</SelectItem>
            <SelectItem value="GB">GB</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {value !== undefined && (
        <p className="text-[10px] text-muted-foreground">
          = {value.toLocaleString("pt-BR")} bytes
        </p>
      )}
    </div>
  );
};
