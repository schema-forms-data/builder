/**
 * StepProgress — Step indicator bar with progress and numbered circles.
 */

import { Progress } from '@schema-forms-data/ui';
import { Check } from "lucide-react";
import { cn } from '../utils/cn';

interface StepInfo {
  id: string;
  label: string;
}

interface StepProgressProps {
  steps: StepInfo[];
  currentStep: number;
}

export const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  const totalSteps = steps.length;
  if (totalSteps <= 1) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-3">
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
              i === currentStep
                ? "bg-primary text-primary-foreground"
                : i < currentStep
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
