/**
 * schemaConverter — Cleaned version.
 *
 * Changes from original:
 * 1. Removed duplicate DndContainerState / DndState — imports from ./types.
 * 2. Removed duplicate getItemType — imports from ./constants.
 * 3. Preserves mascara, mascaraCustom, defaultValue in both directions.
 * 4. Preserves FieldOption.disabled in both directions.
 * 5. Preserves date/file validation fields (minDate, maxDate, fileTypes, maxFileSize).
 * 6. Added validateBuilderIntegrity() for pre-save JSON integrity checks.
 */

import type { ItemConfig, DndState, ItemCondition } from './types';
import { getItemType } from './constants';
import type {
  FormSchema,
  FormStep,
  FormContainer,
  FormField,
  FormSchemaStatus,
  FieldConditional,
  FieldConditionalExpr,
  FormStepConfig,
} from '@schema-forms-data/core';
import { FieldType, MaskType } from '@schema-forms-data/core';
// ── Helpers para conversão bidirecional de condicionais ──────────────────

const leafToItemCondition = (leaf: FieldConditional): ItemCondition => ({
  when: leaf.campoId,
  operator: leaf.operador,
  value: leaf.valor as string | undefined,
  source: leaf.source,
});

const itemConditionToExpr = (cond: ItemCondition): FieldConditionalExpr => {
  const main: FieldConditional = {
    campoId: cond.when,
    operador: cond.operator,
    valor: cond.value,
    source: cond.source,
  };
  if (cond.logicOperator && cond.extraConditions?.length) {
    const extras = cond.extraConditions.map(
      (ec): FieldConditional => ({
        campoId: ec.when,
        operador: ec.operator,
        valor: ec.value,
        source: ec.source,
      }),
    );
    const all: FieldConditionalExpr[] = [main, ...extras];
    return cond.logicOperator === 'or' ? { or: all } : { and: all };
  }
  return main;
};

const exprToItemCondition = (expr: FieldConditionalExpr): ItemCondition | undefined => {
  if ('campoId' in expr) return leafToItemCondition(expr);
  // Grupo AND/OR
  const items = (('and' in expr ? expr.and : expr.or) ?? []) as FieldConditionalExpr[];
  if (items.length === 0) return undefined;
  const logicOp = 'and' in expr ? ('and' as const) : ('or' as const);
  const [first, ...rest] = items;
  if (!('campoId' in first)) {
    // O editor visual não suporta grupos aninhados — emite aviso e descarta a condicional
    console.warn(
      '[formSchemaToBuilder] Condicional com grupo aninhado detectada — não suportado no editor visual. A condicional será removida.',
      expr,
    );
    return undefined;
  }
  const mainCond = leafToItemCondition(first);
  if (rest.length === 0) return mainCond;
  return {
    ...mainCond,
    logicOperator: logicOp,
    extraConditions: rest
      .filter((c): c is FieldConditional => 'campoId' in c)
      .map(leafToItemCondition),
  };
};

/**
 * Resolve os `campoId` de uma expressão condicional:
 * substitui o ID de DnD do campo-alvo pelo seu `nome` (chave no formulário).
 *
 * Este passo é necessário porque o ConditionEditor armazena o ID de DnD
 * (`texto-abc123`) enquanto o renderer avalia condicionais usando os valores
 * do form, que são indexados pelo `nome` do campo (ex: `nome_completo`).
 */
const resolveExprCampoIds = (
  expr: FieldConditionalExpr,
  configs: Record<string, ItemConfig>,
): FieldConditionalExpr => {
  if ('campoId' in expr) {
    const nome = configs[expr.campoId]?.name;
    return nome ? { ...expr, campoId: nome } : expr;
  }
  if ('and' in expr && Array.isArray(expr.and)) {
    return { and: expr.and.map((c) => resolveExprCampoIds(c, configs)) };
  }
  if ('or' in expr && Array.isArray(expr.or)) {
    return { or: expr.or.map((c) => resolveExprCampoIds(c, configs)) };
  }
  return expr;
};
import { v4Fallback } from '@schema-forms-data/core';

// ============================================
// Builder → FormSchema (to save to API)
// ============================================

