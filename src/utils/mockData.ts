/**
 * Mock data generation for the LivePreview.
 */

import type { ItemConfig } from '../types';

/** Map of field types to sensible mock values */
const MOCK_VALUES: Record<string, string> = {
    email: 'teste@email.com',
    number: '123',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    cep: '01001-000',
    date: new Date().toISOString().slice(0, 10),
    datetime: new Date().toISOString().slice(0, 10),
    textarea: 'Texto de teste para preview',
    checkbox: 'true',
    hidden: '',
    participation_type: JSON.stringify({ tipo: 'todos_os_dias', data: null, genero: null }),
    payment_method: JSON.stringify({ metodo: 'pix', valorTotal: 0 }),
    terms: '',
};

/** Minimal sub-field shape needed for mock generation */
type MockSubField = { id: string; config: ItemConfig };

/**
 * Generate a mock value for a given field config.
 * For field_array, pass subFields to generate mock items as JSON.
 */
export const getMockValue = (config: ItemConfig, subFields?: MockSubField[]): string => {
    const t = config.fieldType || 'texto';

    // For field_array: generate N mock items as JSON
    if (t === 'field_array') {
        const count = Math.max(config.minItems ?? 1, 1);
        const items = Array.from({ length: count }, () => {
            const obj: Record<string, string> = {};
            subFields?.forEach((sf) => {
                obj[sf.id] = getMockValue(sf.config);
            });
            return obj;
        });
        return JSON.stringify(items);
    }

    // Check if field type has a known mock
    if (MOCK_VALUES[t] !== undefined) return MOCK_VALUES[t];

    // For select/radio: pick first option
    if ((t === 'select' || t === 'radio') && config.options?.length) {
        return config.options[0].value || '';
    }

    // Default text value
    return 'Teste';
};
