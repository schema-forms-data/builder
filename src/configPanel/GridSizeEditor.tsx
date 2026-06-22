/**
 * GridSizeEditor — Reusable component for grid size (tamanho) and position (inicioColuna).
 * Used by both ContainerConfig and FieldConfig.
 */

import { Label } from '@schema-forms-data/ui';
import { Slider } from '@schema-forms-data/ui';
import { cn } from '../utils/cn';

interface GridPositionPickerProps {
  inicioColuna: number;
  tamanho: number;
  onSelect: (col: number) => void;
}

export const GridPositionPicker = ({
  inicioColuna,
  tamanho,
  onSelect,
}: GridPositionPickerProps) => (
  <div className="space-y-2">
    <Label className="text-xs">Posição no grid</Label>
    <div className="flex gap-0.5">
      {Array.from({ length: 12 }, (_, i) => {
        const col = i + 1;
        const isOccupied = col >= inicioColuna && col < inicioColuna + tamanho;
        return (
          <button
            key={col}
            onClick={() => onSelect(col)}
            className={cn(
              "flex-1 h-6 rounded-sm text-[8px] font-mono transition-all border",
              isOccupied
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground/50 border-border/50 hover:bg-muted hover:border-border",
            )}
          >
            {col}
          </button>
        );
      })}
    </div>
    <p className="text-[9px] text-muted-foreground">
      Início: col {inicioColuna} · Span: {tamanho}
    </p>
  </div>
);

interface GridSizeEditorProps {
  tamanho: number;
  inicioColuna: number;
  defaultTamanho?: number;
  onTamanhoChange: (v: number) => void;
  onPositionChange: (col: number) => void;
}

export const GridSizeEditor = ({
  tamanho,
  inicioColuna,
  onTamanhoChange,
  onPositionChange,
}: GridSizeEditorProps) => {
  const maxTam = 13 - inicioColuna;

  return (
    <div className="space-y-3">
      {/* Tamanho slider */}
      <div className="space-y-2">
        <Label className="text-xs">Tamanho ({tamanho}/12 colunas)</Label>
        <Slider
          value={[tamanho]}
          onValueChange={([v]) => {
            const clamped = Math.min(v, maxTam);
            onTamanhoChange(clamped);
          }}
          min={1}
          max={maxTam}
          step={1}
          className="py-1"
        />
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>1</span>
          <span>3</span>
          <span>6</span>
          <span>9</span>
          <span>12</span>
        </div>
      </div>

      {/* Position picker */}
      <GridPositionPicker
        inicioColuna={inicioColuna}
        tamanho={tamanho}
        onSelect={(col) => {
          const newMaxTam = 13 - col;
          const newTam = Math.min(tamanho, newMaxTam);
          onPositionChange(col);
          if (newTam !== tamanho) onTamanhoChange(newTam);
        }}
      />
    </div>
  );
};