export const builderToFormSchema = (
  dndState: DndState,
  configs: Record<string, ItemConfig>,
  meta: { nome: string; descricao?: string; status: FormSchemaStatus; template?: string | null; id?: string; stepConfig?: FormStepConfig },
): Omit<FormSchema, 'createdAt' | 'updatedAt'> => {
  const getConfig = (id: string): ItemConfig => configs[id] || { label: id, name: id };

  const rootChildren = dndState?.containers?.root?.children || [];

  const steps: FormStep[] = rootChildren
    .filter((id) => getItemType(id) === 'step')
    .map((stepId, stepIdx) => {
      const stepConfig = getConfig(stepId);
      const stepChildren = dndState?.containers?.[stepId]?.children || [];

      const containers: FormContainer[] = stepChildren
        .filter((id) => getItemType(id) === 'container')
        .map((contId, contIdx) => {
          const contConfig = getConfig(contId);
          const fieldIds = dndState?.containers?.[contId]?.children || [];

          const campos: FormField[] = fieldIds
            .filter((id) => getItemType(id) === 'field')
            .map((fieldId, fieldIdx) => {
              const fc = getConfig(fieldId);
              const field = configToFormField(fc, fieldId, fieldIdx);
              // Resolver campoId das condicionais: DnD ID → nome do campo
              if (field.condicional) {
                field.condicional = resolveExprCampoIds(field.condicional, configs);
              }
              // FIELD_ARRAY: read sub-fields from the dnd tree (visual canvas)
              if (field.tipo === FieldType.FIELD_ARRAY) {
                const subIds = dndState?.containers?.[fieldId]?.children ?? [];
                field.subFields = subIds
                  .filter((sfId) => getItemType(sfId) === 'field')
                  .map((sfId, sfIdx) =>
                    configToFormField(getConfig(sfId), sfId, sfIdx),
                  );
              }
              return field;
            });

          const cont: FormContainer = {
            id: contId,
            titulo: contConfig.label || 'Container',
            descricao: contConfig.description,
            icone: contConfig.icone,
            ordem: contIdx,
            colunas: (contConfig.columns || 2) as 1 | 2 | 3 | 4,
            tamanho: contConfig.tamanho || 12,
            inicioColuna: contConfig.inicioColuna,
            showLabel: contConfig.showLabel,
            showAsCard: contConfig.showAsCard,
            campos,
          };
          if (contConfig.condition) {
            cont.condicional = resolveExprCampoIds(
              itemConditionToExpr(contConfig.condition),
              configs,
            );
          }
          return cont;
        });

      return {
        id: stepId,
        titulo: stepConfig.label || 'Step',
        descricao: stepConfig.description,
        icone: stepConfig.icone,
        ordem: stepIdx,
        showLabel: stepConfig.showLabel,
        containers,
      };
    });

  return {
    id: meta.id || '',
    nome: meta.nome,
    descricao: meta.descricao,
    status: meta.status,
    template: meta.template ?? null,
    stepConfig: meta.stepConfig && Object.keys(meta.stepConfig).length > 0 ? meta.stepConfig : undefined,
    steps,
  };
};

