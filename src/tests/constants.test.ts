import { describe, it, expect } from 'vitest';
import {
  FIELD_TYPES,
  getItemType,
  getFieldMeta,
  getFieldMetaById,
} from '../constants';

// ── getItemType ────────────────────────────────────────────────────────────

describe('getItemType', () => {
  it('classifica IDs com prefixo "step-" como step', () => {
    expect(getItemType('step-abc123')).toBe('step');
  });

  it('classifica o ID exato "step" como step', () => {
    expect(getItemType('step')).toBe('step');
  });

  it('classifica IDs com prefixo "container-" como container', () => {
    expect(getItemType('container-xyz')).toBe('container');
  });

  it('classifica o ID exato "container" como container', () => {
    expect(getItemType('container')).toBe('container');
  });

  it('classifica qualquer outro ID como field', () => {
    expect(getItemType('texto-abc')).toBe('field');
    expect(getItemType('field_array-99')).toBe('field');
    expect(getItemType('email')).toBe('field');
    expect(getItemType('random')).toBe('field');
  });
});

// ── getFieldMeta ───────────────────────────────────────────────────────────

describe('getFieldMeta', () => {
  it('retorna a meta correta para um componente conhecido', () => {
    const meta = getFieldMeta('texto');
    expect(meta).toBeDefined();
    expect(meta?.component).toBe('texto');
    expect(meta?.label).toBe('Texto');
    expect(meta?.group).toBe('texto');
  });

  it('retorna a meta de um campo do grupo selecao', () => {
    const meta = getFieldMeta('select');
    expect(meta?.label).toBe('Seleção');
    expect(meta?.group).toBe('selecao');
  });

  it('retorna undefined para um componente desconhecido', () => {
    expect(getFieldMeta('nao_existe')).toBeUndefined();
  });
});

// ── getFieldMetaById ───────────────────────────────────────────────────────

describe('getFieldMetaById', () => {
  it('resolve um tipo simples a partir do prefixo antes do "-"', () => {
    const meta = getFieldMetaById('texto-abc123');
    expect(meta?.component).toBe('texto');
  });

  it('resolve corretamente um tipo com underscore (field_array)', () => {
    // "field_array-xyz".split("-")[0] => "field_array" mas o match por underscore
    // garante que não vire "field"
    const meta = getFieldMetaById('field_array-xyz');
    expect(meta?.component).toBe('field_array');
  });

  it('resolve corretamente checkbox_group com sufixo', () => {
    const meta = getFieldMetaById('checkbox_group-1');
    expect(meta?.component).toBe('checkbox_group');
  });

  it('resolve corretamente date_range', () => {
    const meta = getFieldMetaById('date_range-aaa');
    expect(meta?.component).toBe('date_range');
  });

  it('resolve corretamente sub_form', () => {
    const meta = getFieldMetaById('sub_form-1');
    expect(meta?.component).toBe('sub_form');
  });

  it('retorna undefined para um ID cujo prefixo não existe', () => {
    expect(getFieldMetaById('inexistente-1')).toBeUndefined();
  });
});

// ── FIELD_TYPES table ───────────────────────────────────────────────────────

describe('FIELD_TYPES', () => {
  it('contém os tipos de campo esperados (vistos na fonte)', () => {
    const components = FIELD_TYPES.map((f) => f.component);
    for (const expected of [
      'texto',
      'textarea',
      'number',
      'email',
      'password',
      'select',
      'autocomplete',
      'radio',
      'checkbox',
      'checkbox_group',
      'switch',
      'slider',
      'rating',
      'color',
      'date',
      'datetime',
      'time',
      'date_range',
      'telefone',
      'cpf',
      'cep',
      'file',
      'hidden',
      'field_array',
      'terms',
      'sub_form',
    ]) {
      expect(components).toContain(expected);
    }
  });

  it('NÃO inclui participation_type nem payment_method (apenas via presets)', () => {
    const components = FIELD_TYPES.map((f) => f.component);
    expect(components).not.toContain('participation_type');
    expect(components).not.toContain('payment_method');
  });

  it('tem exatamente 26 entradas com components únicos', () => {
    expect(FIELD_TYPES).toHaveLength(26);
    expect(new Set(FIELD_TYPES.map((f) => f.component)).size).toBe(26);
  });

  it('toda entrada tem component, label, icon e group', () => {
    for (const f of FIELD_TYPES) {
      expect(typeof f.component).toBe('string');
      expect(typeof f.label).toBe('string');
      expect(f.icon).toBeDefined();
      expect(typeof f.group).toBe('string');
    }
  });
});
