/**
 * Shared tree traversal utilities for navigating the DnD state tree.
 * Used by both LivePreview and schemaConverter to avoid duplication.
 */

import type { ItemConfig, DndState } from '../types';
import { getItemType } from '../constants';

// ============================================
// Preview Data Types
// ============================================

export interface PreviewField {
    id: string;
    config: ItemConfig;
    /** Populated for field_array fields: sub-fields from the containers tree */
    subFields?: PreviewField[];
}

export interface PreviewContainer {
    id: string;
    config: ItemConfig;
    fields: PreviewField[];
}

export interface PreviewStep {
    id: string;
    config: ItemConfig;
    containers: PreviewContainer[];
}

// ============================================
// Tree Traversal
// ============================================

/**
 * Build preview-friendly data from DnD state + builder configs.
 * Walks root → steps → containers → fields.
 */
export const buildPreviewData = (
    dndState: DndState | null | undefined,
    getConfig: (id: string) => ItemConfig,
): PreviewStep[] => {
    const rootChildren = dndState?.containers?.root?.children || [];
    const steps: PreviewStep[] = [];

    for (const childId of rootChildren) {
        if (getItemType(childId) !== 'step') continue;
        const stepContainerChildren = dndState?.containers?.[childId]?.children || [];
        const containers: PreviewContainer[] = [];

        for (const contId of stepContainerChildren) {
            if (getItemType(contId) !== 'container') continue;
            const fieldIds = dndState?.containers?.[contId]?.children || [];
            const fields: PreviewField[] = fieldIds
                .filter((fId: string) => getItemType(fId) === 'field')
                .map((fId: string) => {
                    const config = getConfig(fId);
                    const field: PreviewField = { id: fId, config };
                    // field_array: read sub-fields from the containers tree
                    if (config.fieldType === 'field_array') {
                        const subIds = dndState?.containers?.[fId]?.children ?? [];
                        field.subFields = subIds
                            .filter((sfId: string) => getItemType(sfId) === 'field')
                            .map((sfId: string) => ({ id: sfId, config: getConfig(sfId) }));
                    }
                    return field;
                });
            containers.push({ id: contId, config: getConfig(contId), fields });
        }

        steps.push({ id: childId, config: getConfig(childId), containers });
    }
    return steps;
};

/**
 * Collect all field IDs by walking the DnD tree from root.
 */
export const collectAllFieldIds = (dndState: DndState | null | undefined): string[] => {
    if (!dndState?.containers) return [];
    const ids: string[] = [];
    const walk = (containerId: string) => {
        const children = dndState.containers[containerId]?.children || [];
        for (const cid of children) {
            if (getItemType(cid) === 'field') {
                ids.push(cid);
            }
            if (dndState.containers[cid]) walk(cid);
        }
    };
    walk('root');
    return ids;
};

/**
 * Find the parent container ID for a given item in the DnD tree.
 */
export const findParentId = (
    dndState: DndState | null | undefined,
    itemId: string,
): string | undefined => {
    if (!dndState?.containers) return undefined;
    return Object.keys(dndState.containers).find(
        (key) => dndState.containers[key]?.children?.includes(itemId),
    );
};