const configToFormField = (config: ItemConfig, id: string, ordem: number): FormField => {
  const field: FormField = {
    id,
    nome: config.name || id,
    label: config.label || '',
    tipo: (config.fieldType || 'texto') as FieldType,
    obrigatorio: config.required || false,
    tamanho: config.tamanho || 6,
    inicioColuna: config.inicioColuna,
    ordem,
    placeholder: config.placeholder,
    hint: config.hint,
    defaultValue: config.defaultValue,
    mascara: config.mascara as MaskType | undefined,
    mascaraCustom: config.mascaraCustom,
    locked: config.locked || undefined,
    visualStyle: config.visualStyle,
    isReadOnly: config.isReadOnly || undefined,
    isDisabled: config.isDisabled || undefined,
    clearedValue: config.clearedValue !== undefined ? config.clearedValue : undefined,
    initialValue: config.initialValue !== undefined ? config.initialValue : undefined,
    resolvePropsKey: config.resolvePropsKey || undefined,
  };

  // Custom validators (validate / warn)
  if (config.validate?.length) field.validate = config.validate;
  if (config.warn?.length) field.warn = config.warn;

  // Options (preserve disabled)
  if (config.options?.length) {
    field.opcoes = config.options.map((o) => ({
      valor: o.value,
      label: o.label,
      disabled: o.disabled,
    }));
  }

  // Validation (include date + file fields)
  if (config.validation) {
    const v = config.validation;
    field.validacao = {};
    if (v.minLength !== undefined) field.validacao.minLength = v.minLength;
    if (v.maxLength !== undefined) field.validacao.maxLength = v.maxLength;
    if (v.min !== undefined) field.validacao.min = v.min;
    if (v.max !== undefined) field.validacao.max = v.max;
    if (v.regex) field.validacao.regex = v.regex;
    if (v.regexMessage) field.validacao.regexMessage = v.regexMessage;
    if (v.minDate) field.validacao.minDate = v.minDate;
    if (v.maxDate) field.validacao.maxDate = v.maxDate;
    if (v.minAge !== undefined) field.validacao.minAge = v.minAge;
    if (v.maxAge !== undefined) field.validacao.maxAge = v.maxAge;
    if (v.fileTypes?.length) field.validacao.fileTypes = v.fileTypes;
    if (v.maxFileSize !== undefined) field.validacao.maxFileSize = v.maxFileSize;
  }

  // FIELD_ARRAY specific
  if (field.tipo === FieldType.FIELD_ARRAY) {
    if (config.itemLabel) field.itemLabel = config.itemLabel;
    if (config.minItems !== undefined) field.minItems = config.minItems;
    if (config.maxItems !== undefined) field.maxItems = config.maxItems;
    if (config.addLabel) field.addLabel = config.addLabel;
  }

  // TERMS specific
  if (field.tipo === FieldType.TERMS) {
    if (config.termoTexto) field.termoTexto = config.termoTexto;
    if (config.termoPdfUrl) field.termoPdfUrl = config.termoPdfUrl;
    if (config.termoPdfUploadId) field.termoPdfUploadId = config.termoPdfUploadId;
  }

  // SLIDER specific
  if (field.tipo === FieldType.SLIDER) {
    if (config.step !== undefined) field.step = config.step;
    if (config.minValue !== undefined) field.minValue = config.minValue;
    if (config.maxValue !== undefined) field.maxValue = config.maxValue;
  }

  // RATING specific
  if (field.tipo === FieldType.RATING) {
    if (config.maxRating !== undefined) field.maxRating = config.maxRating;
  }

  // DATE_RANGE specific
  if (field.tipo === FieldType.DATE_RANGE) {
    if (config.dateRangeStartLabel) field.dateRangeStartLabel = config.dateRangeStartLabel;
    if (config.dateRangeEndLabel) field.dateRangeEndLabel = config.dateRangeEndLabel;
  }

  // SUB_FORM specific
  if (field.tipo === FieldType.SUB_FORM) {
    const subFields = config.subSchemaFields ?? [];
    if (subFields.length > 0 || config.subSchemaTitle) {
      field.subSchema = {
        titulo: config.subSchemaTitle,
        fields: subFields.map((sf, sfIdx) =>
          configToFormField(sf, sf.name ?? `subfield-${sfIdx}`, sfIdx),
        ),
      };
    }
  }

  // Condition
  if (config.condition) {
    field.condicional = itemConditionToExpr(config.condition);
  }

  return field;
};

// ============================================
// FormSchema → Builder (to load into DnD)
// ============================================

interface BuilderLoadResult {
  dndState: DndState;
  configs: Record<string, ItemConfig>;
  templateId?: string | null;
  stepConfig?: FormStepConfig;
}

export const formSchemaToBuilder = (schema: FormSchema): BuilderLoadResult => {
  const configs: Record<string, ItemConfig> = {};
  const containers: Record<string, { children: string[] }> = {
    root: { children: [] },
  };

  const sortedSteps = [...schema.steps].sort((a, b) => a.ordem - b.ordem);

  for (const step of sortedSteps) {
    const stepId = step.id || `step-${v4Fallback()}`;
    containers.root.children.push(stepId);

    configs[stepId] = {
      label: step.titulo,
      name: stepId,
      fieldType: 'step',
      description: step.descricao,
      icone: step.icone,
      showLabel: step.showLabel,
    };

    const stepChildren: string[] = [];
    const sortedContainers = [...step.containers].sort((a, b) => a.ordem - b.ordem);

    for (const cont of sortedContainers) {
      const contId = cont.id || `container-${v4Fallback()}`;
      stepChildren.push(contId);

      const contCondition = cont.condicional
        ? exprToItemCondition(cont.condicional)
        : undefined;
      configs[contId] = {
        label: cont.titulo,
        name: contId,
        fieldType: 'container',
        description: cont.descricao,
        icone: cont.icone,
        columns: cont.colunas,
        tamanho: cont.tamanho || 12,
        inicioColuna: cont.inicioColuna,
        showLabel: cont.showLabel,
        showAsCard: cont.showAsCard,
        ...(contCondition ? { condition: contCondition } : {}),
      };

      const contChildren: string[] = [];
      const sortedFields = [...cont.campos].sort((a, b) => a.ordem - b.ordem);

      for (const field of sortedFields) {
        const fieldId = field.id || `${field.tipo}-${v4Fallback()}`;
        contChildren.push(fieldId);
        configs[fieldId] = formFieldToConfig(field, fieldId);

        // FIELD_ARRAY: create a containers entry so sub-fields appear in the canvas
        if (field.tipo === FieldType.FIELD_ARRAY) {
          const subChildren: string[] = [];
          for (const sf of field.subFields ?? []) {
            const sfId = sf.id || `${sf.tipo}-${v4Fallback()}`;
            subChildren.push(sfId);
            configs[sfId] = formFieldToConfig(sf, sfId);
          }
          containers[fieldId] = { children: subChildren };
        }
      }

      containers[contId] = { children: contChildren };
    }

    containers[stepId] = { children: stepChildren };
  }

  return { dndState: { containers }, configs, templateId: schema.template ?? null, stepConfig: schema.stepConfig };
};

