/**
 * VarPicker — Botão popover para variáveis de evento no ConfigPanel.
 *
 * Mostra todas as `EVENT_VARIABLES` disponíveis.
 * Ao clicar em uma variável, copia `{{evento.xxx}}` para o clipboard.
 * Ícone muda para "Copiado!" por 1.5s antes de resetar.
 */

import { useState } from "react";
import { Braces, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@schema-forms-data/ui';
import { Button } from '@schema-forms-data/ui';
import { cn } from '../utils/cn';
import { EVENT_VARIABLES } from "../constants";

interface VarPickerProps {
  /** Callback opcional para inserir a variável no campo em foco */
  onInsert?: (text: string) => void;
}

export const VarPicker = ({ onInsert }: VarPickerProps) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (key: string) => {
    const text = `{{${key}}}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback para ambientes sem clipboard API
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    if (onInsert) onInsert(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
          title="Inserir variável do evento"
        >
          <Braces className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        side="left"
        sideOffset={6}
      >
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-semibold text-foreground">
            Variáveis do evento
          </p>
          <p className="text-[10px] text-muted-foreground">
            Clique para copiar. Use{" "}
            <code className="bg-muted px-1 rounded text-[10px]">{`{{evento.xxx}}`}</code>{" "}
            em labels, placeholders e hints.
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {EVENT_VARIABLES.map((v) => {
            const isCopied = copiedKey === v.key;
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => handleCopy(v.key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-accent transition-colors",
                  isCopied && "bg-primary/10",
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{v.label}</p>
                  <code className="text-[10px] text-muted-foreground font-mono">{`{{${v.key}}}`}</code>
                </div>
                <div className="ml-2 shrink-0">
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Braces className="h-3 w-3 text-muted-foreground/50" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
