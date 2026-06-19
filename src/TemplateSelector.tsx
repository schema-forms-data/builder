/**
 * TemplateSelector — Seletor de template visual para o preview do FormBuilder.
 *
 * Exibe um Popover com cards de todos os templates disponíveis.
 * Ao selecionar, chama setPreviewTemplateId do BuilderContext.
 */

import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from '@schema-forms-data/ui';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@schema-forms-data/ui';
import { cn } from './utils/cn';
import { useBuilder } from "./BuilderContext";
import { TEMPLATE_REGISTRY } from '@schema-forms-data/templates';
import { isDarkTemplate } from '@schema-forms-data/templates';

// Badge textual
const STYLE_BADGE: Record<string, string> = {
  glassmorphism: "Glass",
  card: "Card",
  flat: "Flat",
  bordered: "Bordered",
};

export const TemplateSelector = () => {
  const { previewTemplateId, setPreviewTemplateId } = useBuilder();
  const [open, setOpen] = useState(false);

  const templates = Object.values(TEMPLATE_REGISTRY);
  const active = TEMPLATE_REGISTRY[previewTemplateId];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          title="Selecionar template visual"
        >
          {/* Color swatch */}
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
            style={{ background: active?.colors.primary ?? "#3b82f6" }}
          />
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {active?.displayName ?? "Template"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-80 p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Template de Preview
        </p>

        <div className="grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-0.5">
          {templates.map((t) => {
            const isSelected = t.id === previewTemplateId;
            const isDark = isDarkTemplate(t);
            const styleBadge = STYLE_BADGE[t.layout.containerStyle] ?? "";

            return (
              <button
                key={t.id}
                onClick={() => {
                  setPreviewTemplateId(t.id);
                  setOpen(false);
                }}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 rounded-lg p-2 border text-center transition-all hover:scale-[1.02]",
                  isSelected
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-muted-foreground/40",
                )}
              >
                {/* Mini preview swatch */}
                <div
                  className="w-full h-8 rounded-md flex items-center justify-center gap-0.5"
                  style={{
                    background:
                      t.colors.background.startsWith("#") ||
                      t.colors.background.startsWith("rgba")
                        ? t.colors.background
                        : undefined,
                  }}
                  data-muted={
                    !t.colors.background.startsWith("#") &&
                    !t.colors.background.startsWith("rgba")
                      ? "true"
                      : undefined
                  }
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: t.colors.primary,
                    }}
                  />
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: t.colors.accent,
                    }}
                  />
                </div>

                <span className="text-[10px] font-medium leading-tight line-clamp-2">
                  {t.displayName}
                </span>

                <div className="flex items-center gap-0.5 flex-wrap justify-center">
                  {isDark && (
                    <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-300">
                      dark
                    </span>
                  )}
                  {styleBadge && (
                    <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">
                      {styleBadge}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
