/**
 * PreviewToolbar — Fill mock / Clear buttons + Template selector.
 */

import { Button } from '@schema-forms-data/ui';
import { FlaskConical, Eraser } from "lucide-react";
import { TemplateSelector } from "../TemplateSelector";

interface PreviewToolbarProps {
  onFillMock: () => void;
  onClear: () => void;
}

export const PreviewToolbar = ({
  onFillMock,
  onClear,
}: PreviewToolbarProps) => (
  <div className="flex items-center justify-between gap-2">
    <TemplateSelector />
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onFillMock}>
        <FlaskConical className="w-3.5 h-3.5 mr-1" />
        Preencher mock
      </Button>
      <Button variant="ghost" size="sm" onClick={onClear}>
        <Eraser className="w-3.5 h-3.5 mr-1" />
        Limpar
      </Button>
    </div>
  </div>
);
