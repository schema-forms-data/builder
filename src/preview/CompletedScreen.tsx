/**
 * CompletedScreen — Shown after form "submission" in preview mode.
 */

import { Button } from '@schema-forms-data/ui';
import { PartyPopper, RotateCcw } from "lucide-react";

interface CompletedScreenProps {
  onRestart: () => void;
}

export const CompletedScreen = ({ onRestart }: CompletedScreenProps) => (
  <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-16 space-y-4">
    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
      <PartyPopper className="w-8 h-8 text-primary" />
    </div>
    <h2 className="text-xl font-bold text-foreground">Formulário enviado!</h2>
    <p className="text-sm text-muted-foreground">
      Este é um preview simulado. Nenhum dado foi enviado.
    </p>
    <Button variant="outline" onClick={onRestart}>
      <RotateCcw className="w-4 h-4 mr-1" />
      Recomeçar
    </Button>
  </div>
);