const formFieldToConfig = (field: FormField, _id: string): ItemConfig => {
  const config: ItemConfig = {
    label: field.label,
    name: field.nome,
    fieldType: field.tipo,
    required: field.obrigatorio,
    tamanho: field.tamanho,
    inicioColuna: field.inicioColuna,
    placeholder: field.placeholder,
    hint: field.hint,
    defaultValue: field.defaultValue as string | undefined,
    mascara: field.mascara,
    mascaraCustom: field.mascaraCustom,
    locked: field.locked || undefined,
    visualStyle: field.visualStyle,
    isReadOnly: field.isReadOnly || undefined,
    isDisabled: field.isDisabled || undefined,
  
    clearedValue: field.clearedValue !== undefined ? String(field.clearedValue ?? "") : undefined,
    initialValue: field.initialValue !== undefined ? String(field.initialValue) : undefined,
    resolvePropsKey: field.resolvePropsKey || undefined,
    validate: field.validate?.length ? field.validate : undefined,
    warn: field.warn?.length ? field.warn : undefined,
  };

  // Options (preserve disabled)
  if (field.opcoes?.length) {
    config.options = field.opcoes.map((o) => ({
      value: o.valor,
      label: o.label,
      disabled: o.disabled,
    }));
  }

  // Validation (include date + file fields)
  if (field.validacao) {
    const v = field.validacao;
    config.validation = {};
    if (v.minLength !== undefined) config.validation.minLength = v.minLength;
    if (v.maxLength !== undefined) config.validation.maxLength = v.maxLength;
    if (v.min !== undefined) config.validation.min = v.min;
    if (v.max !== undefined) config.validation.max = v.max;
    if (v.regex) config.validation.regex = v.regex;
    if (v.regexMessage) config.validation.regexMessage = v.regexMessage;
    if (v.minDate) config.validation.minDate = v.minDate;
    if (v.maxDate) config.validation.maxDate = v.maxDate;
    if (v.minAge !== undefined) config.validation.minAge = v.minAge;
    if (v.maxAge !== undefined) config.validation.maxAge = v.maxAge;
    if (v.fileTypes?.length) config.validation.fileTypes = v.fileTypes;
    if (v.maxFileSize !== undefined) config.validation.maxFileSize = v.maxFileSize;
  }

  // FIELD_ARRAY specific — metadata only; sub-fields are in the dnd containers tree
  if (field.tipo === FieldType.FIELD_ARRAY) {
    if (field.itemLabel) config.itemLabel = field.itemLabel;
    if (field.minItems !== undefined) config.minItems = field.minItems;
    if (field.maxItems !== undefined) config.maxItems = field.maxItems;
    if (field.addLabel) config.addLabel = field.addLabel;
  }

  // TERMS specific
  if (field.tipo === FieldType.TERMS) {
    if (field.termoTexto) config.termoTexto = field.termoTexto;
    if (field.termoPdfUrl) config.termoPdfUrl = field.termoPdfUrl;
    if (field.termoPdfUploadId) config.termoPdfUploadId = field.termoPdfUploadId;
  }

  // SLIDER specific
  if (field.tipo === FieldType.SLIDER) {
    if (field.step !== undefined) config.step = field.step;
    if (field.minValue !== undefined) config.minValue = field.minValue;
    if (field.maxValue !== undefined) config.maxValue = field.maxValue;
  }

  // RATING specific
  if (field.tipo === FieldType.RATING) {
    if (field.maxRating !== undefined) config.maxRating = field.maxRating;
  }

  // DATE_RANGE specific
  if (field.tipo === FieldType.DATE_RANGE) {
    if (field.dateRangeStartLabel) config.dateRangeStartLabel = field.dateRangeStartLabel;
    if (field.dateRangeEndLabel) config.dateRangeEndLabel = field.dateRangeEndLabel;
  }

  // SUB_FORM specific
  if (field.tipo === FieldType.SUB_FORM && field.subSchema) {
    config.subSchemaTitle = field.subSchema.titulo;
    config.subSchemaFields = field.subSchema.fields.map((sf) =>
      formFieldToConfig(sf, sf.id),
    );
  }

  // Condition
  if (field.condicional) {
    const cond = exprToItemCondition(field.condicional);
    if (cond) config.condition = cond;
  }

  return config;
};

