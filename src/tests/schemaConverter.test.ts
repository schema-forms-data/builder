import { describe, it, expect } from 'vitest';
import {
  builderToFormSchema,
  formSchemaToBuilder,
  validateBuilderIntegrity,
} from '../schemaConverter';
import type { ItemConfig, DndState } from '../types';
import { FieldType, FormSchemaStatus } from '@schema-forms-data/core';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builder state: 1 step → 1 container → 2 fields (texto + email).
 * Note: getItemType keys off ID prefixes, so IDs MUST start with
 * step-/container- and fields must NOT start with those prefixes.
 */
const makeBuilderState = (): { dndState: DndState; configs: Record<string, ItemConfig> } => {
  const dndState: DndState = {
    containers: {
      root: { children: ['step-1'] },
      'step-1': { children: ['container-1'] },
      'container-1': { children: ['texto-1', 'email-1'] },
    },
  };
  const configs: Record<string, ItemConfig> = {
    'step-1': { label: 'Dados', name: 'step-1', fieldType: 'step' },
    'container-1': {
      label: 'Pessoais',
      name: 'container-1',
      fieldType: 'container',
      columns: 2,
      tamanho: 12,
    },
    'texto-1': {
      label: 'Nome',
      name: 'nome_completo',
      fieldType: FieldType.TEXTO,
      required: true,
      tamanho: 6,
      placeholder: 'Seu nome',
    },
    'email-1': {
      label: 'E-mail',
      name: 'email',
      fieldType: FieldType.EMAIL,
      required: false,
      tamanho: 6,
      validation: { maxLength: 100 },
    },
  };
  return { dndState, configs };
};

const meta = {
  nome: 'Formulário de teste',
  descricao: 'desc',
  status: FormSchemaStatus.RASCUNHO,
  id: 'form-1',
};

// ─────────────────────────────────────────────────────────────────────────────
// builderToFormSchema
// ─────────────────────────────────────────────────────────────────────────────

