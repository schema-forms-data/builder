// Main barrel export for formBuilder
export { BuilderProvider, useBuilder, useBuilderExport, findParentContainer } from './BuilderContext';
export type { ContainersTree } from './BuilderContext';
export { ConfigPanel } from './configPanel';
export { LivePreview } from './preview';
export { RootDropZone as Canvas, DroppedStep, DroppedContainer, DroppedField, GridOverlay } from './canvas';
export { Palette } from './Palette';
export { builderToFormSchema, formSchemaToBuilder } from './schemaConverter';
export { FIELD_TYPES, STRUCTURE_TYPES, EVENT_VARIABLES, getItemType, getFieldMeta, getFieldMetaById } from './constants';
export type { ItemConfig, ItemCondition, ItemValidation, FieldOption, BuilderState, DndState, BuilderSnapshot, PositionDragState, ReorderDragState } from './types';
export { validateBuilderIntegrity } from './schemaConverter';
export type { BuilderValidationResult } from './schemaConverter';
export { DragGhost } from './DragGhost';
export { BuilderWrapper } from './BuilderWrapper';
export { BuilderDndContext } from './BuilderDndContext';
export { BuilderShell } from './BuilderShell';
