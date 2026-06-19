/**
 * Condition evaluation — shared between LivePreview and dynamicForm.
 */

import type { ItemCondition } from '../types';

/**
 * Evaluate whether a field should be visible based on its condition.
 * Returns true if visible (condition met or no condition).
 */
export const evaluateCondition = (
    condition: ItemCondition | undefined,
    formValues: Record<string, string>,
    eventoData?: Record<string, string>,
): boolean => {
    if (!condition || !condition.when) return true;

    const val = condition.source === 'evento'
        ? (eventoData?.[condition.when] || '')
        : (formValues[condition.when] || '');

    const numVal = parseFloat(val);
    const numTarget = parseFloat(condition.value || '');

    let result: boolean;
    switch (condition.operator) {
        case 'igual':
            result = val === (condition.value || '');
            break;
        case 'diferente':
            result = val !== (condition.value || '');
            break;
        case 'vazio':
            result = !val;
            break;
        case 'naoVazio':
            result = !!val;
            break;
        case 'contem':
            result = val.includes(condition.value || '');
            break;
        case 'naoContem':
            result = !val.includes(condition.value || '');
            break;
        case 'maiorQue':
            result = !isNaN(numVal) && !isNaN(numTarget) && numVal > numTarget;
            break;
        case 'menorQue':
            result = !isNaN(numVal) && !isNaN(numTarget) && numVal < numTarget;
            break;
        case 'maiorOuIgual':
            result = !isNaN(numVal) && !isNaN(numTarget) && numVal >= numTarget;
            break;
        case 'menorOuIgual':
            result = !isNaN(numVal) && !isNaN(numTarget) && numVal <= numTarget;
            break;
        default:
            result = true;
    }

    // AND/OR combinado com condi\u00e7\u00f5es extra
    if (condition.logicOperator && condition.extraConditions?.length) {
        const extras = condition.extraConditions.map((ec) =>
            evaluateCondition(ec, formValues, eventoData),
        );
        return condition.logicOperator === 'and'
            ? result && extras.every(Boolean)
            : result || extras.some(Boolean);
    }

    return result;
};