describe('builderToFormSchema', () => {
  it('produz um FormSchema válido a partir de um estado mínimo', () => {
    const { dndState, configs } = makeBuilderState();
    const schema = builderToFormSchema(dndState, configs, meta);

    expect(schema.id).toBe('form-1');
    expect(schema.nome).toBe('Formulário de teste');
    expect(schema.status).toBe(FormSchemaStatus.RASCUNHO);
    expect(schema.template).toBeNull();
    expect(schema.steps).toHaveLength(1);

    const step = schema.steps[0];
    expect(step.id).toBe('step-1');
    expect(step.titulo).toBe('Dados');
    expect(step.ordem).toBe(0);
    expect(step.containers).toHaveLength(1);

    const cont = step.containers[0];
    expect(cont.id).toBe('container-1');
    expect(cont.titulo).toBe('Pessoais');
    expect(cont.colunas).toBe(2);
    expect(cont.ordem).toBe(0);
    expect(cont.campos).toHaveLength(2);

    const [f1, f2] = cont.campos;
    expect(f1.id).toBe('texto-1');
    expect(f1.nome).toBe('nome_completo');
    expect(f1.tipo).toBe(FieldType.TEXTO);
    expect(f1.obrigatorio).toBe(true);
    expect(f1.ordem).toBe(0);
    expect(f1.placeholder).toBe('Seu nome');

    expect(f2.id).toBe('email-1');
    expect(f2.nome).toBe('email');
    expect(f2.tipo).toBe(FieldType.EMAIL);
    expect(f2.ordem).toBe(1);
    expect(f2.validacao?.maxLength).toBe(100);
  });

  it('usa defaults quando meta.id e meta.template estão ausentes', () => {
    const { dndState, configs } = makeBuilderState();
    const schema = builderToFormSchema(dndState, configs, {
      nome: 'X',
      status: FormSchemaStatus.ATIVO,
    });
    expect(schema.id).toBe('');
    expect(schema.template).toBeNull();
  });

  it('ignora children que não casam com o tipo esperado em cada nível', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1', 'container-orphan'] },
        'step-1': { children: ['texto-direct', 'container-1'] },
        'container-1': { children: ['texto-1'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C', name: 'container-1' },
      'texto-1': { label: 'T', name: 't', fieldType: FieldType.TEXTO },
    };
    const schema = builderToFormSchema(dndState, configs, meta);
    // só um step (container-orphan no root é ignorado)
    expect(schema.steps).toHaveLength(1);
    // dentro do step, texto-direct (field) é ignorado; só container-1 vira container
    expect(schema.steps[0].containers).toHaveLength(1);
    expect(schema.steps[0].containers[0].campos).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Roundtrip: formSchemaToBuilder(builderToFormSchema(...))
// ─────────────────────────────────────────────────────────────────────────────

describe('roundtrip builder → schema → builder', () => {
  it('preserva estrutura, ordem e IDs dos campos', () => {
    const { dndState, configs } = makeBuilderState();
    const schema = builderToFormSchema(dndState, configs, meta);
    // builderToFormSchema retorna Omit<FormSchema, createdAt|updatedAt>; o cast
    // é seguro pois formSchemaToBuilder não usa esses campos.
    const back = formSchemaToBuilder(schema as Parameters<typeof formSchemaToBuilder>[0]);

    // Estrutura da árvore preservada
    expect(back.dndState.containers.root.children).toEqual(['step-1']);
    expect(back.dndState.containers['step-1'].children).toEqual(['container-1']);
    expect(back.dndState.containers['container-1'].children).toEqual(['texto-1', 'email-1']);

    // Propriedades-chave dos fields preservadas
    expect(back.configs['texto-1'].name).toBe('nome_completo');
    expect(back.configs['texto-1'].label).toBe('Nome');
    expect(back.configs['texto-1'].fieldType).toBe(FieldType.TEXTO);
    expect(back.configs['texto-1'].required).toBe(true);
    expect(back.configs['texto-1'].placeholder).toBe('Seu nome');

    expect(back.configs['email-1'].name).toBe('email');
    expect(back.configs['email-1'].fieldType).toBe(FieldType.EMAIL);
    expect(back.configs['email-1'].validation?.maxLength).toBe(100);

    // templateId vem null
    expect(back.templateId).toBeNull();
  });

  it('preserva a ordem mesmo quando o schema vem com ordem fora de sequência', () => {
    // Constrói um schema cru com ordens embaralhadas e confirma que
    // formSchemaToBuilder ordena por `ordem`.
    const { dndState, configs } = makeBuilderState();
    const schema = builderToFormSchema(dndState, configs, meta);
    // inverte ordem dos campos no schema
    schema.steps[0].containers[0].campos[0].ordem = 5;
    schema.steps[0].containers[0].campos[1].ordem = 1;
    const back = formSchemaToBuilder(schema as Parameters<typeof formSchemaToBuilder>[0]);
    // email-1 (ordem 1) deve vir antes de texto-1 (ordem 5)
    expect(back.dndState.containers['container-1'].children).toEqual(['email-1', 'texto-1']);
  });

  it('roundtrip de FIELD_ARRAY preserva os sub-fields na árvore DnD', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: ['container-1'] },
        'container-1': { children: ['field_array-1'] },
        'field_array-1': { children: ['texto-sub'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C', name: 'container-1' },
      'field_array-1': {
        label: 'Lista',
        name: 'itens',
        fieldType: FieldType.FIELD_ARRAY,
        itemLabel: 'Item',
        minItems: 1,
      },
      'texto-sub': { label: 'Sub', name: 'sub_nome', fieldType: FieldType.TEXTO },
    };
    const schema = builderToFormSchema(dndState, configs, meta);
    const fa = schema.steps[0].containers[0].campos[0];
    expect(fa.tipo).toBe(FieldType.FIELD_ARRAY);
    expect(fa.subFields?.map((sf) => sf.id)).toEqual(['texto-sub']);
    expect(fa.itemLabel).toBe('Item');
    expect(fa.minItems).toBe(1);

    const back = formSchemaToBuilder(schema as Parameters<typeof formSchemaToBuilder>[0]);
    // o container do field_array deve existir na árvore com o sub-field
    expect(back.dndState.containers['field_array-1'].children).toEqual(['texto-sub']);
    expect(back.configs['texto-sub'].name).toBe('sub_nome');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateBuilderIntegrity
// ─────────────────────────────────────────────────────────────────────────────

describe('validateBuilderIntegrity', () => {
  it('retorna a forma BuilderValidationResult (errors[] + warnings[]) para árvore válida', () => {
    const { dndState, configs } = makeBuilderState();
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result).toHaveProperty('errors');
    expect(result).toHaveProperty('warnings');
    expect(Array.isArray(result.errors)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('sinaliza erro de nome duplicado dentro do mesmo container', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: ['container-1'] },
        'container-1': { children: ['texto-1', 'texto-2'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C', name: 'container-1' },
      'texto-1': { label: 'A', name: 'duplicado', fieldType: FieldType.TEXTO },
      'texto-2': { label: 'B', name: 'duplicado', fieldType: FieldType.TEXTO },
    };
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.includes('duplicado'))).toBe(true);
  });

  it('emite erro quando um campo não tem nome definido', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: ['container-1'] },
        'container-1': { children: ['texto-1'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C', name: 'container-1' },
      'texto-1': { label: 'Sem nome', name: '   ', fieldType: FieldType.TEXTO },
    };
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result.errors.some((e) => e.includes('não tem nome'))).toBe(true);
  });

  it('emite warning para step vazio (sem containers)', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: [] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'Vazio', name: 'step-1' },
    };
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result.warnings.some((w) => w.includes('vazio'))).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('emite warning quando uma condicional referencia campo inexistente', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: ['container-1'] },
        'container-1': { children: ['texto-1'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C', name: 'container-1' },
      'texto-1': {
        label: 'A',
        name: 'a',
        fieldType: FieldType.TEXTO,
        condition: { when: 'fantasma', operator: 'igual', value: 'x' },
      },
    };
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result.warnings.some((w) => w.includes('inexistente'))).toBe(true);
  });

  it('sinaliza nome duplicado entre containers diferentes do mesmo step', () => {
    const dndState: DndState = {
      containers: {
        root: { children: ['step-1'] },
        'step-1': { children: ['container-1', 'container-2'] },
        'container-1': { children: ['texto-1'] },
        'container-2': { children: ['texto-2'] },
      },
    };
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'S', name: 'step-1' },
      'container-1': { label: 'C1', name: 'container-1' },
      'container-2': { label: 'C2', name: 'container-2' },
      'texto-1': { label: 'A', name: 'colisao', fieldType: FieldType.TEXTO },
      'texto-2': { label: 'B', name: 'colisao', fieldType: FieldType.TEXTO },
    };
    const result = validateBuilderIntegrity(dndState, configs);
    expect(result.errors.some((e) => e.includes('containers diferentes'))).toBe(true);
  });
});
