/**
 * Field validation — shared between LivePreview and form renderer.
 */

import type { ItemConfig } from '../types';
import { evaluateCondition } from './evaluateCondition';

/**
 * Validate a single field value against its config.
 * Returns an error message string or undefined if valid.
 */
export const validateField = (
    value: string,
    config: ItemConfig,
    formValues: Record<string, string>,
    eventoData?: Record<string, string>,
): string | undefined => {
    // Skip hidden conditional fields
    if (!evaluateCondition(config.condition, formValues, eventoData)) return undefined;

    const v = config.validation;
    const fieldType = config.fieldType || 'texto';

    // Required
    if (config.required && !value) return 'Campo obrigatório';

    // Skip further checks if empty and not required
    if (!value) return undefined;

    // Min/max length (string fields)
    if (v?.minLength && value.length < v.minLength) return `Mínimo ${v.minLength} caracteres`;
    if (v?.maxLength && value.length > v.maxLength) return `Máximo ${v.maxLength} caracteres`;

    // Min/max value (number)
    if (fieldType === 'number') {
        const num = Number(value);
        if (!isNaN(num)) {
            if (v?.min !== undefined && num < v.min) return `Valor mínimo: ${v.min}`;
            if (v?.max !== undefined && num > v.max) return `Valor máximo: ${v.max}`;
        }
    }

    // Date range validation
    if ((fieldType === 'date' || fieldType === 'datetime') && value) {
        if (v?.minDate && value < v.minDate) return `Data mínima: ${v.minDate}`;
        if (v?.maxDate && value > v.maxDate) return `Data máxima: ${v.maxDate}`;
    }

    // Regex
    if (v?.regex) {
        // Rejeita sintaxe /pattern/flags — new RegExp trata a barra como literal,
        // desabilitando silenciosamente a validação (e previne ReDoS por padrões maliciosos)
        if (/^\/.*\/[gimsuy]*$/.test(v.regex)) return undefined;
        try {
            if (!new RegExp(v.regex).test(value)) return v.regexMessage || 'Formato inválido';
        } catch {
            // Invalid regex, skip
        }
    }

    return undefined;
};