// ============================================
// Integrity Validation (pre-save checks)
// ============================================

export interface BuilderValidationResult {
  errors: string[];
  warnings: string[];
}

/**
 * validateBuilderIntegrity — Runs structural checks on the builder state before saving.
 *
 * Errors   (blocking): duplicate `nome` fields within a container.
 * Warnings (advisory): steps without containers, conditionals referencing missing fields.
 */
export const validateBuilderIntegrity = (
  dndState: DndState,
  configs: Record<string, ItemConfig>,
): BuilderValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const getConfig = (id: string): ItemConfig => configs[id] || { label: id, name: id };
  const rootChildren = dndState?.containers?.root?.children || [];

  // Collect all field IDs for conditional reference checking
  const allFieldIds = new Set<string>();

  for (const stepId of rootChildren) {
    if (getItemType(stepId) !== 'step') continue;
    const stepLabel = getConfig(stepId).label || stepId;
    const stepChildren = dndState?.containers?.[stepId]?.children || [];

    if (stepChildren.length === 0) {
      warnings.push(`Step "${stepLabel}" está vazio (sem containers).`);
      continue;
    }

    for (const contId of stepChildren) {
      if (getItemType(contId) !== 'container') continue;
      const contLabel = getConfig(contId).label || contId;
      const fieldIds = dndState?.containers?.[contId]?.children || [];
      const namesInContainer = new Map<string, string[]>();

      for (const fieldId of fieldIds) {
        if (getItemType(fieldId) !== 'field') continue;
        allFieldIds.add(fieldId);
        const rawName = getConfig(fieldId).name;
        if (!rawName || !rawName.trim()) {
          errors.push(
            `Campo "${getConfig(fieldId).label || fieldId}" (${fieldId}) no container "${contLabel}" não tem nome definido.`,
          );
        }
        const name = rawName || fieldId;
        if (!namesInContainer.has(name)) namesInContainer.set(name, []);
        namesInContainer.get(name)!.push(fieldId);
      }

      for (const [name, ids] of namesInContainer.entries()) {
        if (ids.length > 1) {
          errors.push(
            `Nome duplicado "${name}" no container "${contLabel}" (IDs: ${ids.join(', ')}).`,
          );
        }
      }
    }
  }

  // Check conditionals reference existing fields
  for (const [fieldId, config] of Object.entries(configs)) {
    if (!config.condition?.when) continue;
    const targetId = config.condition.when;
    if (!allFieldIds.has(targetId)) {
      const fieldLabel = config.label || fieldId;
      warnings.push(
        `Campo "${fieldLabel}" referencia campo inexistente na condição (when: "${targetId}").`,
      );
    }
  }

  // Detectar nomes duplicados entre containers diferentes no mesmo step
  for (const stepId of rootChildren) {
    if (getItemType(stepId) !== 'step') continue;
    const stepLabel = getConfig(stepId).label || stepId;
    const stepChildren = dndState?.containers?.[stepId]?.children || [];
    const nameToContainers = new Map<string, Set<string>>();

    for (const contId of stepChildren) {
      if (getItemType(contId) !== 'container') continue;
      const fieldIds = dndState?.containers?.[contId]?.children || [];
      for (const fieldId of fieldIds) {
        if (getItemType(fieldId) !== 'field') continue;
        const name = getConfig(fieldId).name || fieldId;
        if (!nameToContainers.has(name)) nameToContainers.set(name, new Set());
        nameToContainers.get(name)!.add(contId);
      }
    }

    for (const [name, containerIds] of nameToContainers.entries()) {
      if (containerIds.size > 1) {
        errors.push(
          `Nome duplicado "${name}" no step "${stepLabel}" em containers diferentes (containers: ${[...containerIds].join(', ')}). Isso causa colisão no formulário.`,
        );
      }
    }
  }

  return { errors, warnings };
};
