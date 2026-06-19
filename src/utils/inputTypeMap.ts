/**
 * Map field types to HTML input types.
 */

const INPUT_TYPE_MAP: Record<string, string> = {
    texto: 'text',
    number: 'number',
    email: 'email',
    telefone: 'tel',
    cpf: 'text',
    cep: 'text',
    date: 'date',
    datetime: 'datetime-local',
};

/**
 * Get the HTML input type for a given field type.
 */
export const getInputType = (fieldType: string): string =>
    INPUT_TYPE_MAP[fieldType] || 'text';
