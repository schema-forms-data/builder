import type { FieldType, FormStepConfig, MaskType } from '@schema-forms-data/core';

// ============================================
// Validation
// ============================================

export interface ItemValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: string;
  regexMessage?: string;
  minDate?: string;
  maxDate?: string;
  minAge?: number;          // minimum age (date/datetime)
  maxAge?: number;          // maximum age (date/datetime)
  fileTypes?: string[];     // e.g. ['image/png', 'image/jpeg']
  maxFileSize?: number;     // bytes
}

// ============================================
// Options & Conditions
// ============================================

export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type ConditionOperator =
  | 'igual'
  | 'diferente'
  | 'vazio'
  | 'naoVazio'
  | 'contem'
  | 'naoContem'
  | 'maiorQue'
  | 'menorQue'
  | 'maiorOuIgual'
  | 'menorOuIgual';

export interface ItemCondition {
  when: string;                        // campo ou evento a observar
  operator: ConditionOperator;
  value?: string;
  source?: 'campo' | 'evento';         // origin of the condition data
  logicOperator?: 'and' | 'or';        // como combinar com extraConditions
  extraConditions?: ItemCondition[];   // condições secundárias
}

// ============================================
// Item Config (generic for step/container/field)
// ============================================

export type ItemType = 'step' | 'container' | 'field';

export interface ItemConfig {
  label: string;
  name?: string;
  description?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  fieldType?: FieldType | string;
  defaultValue?: string;
  columns?: 1 | 2 | 3 | 4;
  tamanho?: number;               // 1-12 grid columns
  inicioColuna?: number;          // 1-12 grid column start position
  showLabel?: boolean;            // containers/steps: show label in final form
  showAsCard?: boolean;           // containers: render as card in preview
  descricao?: string;             // step/container: short description shown in header
  icone?: string;                 // step/container: lucide icon name
  mascara?: MaskType;               // mask type (cpf, telefone, cep, custom)
  mascaraCustom?: string;         // custom mask pattern
  validation?: ItemValidation;
  options?: FieldOption[];
  condition?: ItemCondition;
  /**
   * Flag de blocos pré-configurados.
   * Quando `true`, tipo, nome e ID do campo ficam desabilitados no painel de config.
   */
  locked?: boolean;
  /** Estilo visual do campo RADIO: 'card' (padrão) ou 'default' (radio simples) */
  visualStyle?: 'default' | 'card';
  // FIELD_ARRAY-specific
  subFields?: ItemConfig[];
  itemLabel?: string;
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  // SUB_FORM-specific
  subSchemaTitle?: string;
  subSchemaFields?: ItemConfig[];
  /** Texto dos termos (TERMS). Exibido em modal ao clicar "Ler termos". */
  termoTexto?: string;
  /** URL de um PDF dos termos (TERMS). Exibido via iframe ao clicar "Ler termos". Tem prioridade sobre termoTexto. */
  termoPdfUrl?: string;
  /** Upload ID de um PDF dos termos (TERMS). Tem prioridade sobre termoPdfUrl. Mututamente exclusivo com termoPdfUrl. */
  termoPdfUploadId?: string;
  /** Campo somente leitura — exibido mas não editável */
  isReadOnly?: boolean;
  /** Campo desabilitado — exibido mas não interativo */
  isDisabled?: boolean;
  /**
   * Valor aplicado ao campo quando ele se torna invisível por condicional.
   * Use string vazia `""` para limpar o valor.
   */
  clearedValue?: string;
  /**
   * Valor inicial resolvido em runtime.
   * Suporta template vars `{{evento.x}}`.
   * Tem prioridade sobre `defaultValue`.
   */
  initialValue?: string;
  /**
   * Chave de um resolver de props registrado em `RendererContext.fieldResolvers`.
   * Permite props dinâmicas (opções por API, disabled condicional, etc.).
   */
  resolvePropsKey?: string;
  /**
   * Array de validadores customizados (para `FormField.validate`).
   * Armazenados como `{ type: string, message?: string, ...params }`.
   * As funções são registradas em `RendererContext.validatorMapper`.
   */
  validate?: Array<{ type: string; message?: string;[key: string]: unknown }>;
  /**
   * Array de validadores de aviso (para `FormField.warn`).
   * Não bloqueiam o submit.
   */
  warn?: Array<{ type: string; message?: string;[key: string]: unknown }>;
  /** Passo do slider ou incremento do número */
  step?: number;
  /** Valor mínimo (slider) */
  minValue?: number;
  /** Valor máximo (slider) */
  maxValue?: number;
  /** Quantidade de estrelas para o campo rating (padrão: 5) */
  maxRating?: number;
  /** Label da data inicial do date_range */
  dateRangeStartLabel?: string;
  /** Label da data final do date_range */
  dateRangeEndLabel?: string;
}

// ============================================
// Builder State
// ============================================

export interface BuilderState {
  selectedId: string | null;
  configs: Record<string, ItemConfig>;
  showPreview: boolean;
  stepConfig?: FormStepConfig;  
}

// ============================================
// DnD State types (mirrors @data-driven-forms/dnd)
// ============================================

export interface DndContainerState {
  children: string[];
}

export interface DndState {
  containers: Record<string, DndContainerState>;
  components?: Record<string, unknown>;
  draggingElement?: string | null;
  [key: string]: unknown;
}

// ============================================
// History (Undo/Redo)
// ============================================

export interface BuilderSnapshot {
  dndState: DndState;
  configs: Record<string, ItemConfig>;
}

// ============================================
// Drag State types
// ============================================

export interface PositionDragState {
  itemId: string;
  ghostStart: number;
  ghostSpan: number;
  cursorX: number;
  cursorY: number;
}

export interface ReorderDragState {
  draggingId: string;
}
