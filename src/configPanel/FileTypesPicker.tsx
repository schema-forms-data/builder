/**
 * FileTypesPicker — Multi-select list of file MIME types with tooltips.
 * User can toggle presets or type custom MIME types.
 */

import { useState, useMemo } from "react";
import { Search, FileType2, X, Info } from "lucide-react";
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
import { Badge } from '@schema-forms-data/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@schema-forms-data/ui';
import { ScrollArea } from '@schema-forms-data/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@schema-forms-data/ui';
import { Checkbox } from '@schema-forms-data/ui';
import {
  FILE_TYPE_PRESETS,
  ALL_FILE_TYPE_PRESETS,
  type FileTypePreset,
} from "./fileTypePresets";

interface FileTypesPickerProps {
  value: string[] | undefined;
  onChange: (types: string[] | undefined) => void;
}

export const FileTypesPicker = ({ value, onChange }: FileTypesPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customType, setCustomType] = useState("");

  const selected = useMemo(() => new Set(value ?? []), [value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return FILE_TYPE_PRESETS;
    const q = search.toLowerCase();
    return FILE_TYPE_PRESETS.map((cat) => ({
      ...cat,
      presets: cat.presets.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.value.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.presets.length > 0);
  }, [search]);

  const toggle = (preset: FileTypePreset) => {
    const set = new Set(value ?? []);
    if (preset.group) {
      // atalho de grupo: adiciona/remove todos os MIMEs do grupo
      const allSelected = preset.group.every((m) => set.has(m));
      if (allSelected) {
        preset.group.forEach((m) => set.delete(m));
      } else {
        preset.group.forEach((m) => set.add(m));
      }
    } else {
      if (set.has(preset.value)) {
        set.delete(preset.value);
      } else {
        set.add(preset.value);
      }
    }
    onChange(set.size > 0 ? Array.from(set) : undefined);
  };

  const addCustom = () => {
    const trimmed = customType.trim();
    if (!trimmed) return;
    const set = new Set(value ?? []);
    set.add(trimmed);
    onChange(Array.from(set));
    setCustomType("");
  };

  const removeType = (mime: string) => {
    const set = new Set(value ?? []);
    set.delete(mime);
    onChange(set.size > 0 ? Array.from(set) : undefined);
  };

  const getLabel = (mime: string) => {
    const found = ALL_FILE_TYPE_PRESETS.find((p) => p.value === mime);
    return found?.label ?? mime;
  };

  return (
    <div className="space-y-2">
      <Label className="text-[10px]">Tipos de arquivo aceitos</Label>

      {/* Selected tags */}
      {(value?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1">
          {value!.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="text-[10px] gap-1 pr-1"
            >
              {getLabel(t)}
              <button
                onClick={() => removeType(t)}
                className="hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Picker button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-8 text-xs justify-start gap-2"
          >
            <FileType2 className="h-3.5 w-3.5" />
            {(value?.length ?? 0) > 0
              ? `${value!.length} tipo(s) selecionado(s)`
              : "Selecionar tipos de arquivo..."}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[360px] p-0"
          side="left"
          align="start"
          sideOffset={8}
        >
          {/* Search */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs pl-7"
                placeholder="Buscar tipos (ex: PDF, imagem, vídeo)..."
                autoFocus
              />
            </div>
          </div>

          {/* Custom type input */}
          <div className="px-2 py-1.5 border-b flex gap-1">
            <Input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="h-7 text-xs font-mono flex-1"
              placeholder="Tipo customizado (ex: .dwg)"
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
            />
            <Button
              variant="secondary"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={addCustom}
              disabled={!customType.trim()}
            >
              Adicionar
            </Button>
          </div>

          {/* List */}
          <ScrollArea className="h-[320px]">
            <div className="p-1">
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  Nenhum tipo encontrado
                </p>
              )}
              {filtered.map((cat) => (
                <div key={cat.category} className="mb-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5 sticky top-0 bg-popover z-10">
                    {cat.category}
                  </p>
                  {cat.presets.map((preset) => {
                    const isGroupChecked = preset.group
                      ? preset.group.every((m) => selected.has(m))
                      : selected.has(preset.value);
                    const isGroupIndeterminate = preset.group
                      ? preset.group.some((m) => selected.has(m)) &&
                        !isGroupChecked
                      : false;
                    return (
                      <Tooltip key={preset.value}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggle(preset)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-accent transition-colors"
                          >
                            <Checkbox
                              checked={
                                isGroupIndeterminate
                                  ? "indeterminate"
                                  : isGroupChecked
                              }
                              className="h-3.5 w-3.5"
                              tabIndex={-1}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium">
                                {preset.label}
                              </span>
                              {!preset.group && (
                                <span className="text-[10px] text-muted-foreground font-mono ml-2">
                                  {preset.value}
                                </span>
                              )}
                              {preset.group && (
                                <span className="text-[10px] text-muted-foreground ml-2">
                                  {preset.group.length} tipos
                                </span>
                              )}
                            </div>
                            <Info className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-[250px] text-xs"
                        >
                          <p className="font-semibold mb-1">{preset.label}</p>
                          <p>{preset.description}</p>
                          {preset.group && (
                            <ul className="mt-1 space-y-0.5">
                              {preset.group.map((m) => (
                                <li
                                  key={m}
                                  className="font-mono text-[10px] opacity-80"
                                >
                                  {m}
                                </li>
                              ))}
                            </ul>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};
