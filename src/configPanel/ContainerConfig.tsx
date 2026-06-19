/**
 * ContainerConfig — Configuration panel for container items.
 * Includes the `columns` (1-4) control that was missing before.
 */

import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Checkbox } from '@schema-forms-data/ui';
import { IconPicker } from '@schema-forms-data/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@schema-forms-data/ui';
import { GridSizeEditor } from "./GridSizeEditor";
import type { ItemConfig } from "../types";
import { VarPicker } from "./VarPicker";

interface ContainerConfigProps {
  config: ItemConfig;
  onUpdate: (partial: Partial<ItemConfig>) => void;
}

export const ContainerConfig = ({ config, onUpdate }: ContainerConfigProps) => (
  <div className="space-y-4">
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

    {/* Description */}
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Descrição</Label>
        <VarPicker />
      </div>
      <Input
        value={config.description || ""}
        onChange={(e) => onUpdate({ description: e.target.value })}
        className="h-8 text-sm"
        placeholder="Descrição do container"
      />
    </div>

    {/* Icon */}
    <IconPicker
      value={config.icone}
      onChange={(name) => onUpdate({ icone: name })}
    />

    {/* Grid Size & Position */}
    <GridSizeEditor
      tamanho={config.tamanho || 12}
      inicioColuna={config.inicioColuna || 1}
      defaultTamanho={12}
      onTamanhoChange={(v) => onUpdate({ tamanho: v })}
      onPositionChange={(col) => onUpdate({ inicioColuna: col })}
    />

    {/* Internal columns (1-4) */}
    <div className="space-y-1">
      <Label className="text-xs">Colunas internas</Label>
      <Select
        value={String(config.columns || 2)}
        onValueChange={(v) => onUpdate({ columns: Number(v) as 1 | 2 | 3 | 4 })}
      >
        <SelectTrigger className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">1 coluna</SelectItem>
          <SelectItem value="2">2 colunas</SelectItem>
          <SelectItem value="3">3 colunas</SelectItem>
          <SelectItem value="4">4 colunas</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-[9px] text-muted-foreground">
        Grid interno simplificado para campos
      </p>
    </div>

    {/* Show label toggle */}
    <div className="flex items-center gap-2">
      <Checkbox
        id="show-label"
        checked={config.showLabel !== false}
        onCheckedChange={(v) => onUpdate({ showLabel: v === true })}
      />
      <Label htmlFor="show-label" className="text-xs cursor-pointer">
        Exibir label no formulário
      </Label>
    </div>

    {/* Show as card toggle */}
    <div className="flex items-center gap-2">
      <Checkbox
        id="show-as-card"
        checked={config.showAsCard || false}
        onCheckedChange={(v) => onUpdate({ showAsCard: v === true })}
      />
      <Label htmlFor="show-as-card" className="text-xs cursor-pointer">
        Exibir como card
      </Label>
    </div>
  </div>
);
