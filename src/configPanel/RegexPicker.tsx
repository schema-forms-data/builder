/**
 * RegexPicker — Click to open a searchable list of 100+ regex presets.
 * User can pick a preset or type a custom regex.
 */

import { useState, useMemo } from "react";
import { Search, Regex, ChevronRight, X } from "lucide-react";
import { Input } from '@schema-forms-data/ui';
import { Label } from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
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
import { Badge } from '@schema-forms-data/ui';
import { REGEX_PRESETS, ALL_REGEX_PRESETS } from "./regexPresets";
import type { RegexPreset } from "./regexPresets";

interface RegexPickerProps {
  value: string | undefined;
  message: string | undefined;
  onChange: (regex: string | undefined, message: string | undefined) => void;
}

export const RegexPicker = ({ value, message, onChange }: RegexPickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return REGEX_PRESETS;
    const q = search.toLowerCase();
    return REGEX_PRESETS.map((cat) => ({
      ...cat,
      presets: cat.presets.filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.pattern.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.presets.length > 0);
  }, [search]);

  const currentPreset = useMemo<RegexPreset | undefined>(
    () =>
      value ? ALL_REGEX_PRESETS.find((p) => p.pattern === value) : undefined,
    [value],
  );

  const handleSelect = (preset: RegexPreset) => {
    onChange(preset.pattern, `${preset.label}: formato inválido`);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[10px]">Regex</Label>

      {/* Current value display */}
      <div className="flex items-center gap-1">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || undefined, message)}
          className="h-7 text-xs font-mono flex-1"
          placeholder="Clique no botão ou digite..."
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-7 w-7 shrink-0">
              <Regex className="h-3.5 w-3.5" />
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
                  placeholder="Buscar regex (ex: CPF, e-mail, senha)..."
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <ScrollArea className="h-[360px]">
              <div className="p-1">
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Nenhum regex encontrado
                  </p>
                )}
                {filtered.map((cat) => (
                  <div key={cat.category} className="mb-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1.5 sticky top-0 bg-popover z-10">
                      {cat.category}
                    </p>
                    {cat.presets.map((preset) => (
                      <Tooltip key={preset.pattern + preset.label}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleSelect(preset)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-accent transition-colors group"
                          >
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-medium block truncate">
                                {preset.label}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono block truncate">
                                {preset.pattern}
                              </span>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="max-w-[250px] text-xs"
                        >
                          <p className="font-semibold mb-1">{preset.label}</p>
                          <p>{preset.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Preset badge */}
      {currentPreset && (
        <Badge variant="secondary" className="text-[10px] font-normal gap-1">
          <Regex className="h-2.5 w-2.5" />
          {currentPreset.label}
        </Badge>
      )}

      {/* Regex message */}
      <div className="space-y-1">
        <Label className="text-[10px]">Mensagem do regex</Label>
        <Input
          value={message ?? ""}
          onChange={(e) => onChange(value, e.target.value || undefined)}
          className="h-7 text-xs"
          placeholder="Formato inválido"
        />
      </div>
    </div>
  );
};
