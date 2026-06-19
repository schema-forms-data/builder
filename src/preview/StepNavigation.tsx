/**
 * StepNavigation — Back / Next / Finish buttons.
 */

import { Button } from '@schema-forms-data/ui';
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const StepNavigation = ({
  currentStep,
  isLastStep,
  onBack,
  onNext,
}: StepNavigationProps) => (
  <div className="flex items-center justify-between gap-4">
    <Button variant="outline" onClick={onBack} disabled={currentStep === 0}>
      <ChevronLeft className="w-4 h-4 mr-1" />
      Voltar
    </Button>
    <Button onClick={onNext}>
      {isLastStep ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Finalizar
        </>
      ) : (
        <>
          <ChevronRight className="w-4 h-4 mr-1" />
          Próximo
        </>
      )}
    </Button>
  </div>
);
