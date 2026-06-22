import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../utils/evaluateCondition';
import { validateField } from '../utils/validateField';
import {
  collectAllFieldIds,
  findParentId,
  buildPreviewData,
} from '../utils/treeTraversal';
import type { ItemCondition, ItemConfig, DndState } from '../types';

// ════════════════════════════════════════════════════════════════════════════
// evaluateCondition
// ════════════════════════════════════════════════════════════════════════════

describe('evaluateCondition', () => {
  it('retorna true quando não há condição', () => {
    expect(evaluateCondition(undefined, {})).toBe(true);
  });

  it('retorna true quando a condição não tem "when"', () => {
    const cond = { when: '', operator: 'igual', value: 'x' } as ItemCondition;
    expect(evaluateCondition(cond, {})).toBe(true);
  });

  it('operador "igual": true quando o valor bate', () => {
    const cond: ItemCondition = { when: 'a', operator: 'igual', value: 'sim' };
    expect(evaluateCondition(cond, { a: 'sim' })).toBe(true);
    expect(evaluateCondition(cond, { a: 'nao' })).toBe(false);
  });

  it('operador "diferente"', () => {
    const cond: ItemCondition = { when: 'a', operator: 'diferente', value: 'sim' };
    expect(evaluateCondition(cond, { a: 'nao' })).toBe(true);
    expect(evaluateCondition(cond, { a: 'sim' })).toBe(false);
  });

  it('operador "vazio" / "naoVazio"', () => {
    const vazio: ItemCondition = { when: 'a', operator: 'vazio' };
    const naoVazio: ItemCondition = { when: 'a', operator: 'naoVazio' };
    expect(evaluateCondition(vazio, { a: '' })).toBe(true);
    expect(evaluateCondition(vazio, { a: 'x' })).toBe(false);
    expect(evaluateCondition(naoVazio, { a: 'x' })).toBe(true);
    expect(evaluateCondition(naoVazio, {})).toBe(false);
  });

  it('operador "contem" / "naoContem"', () => {
    const contem: ItemCondition = { when: 'a', operator: 'contem', value: 'lo' };
    const naoContem: ItemCondition = { when: 'a', operator: 'naoContem', value: 'lo' };
    expect(evaluateCondition(contem, { a: 'hello' })).toBe(true);
    expect(evaluateCondition(contem, { a: 'world' })).toBe(false);
    expect(evaluateCondition(naoContem, { a: 'world' })).toBe(true);
  });

  it('operadores numéricos maiorQue / menorQue / maiorOuIgual / menorOuIgual', () => {
    expect(
      evaluateCondition({ when: 'n', operator: 'maiorQue', value: '5' }, { n: '10' }),
    ).toBe(true);
    expect(
      evaluateCondition({ when: 'n', operator: 'maiorQue', value: '5' }, { n: '3' }),
    ).toBe(false);
    expect(
      evaluateCondition({ when: 'n', operator: 'menorQue', value: '5' }, { n: '3' }),
    ).toBe(true);
    expect(
      evaluateCondition({ when: 'n', operator: 'maiorOuIgual', value: '5' }, { n: '5' }),
    ).toBe(true);
    expect(
      evaluateCondition({ when: 'n', operator: 'menorOuIgual', value: '5' }, { n: '5' }),
    ).toBe(true);
  });

  it('comparações numéricas com valor não-numérico retornam false', () => {
    expect(
      evaluateCondition({ when: 'n', operator: 'maiorQue', value: '5' }, { n: 'abc' }),
    ).toBe(false);
  });

  it('usa eventoData quando source = "evento"', () => {
    const cond: ItemCondition = {
      when: 'status',
      operator: 'igual',
      value: 'ativo',
      source: 'evento',
    };
    expect(evaluateCondition(cond, {}, { status: 'ativo' })).toBe(true);
    expect(evaluateCondition(cond, { status: 'ativo' }, { status: 'inativo' })).toBe(false);
  });

  it('combina extraConditions com logicOperator "and"', () => {
    const cond: ItemCondition = {
      when: 'a',
      operator: 'igual',
      value: '1',
      logicOperator: 'and',
      extraConditions: [{ when: 'b', operator: 'igual', value: '2' }],
    };
    expect(evaluateCondition(cond, { a: '1', b: '2' })).toBe(true);
    expect(evaluateCondition(cond, { a: '1', b: '9' })).toBe(false);
  });

  it('combina extraConditions com logicOperator "or"', () => {
    const cond: ItemCondition = {
      when: 'a',
      operator: 'igual',
      value: '1',
      logicOperator: 'or',
      extraConditions: [{ when: 'b', operator: 'igual', value: '2' }],
    };
    expect(evaluateCondition(cond, { a: '1', b: '9' })).toBe(true);
    expect(evaluateCondition(cond, { a: '9', b: '2' })).toBe(true);
    expect(evaluateCondition(cond, { a: '9', b: '9' })).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// validateField
// ════════════════════════════════════════════════════════════════════════════

describe('validateField', () => {
  it('campo obrigatório vazio retorna mensagem', () => {
    const config: ItemConfig = { label: 'X', required: true };
    expect(validateField('', config, {})).toBe('Campo obrigatório');
  });

  it('campo opcional vazio é válido (undefined)', () => {
    const config: ItemConfig = { label: 'X' };
    expect(validateField('', config, {})).toBeUndefined();
  });

  it('pula validação quando a condicional do campo é falsa', () => {
    const config: ItemConfig = {
      label: 'X',
      required: true,
      condition: { when: 'a', operator: 'igual', value: 'sim' },
    };
    // condição falsa => campo oculto => sem erro mesmo obrigatório e vazio
    expect(validateField('', config, { a: 'nao' })).toBeUndefined();
  });

  it('valida minLength e maxLength', () => {
    const config: ItemConfig = {
      label: 'X',
      validation: { minLength: 3, maxLength: 5 },
    };
    expect(validateField('ab', config, {})).toBe('Mínimo 3 caracteres');
    expect(validateField('abcdef', config, {})).toBe('Máximo 5 caracteres');
    expect(validateField('abcd', config, {})).toBeUndefined();
  });

  it('valida min/max apenas para fieldType number', () => {
    const config: ItemConfig = {
      label: 'N',
      fieldType: 'number',
      validation: { min: 10, max: 20 },
    };
    expect(validateField('5', config, {})).toBe('Valor mínimo: 10');
    expect(validateField('25', config, {})).toBe('Valor máximo: 20');
    expect(validateField('15', config, {})).toBeUndefined();
  });

  it('valida minDate/maxDate para fieldType date', () => {
    const config: ItemConfig = {
      label: 'D',
      fieldType: 'date',
      validation: { minDate: '2020-01-01', maxDate: '2020-12-31' },
    };
    expect(validateField('2019-06-01', config, {})).toBe('Data mínima: 2020-01-01');
    expect(validateField('2021-06-01', config, {})).toBe('Data máxima: 2020-12-31');
    expect(validateField('2020-06-01', config, {})).toBeUndefined();
  });

  it('aplica regex e retorna regexMessage customizada', () => {
    const config: ItemConfig = {
      label: 'R',
      validation: { regex: '^[0-9]+$', regexMessage: 'Só números' },
    };
    expect(validateField('abc', config, {})).toBe('Só números');
    expect(validateField('123', config, {})).toBeUndefined();
  });

  it('regex inválida no estilo /pattern/flags é ignorada (retorna undefined)', () => {
    const config: ItemConfig = {
      label: 'R',
      validation: { regex: '/abc/i', regexMessage: 'X' },
    };
    // O guard rejeita a sintaxe com barras e desabilita a validação
    expect(validateField('qualquer', config, {})).toBeUndefined();
  });

  it('regex sintaticamente quebrada é silenciosamente ignorada', () => {
    const config: ItemConfig = {
      label: 'R',
      validation: { regex: '[' },
    };
    expect(validateField('x', config, {})).toBeUndefined();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// treeTraversal
// ════════════════════════════════════════════════════════════════════════════

const buildSampleState = (): DndState => ({
  containers: {
    root: { children: ['step-1', 'avulso'] },
    'step-1': { children: ['container-1'] },
    'container-1': { children: ['texto-1', 'field_array-1', 'naofield'] },
    'field_array-1': { children: ['texto-sub-1'] },
  },
});

describe('collectAllFieldIds', () => {
  it('retorna [] para state nulo/sem containers', () => {
    expect(collectAllFieldIds(null)).toEqual([]);
    expect(collectAllFieldIds(undefined)).toEqual([]);
    expect(collectAllFieldIds({ containers: {} } as DndState)).toEqual([]);
  });

  it('coleta apenas IDs do tipo field, descendo recursivamente', () => {
    const ids = collectAllFieldIds(buildSampleState());
    // step-1 e container-1 não são field; texto-1, field_array-1, naofield, texto-sub-1 são
    expect(ids).toContain('texto-1');
    expect(ids).toContain('field_array-1');
    expect(ids).toContain('naofield');
    expect(ids).toContain('texto-sub-1');
    expect(ids).not.toContain('step-1');
    expect(ids).not.toContain('container-1');
  });
});

describe('findParentId', () => {
  it('retorna undefined para state nulo', () => {
    expect(findParentId(null, 'x')).toBeUndefined();
  });

  it('encontra o container pai de um item', () => {
    const state = buildSampleState();
    expect(findParentId(state, 'step-1')).toBe('root');
    expect(findParentId(state, 'container-1')).toBe('step-1');
    expect(findParentId(state, 'texto-1')).toBe('container-1');
    expect(findParentId(state, 'texto-sub-1')).toBe('field_array-1');
  });

  it('retorna undefined quando o item não tem pai', () => {
    expect(findParentId(buildSampleState(), 'inexistente')).toBeUndefined();
  });
});

describe('buildPreviewData', () => {
  it('monta a árvore preview step → container → field', () => {
    const state = buildSampleState();
    const configs: Record<string, ItemConfig> = {
      'step-1': { label: 'Passo 1' },
      'container-1': { label: 'Bloco' },
      'texto-1': { label: 'Texto', fieldType: 'texto' },
      'field_array-1': { label: 'Lista', fieldType: 'field_array' },
      'texto-sub-1': { label: 'Sub', fieldType: 'texto' },
      naofield: { label: 'naofield', fieldType: 'texto' },
    };
    const getConfig = (id: string): ItemConfig => configs[id] || { label: id };
    const steps = buildPreviewData(state, getConfig);

    expect(steps).toHaveLength(1);
    expect(steps[0].id).toBe('step-1');
    expect(steps[0].containers).toHaveLength(1);

    const cont = steps[0].containers[0];
    expect(cont.id).toBe('container-1');
    // texto-1, field_array-1, naofield -> 3 fields (todos getItemType === 'field')
    expect(cont.fields.map((f) => f.id)).toEqual(['texto-1', 'field_array-1', 'naofield']);

    // field_array deve trazer subFields
    const fa = cont.fields.find((f) => f.id === 'field_array-1');
    expect(fa?.subFields?.map((sf) => sf.id)).toEqual(['texto-sub-1']);

    // campo comum não tem subFields
    const txt = cont.fields.find((f) => f.id === 'texto-1');
    expect(txt?.subFields).toBeUndefined();
  });

  it('retorna [] quando não há steps', () => {
    expect(buildPreviewData({ containers: { root: { children: [] } } }, (id) => ({ label: id }))).toEqual([]);
  });
});
