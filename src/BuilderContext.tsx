/**
 * BuilderContext — dnd-kit migration.
 *
 * Now owns the full builder state:
 *  - containers tree  (no more @data-driven-forms/dnd dependency)
 *  - configs map
 *  - undo/redo history (snapshots containers + configs together)
 *
 * Tree mutations (add, move, remove, reorder) are all self-contained.
 * O renderer final usa react-hook-form — este contexto concerne apenas o canvas do builder.
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ItemConfig, PositionDragState, ReorderDragState } from "./types";
import { getItemType } from "./constants";
import {
  builderToFormSchema,
  validateBuilderIntegrity,
} from "./schemaConverter";
import { v4Fallback } from "@schema-forms-data/core";
import type {
  PresetBlock,
  PresetStepBlock,
  FormStepConfig,
} from "@schema-forms-data/core";

// ---------------------------------------------------------------------------
// State & snapshot types (self-contained, no DFF DnD)
// ---------------------------------------------------------------------------

export interface ContainersTree {
  [id: string]: { children: string[] };
}

interface FullBuilderState {
  selectedId: string | null;
  configs: Record<string, ItemConfig>;
  showPreview: boolean;
  containers: ContainersTree;
  previewTemplateId: string;
  stepConfig: FormStepConfig;
}

interface BuilderHistorySnapshot {
  containers: ContainersTree;
  configs: Record<string, ItemConfig>;
}

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

interface BuilderContextValue {
  // State
  selectedId: string | null;
  configs: Record<string, ItemConfig>;
  showPreview: boolean;
  containers: ContainersTree;
  positionDrag: PositionDragState | null;
  reorderDrag: ReorderDragState | null;
  canUndo: boolean;
  canRedo: boolean;
  /** ID do FormSchema sendo editado — disponível após o primeiro save. Usado pelo FieldConfig para uploads. */
  schemaId: string | undefined;
  /** Função injetada para fazer upload de PDF de termos. Recebe o arquivo e retorna o uploadId. */
  uploadTermsPdf?: (
    file: File,
    schemaId: string,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  /** Função injetada para deletar um PDF de termos pelo uploadId. */
  deleteTermsPdf?: (uploadId: string, schemaId: string) => Promise<void>;
  /** Template selecionado no preview do builder (apenas visual, não persistido no schema) */
  previewTemplateId: string;
  setPreviewTemplateId: (id: string) => void;
  /** Config de step override do formulário (sobrescreve o template). */
  stepConfig: FormStepConfig;
  updateStepConfig: (partial: FormStepConfig) => void;
  // Selectors
  getConfig: (id: string) => ItemConfig;
  getAllFieldIds: () => string[];
  // Mutations — configs
  setSelected: (id: string | null) => void;
  updateConfig: (id: string, partial: Partial<ItemConfig>) => void;
  setShowPreview: (v: boolean) => void;
  // Mutations — tree
  addItem: (
    componentType: string,
    containerId: string,
    atIndex?: number,
  ) => string;
  /** Insere um bloco pré-configurado (preset) dentro de um step */
  addPresetBlock: (block: PresetBlock, stepId: string) => string;
  /** Insere múltiplos steps pré-configurados de uma vez (ex: Participação + Pagamento) */
  addPresetStepBlock: (block: PresetStepBlock) => string[];
  moveCanvasItem: (
    itemId: string,
    fromContainerId: string,
    toContainerId: string,
    atIndex: number,
  ) => void;
  reorderInContainer: (containerId: string, newChildren: string[]) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, direction: "up" | "down") => void;
  moveItemNoSnapshot: (id: string, direction: "up" | "down") => void;
  // Drag UI state
  setPositionDrag: (v: PositionDragState | null) => void;
  setReorderDrag: (v: ReorderDragState | null) => void;
  // History
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;
}

const BuilderContext = createContext<BuilderContextValue | null>(null);

// ---------------------------------------------------------------------------
// Default config factory
// ---------------------------------------------------------------------------

const deriveFieldType = (id: string): string => {
  if (id.startsWith("step")) return "step";
  if (id.startsWith("container")) return "container";
  const match = id.match(/^([a-z_]+)-/);
  return match ? match[1] : id.split("-")[0];
};

export const defaultConfig = (id: string, fieldType?: string): ItemConfig => {
  const type = fieldType || deriveFieldType(id);
  const isStep = type === "step";
  const isContainer = type === "container";
  const isFieldArray = type === "field_array";
  return {
    label: isStep
      ? "Novo Step"
      : isContainer
        ? "Novo Container"
        : isFieldArray
          ? "Lista de itens"
          : type || id,
    name: id,
    fieldType: type || "texto",
    required: false,
    columns: 2,
    tamanho: isContainer || isFieldArray ? 12 : isStep ? undefined : 6,
    showLabel: isContainer ? true : undefined,
    itemLabel: isFieldArray ? "Item" : undefined,
  };
};

// ---------------------------------------------------------------------------
// Provider props
// ---------------------------------------------------------------------------

interface BuilderProviderProps {
  children: React.ReactNode;
  initialConfigs?: Record<string, ItemConfig>;
  initialContainers?: ContainersTree;
  /** Template visual inicial carregado do schema salvo. */
  initialTemplateId?: string;
  /** Config de step inicial carregada do schema salvo. */
  initialStepConfig?: FormStepConfig;
  /** ID do FormSchema sendo editado. Passado pelo BuilderWrapper assim que o schema tem ID. */
  schemaId?: string;
  /** Função injetada para fazer upload de PDF de termos. Recebe o arquivo e retorna o uploadId. */
  uploadTermsPdf?: (
    file: File,
    schemaId: string,
    onProgress?: (pct: number) => void,
  ) => Promise<string>;
  /** Função injetada para deletar um PDF de termos pelo uploadId. */
  deleteTermsPdf?: (uploadId: string, schemaId: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// History helpers
// ---------------------------------------------------------------------------

const MAX_HISTORY = 50;

const cloneSnapshot = (s: FullBuilderState): BuilderHistorySnapshot =>
  typeof structuredClone === "function"
    ? {
        containers: structuredClone(s.containers),
        configs: structuredClone(s.configs),
      }
    : {
        containers: JSON.parse(JSON.stringify(s.containers)),
        configs: JSON.parse(JSON.stringify(s.configs)),
      };

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

/** Collect all descendant IDs of an item (including itself) */
const collectDescendants = (
  id: string,
  containers: ContainersTree,
): string[] => {
  const result: string[] = [id];
  const cont = containers[id];
  if (cont?.children) {
    for (const cid of cont.children) {
      result.push(...collectDescendants(cid, containers));
    }
  }
  return result;
};

/** Find the parent container ID of an item */
export const findParentContainer = (
  itemId: string,
  containers: ContainersTree,
): string | null => {
  for (const [cid, cont] of Object.entries(containers)) {
    if (cont.children.includes(itemId)) return cid;
  }
  return null;
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const BuilderProvider: React.FC<BuilderProviderProps> = ({
  children,
  initialConfigs,
  initialContainers,
  initialTemplateId,
  initialStepConfig,
  schemaId,
  uploadTermsPdf,
  deleteTermsPdf,
}) => {
  const [state, setState] = useState<FullBuilderState>({
    selectedId: null,
    configs: initialConfigs || {},
    showPreview: false,
    containers: initialContainers ?? { root: { children: [] } },
    previewTemplateId: initialTemplateId || "moderno",
    stepConfig: initialStepConfig ?? {},
  });
  const [positionDrag, setPositionDrag] = useState<PositionDragState | null>(
    null,
  );
  const [reorderDrag, setReorderDrag] = useState<ReorderDragState | null>(null);

  // ---- Undo / Redo stacks ----
  const undoStack = useRef<BuilderHistorySnapshot[]>([]);
  const redoStack = useRef<BuilderHistorySnapshot[]>([]);

  // Push snapshot INSIDE a setState updater so it always captures current state
  const pushSnapshotFromState = (s: FullBuilderState) => {
    undoStack.current = [
      ...undoStack.current.slice(-MAX_HISTORY + 1),
      cloneSnapshot(s),
    ];
    redoStack.current = [];
  };

  // Public pushSnapshot (for external callers like custom drag hooks)
  const pushSnapshot = useCallback(() => {
    setState((s) => {
      pushSnapshotFromState(s);
      return { ...s }; // spread forces re-render so canUndo/canRedo update in context
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;
    setState((s) => {
      // Save current as redo
      redoStack.current = [...redoStack.current, cloneSnapshot(s)];
      const prev = undoStack.current.pop()!;
      return { ...s, containers: prev.containers, configs: prev.configs };
    });
  }, []);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    setState((s) => {
      undoStack.current = [...undoStack.current, cloneSnapshot(s)];
      const next = redoStack.current.pop()!;
      return { ...s, containers: next.containers, configs: next.configs };
    });
  }, []);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (isMod && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (isMod && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ---- Selectors ----
  const getConfig = useCallback(
    (id: string): ItemConfig => state.configs[id] ?? defaultConfig(id),
    [state.configs],
  );

  const getAllFieldIds = useCallback((): string[] => {
    const ids: string[] = [];
    const walk = (containerId: string) => {
      const children = state.containers[containerId]?.children ?? [];
      for (const cid of children) {
        if (getItemType(cid) === "field") {
          ids.push(cid);
          // Don't recurse into field_array: sub-fields are not top-level condition targets
        } else if (state.containers[cid]) {
          walk(cid);
        }
      }
    };
    walk("root");
    return ids;
  }, [state.containers]);

  // ---- Config mutations ----
  const setSelected = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedId: id }));
  }, []);

  const setShowPreview = useCallback((v: boolean) => {
    setState((s) => ({ ...s, showPreview: v }));
  }, []);

  const setPreviewTemplateId = useCallback((id: string) => {
    setState((s) => ({ ...s, previewTemplateId: id }));
  }, []);

  const updateStepConfig = useCallback((partial: FormStepConfig) => {
    setState((s) => ({ ...s, stepConfig: { ...s.stepConfig, ...partial } }));
  }, []);

  const updateConfig = useCallback(
    (id: string, partial: Partial<ItemConfig>) => {
      setState((s) => ({
        ...s,
        configs: {
          ...s.configs,
          [id]: { ...(s.configs[id] ?? defaultConfig(id)), ...partial },
        },
      }));
    },
    [],
  );

  // ---- Tree mutations ----

  /** Add a new palette item to a container at an optional index */
  const addItem = useCallback(
    (componentType: string, containerId: string, atIndex?: number): string => {
      const newId = `${componentType}-${v4Fallback()}`;
      const itemType = getItemType(newId);

      setState((s) => {
        pushSnapshotFromState(s);

        const newContainers = { ...s.containers };

        // Steps, containers AND field_arrays can hold children
        if (
          itemType === "step" ||
          itemType === "container" ||
          componentType === "field_array"
        ) {
          newContainers[newId] = { children: [] };
        }

        // Insert into parent
        const parentChildren = [
          ...(newContainers[containerId]?.children ?? []),
        ];
        if (atIndex !== undefined && atIndex >= 0) {
          parentChildren.splice(atIndex, 0, newId);
        } else {
          parentChildren.push(newId);
        }
        newContainers[containerId] = { children: parentChildren };

        return {
          ...s,
          containers: newContainers,
          configs: {
            ...s.configs,
            [newId]: defaultConfig(newId, componentType),
          },
          selectedId: newId,
        };
      });

      return newId;
    },
    [],
  );

  /** Insere um bloco pré-configurado (todos os campos de uma vez) */
  const addPresetBlock = useCallback(
    (block: PresetBlock, stepId: string): string => {
      const containerId = `container-${v4Fallback()}`;

      setState((s) => {
        pushSnapshotFromState(s);

        const newContainers = { ...s.containers };
        const newConfigs = { ...s.configs };

        // Gera IDs e configs dos campos
        const fieldIds: string[] = [];
        for (const ft of block.containerTemplate.campos) {
          // Campos locked mantêm o ID fixo; demais recebem UUID novo.
          // Guard: se ft.id for undefined apesar de locked, gera um UUID para evitar chave undefined.
          const fieldId =
            ft.locked && ft.id
              ? ft.id
              : `${String(ft.tipo).toLowerCase()}-${v4Fallback()}`;

          fieldIds.push(fieldId);
          newConfigs[fieldId] = {
            label: ft.label,
            name: ft.locked ? ft.id : ft.nome,
            fieldType: ft.tipo,
            required: ft.obrigatorio || false,
            placeholder: ft.placeholder,
            hint: ft.hint,
            tamanho: ft.tamanho || 6,
            inicioColuna: ft.inicioColuna,
            defaultValue:
              ft.defaultValue != null ? String(ft.defaultValue) : undefined,
            locked: ft.locked || false,
            options: ft.opcoes?.map((o) => ({
              value: o.valor,
              label: o.label,
            })),
            // field_array metadata
            ...(ft.tipo === "field_array" && {
              itemLabel: ft.itemLabel,
              minItems: ft.minItems,
              maxItems: ft.maxItems,
              addLabel: ft.addLabel,
            }),
          };

          // Se for field_array, cria container de sub-campos
          if (ft.tipo === "field_array") {
            const subFieldIds: string[] = [];
            for (const sf of ft.subFields ?? []) {
              const sfId = `${String(sf.tipo).toLowerCase()}-${v4Fallback()}`;
              subFieldIds.push(sfId);
              newConfigs[sfId] = {
                label: sf.label,
                name: sf.nome,
                fieldType: sf.tipo,
                required: sf.obrigatorio || false,
                placeholder: sf.placeholder,
                hint: sf.hint,
                tamanho: sf.tamanho || 6,
                inicioColuna: sf.inicioColuna,
                options: sf.opcoes?.map((o) => ({
                  value: o.valor,
                  label: o.label,
                })),
              };
            }
            newContainers[fieldId] = { children: subFieldIds };
          }
        }

        // Container
        newContainers[containerId] = { children: fieldIds };
        newConfigs[containerId] = {
          label: block.containerTemplate.titulo || block.name,
          description: block.containerTemplate.descricao,
          icone: block.containerTemplate.icone,
          tamanho: block.containerTemplate.tamanho || 12,
          inicioColuna: block.containerTemplate.inicioColuna,
          showLabel: true,
        };

        // Insere container no step
        const stepChildren = [...(newContainers[stepId]?.children ?? [])];
        stepChildren.push(containerId);
        newContainers[stepId] = { children: stepChildren };

        return {
          ...s,
          containers: newContainers,
          configs: newConfigs,
          selectedId: containerId,
        };
      });

      return containerId;
    },
    [],
  );

  /** Insere múltiplos steps pré-configurados de uma vez */
  const addPresetStepBlock = useCallback((block: PresetStepBlock): string[] => {
    const createdStepIds: string[] = [];

    setState((s) => {
      pushSnapshotFromState(s);

      const newContainers = { ...s.containers };
      const newConfigs = { ...s.configs };

      for (const stepTemplate of block.steps) {
        const stepId = `step-${v4Fallback()}`;
        createdStepIds.push(stepId);

        const containerIds: string[] = [];

        for (const ct of stepTemplate.containers) {
          const containerId = `container-${v4Fallback()}`;
          containerIds.push(containerId);

          const fieldIds: string[] = [];
          for (const ft of ct.campos) {
            // Campos locked mantêm o ID fixo; demais recebem UUID novo.
            // Guard: se ft.id for undefined apesar de locked, gera um UUID para evitar chave undefined.
            const fieldId =
              ft.locked && ft.id
                ? ft.id
                : `${String(ft.tipo).toLowerCase()}-${v4Fallback()}`;

            fieldIds.push(fieldId);
            newConfigs[fieldId] = {
              label: ft.label,
              name: ft.locked ? ft.id : ft.nome,
              fieldType: ft.tipo,
              required: ft.obrigatorio || false,
              placeholder: ft.placeholder,
              hint: ft.hint,
              tamanho: ft.tamanho || 12,
              inicioColuna: ft.inicioColuna,
              defaultValue:
                ft.defaultValue != null ? String(ft.defaultValue) : undefined,
              locked: ft.locked || false,
              options: ft.opcoes?.map((o) => ({
                value: o.valor,
                label: o.label,
              })),
              // field_array metadata
              ...(ft.tipo === "field_array" && {
                itemLabel: ft.itemLabel,
                minItems: ft.minItems,
                maxItems: ft.maxItems,
                addLabel: ft.addLabel,
              }),
            };

            // Só field_array precisa de entrada no mapa de containers
            if (ft.tipo === "field_array") {
              const subFieldIds: string[] = [];
              for (const sf of ft.subFields ?? []) {
                const sfId = `${String(sf.tipo).toLowerCase()}-${v4Fallback()}`;
                subFieldIds.push(sfId);
                newConfigs[sfId] = {
                  label: sf.label,
                  name: sf.nome,
                  fieldType: sf.tipo,
                  required: sf.obrigatorio || false,
                  placeholder: sf.placeholder,
                  hint: sf.hint,
                  tamanho: sf.tamanho || 6,
                  inicioColuna: sf.inicioColuna,
                  options: sf.opcoes?.map((o) => ({
                    value: o.valor,
                    label: o.label,
                  })),
                };
              }
              newContainers[fieldId] = { children: subFieldIds };
            }
          }

          newContainers[containerId] = { children: fieldIds };
          newConfigs[containerId] = {
            label: ct.titulo,
            description: ct.descricao,
            icone: ct.icone,
            tamanho: (ct as { tamanho?: number }).tamanho || 12,
            showLabel: true,
          };
        }

        newContainers[stepId] = { children: containerIds };
        newConfigs[stepId] = {
          label: stepTemplate.titulo,
          description: stepTemplate.descricao,
          icone: stepTemplate.icone,
        };

        // Insere step no root
        const rootChildren = [
          ...(newContainers["root"]?.children ?? []),
          stepId,
        ];
        newContainers["root"] = { children: rootChildren };
      }

      return {
        ...s,
        containers: newContainers,
        configs: newConfigs,
        selectedId: createdStepIds[0] ?? s.selectedId,
      };
    });

    return createdStepIds;
  }, []);

  /** Move an existing canvas item across or within containers */
  const moveCanvasItem = useCallback(
    (
      itemId: string,
      fromContainerId: string,
      toContainerId: string,
      atIndex: number,
    ) => {
      setState((s) => {
        pushSnapshotFromState(s);

        const newContainers = { ...s.containers };

        // Remove from source
        const fromChildren = (
          newContainers[fromContainerId]?.children ?? []
        ).filter((c) => c !== itemId);
        newContainers[fromContainerId] = { children: fromChildren };

        // Insert into target
        const toChildren = [
          ...(newContainers[toContainerId]?.children ?? []).filter(
            (c) => c !== itemId,
          ),
        ];
        const safeIndex = Math.max(0, Math.min(atIndex, toChildren.length));
        toChildren.splice(safeIndex, 0, itemId);
        newContainers[toContainerId] = { children: toChildren };

        return { ...s, containers: newContainers };
      });
    },
    [],
  );

  /** Replace children array for a container (used by sortable onDragEnd) */
  const reorderInContainer = useCallback(
    (containerId: string, newChildren: string[]) => {
      setState((s) => {
        pushSnapshotFromState(s);
        return {
          ...s,
          containers: {
            ...s.containers,
            [containerId]: { children: newChildren },
          },
        };
      });
    },
    [],
  );

  /** Remove item and all its descendants from the tree */
  const removeItem = useCallback((id: string) => {
    setState((s) => {
      pushSnapshotFromState(s);

      const allIds = collectDescendants(id, s.containers);
      const newContainers: ContainersTree = {};

      for (const [cid, cont] of Object.entries(s.containers)) {
        if (allIds.includes(cid)) continue; // remove this container entry
        newContainers[cid] = {
          // Filtra qualquer descendente (não apenas o root) para evitar referências órfãs
          children: cont.children.filter((c) => !allIds.includes(c)),
        };
      }

      const newConfigs = { ...s.configs };
      for (const did of allIds) delete newConfigs[did];

      return {
        ...s,
        containers: newContainers,
        configs: newConfigs,
        selectedId: allIds.includes(s.selectedId ?? "") ? null : s.selectedId,
      };
    });
  }, []);

  const moveItemNoSnapshot = useCallback(
    (id: string, direction: "up" | "down") => {
      setState((s) => {
        const parentKey = findParentContainer(id, s.containers);
        if (!parentKey) return s;

        const children = [...s.containers[parentKey].children];
        const idx = children.indexOf(id);
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= children.length) return s;
        [children[idx], children[swapIdx]] = [children[swapIdx], children[idx]];

        return {
          ...s,
          containers: { ...s.containers, [parentKey]: { children } },
        };
      });
    },
    [],
  );

  const moveItem = useCallback(
    (id: string, direction: "up" | "down") => {
      pushSnapshot();
      moveItemNoSnapshot(id, direction);
    },
    [moveItemNoSnapshot, pushSnapshot],
  );

  return (
    <BuilderContext.Provider
      value={{
        selectedId: state.selectedId,
        configs: state.configs,
        showPreview: state.showPreview,
        containers: state.containers,
        positionDrag,
        reorderDrag,
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
        schemaId,
        uploadTermsPdf,
        deleteTermsPdf,
        previewTemplateId: state.previewTemplateId,
        setPreviewTemplateId,
        stepConfig: state.stepConfig,
        updateStepConfig,
        getConfig,
        getAllFieldIds,
        setSelected,
        updateConfig,
        setShowPreview,
        addItem,
        addPresetBlock,
        addPresetStepBlock,
        moveCanvasItem,
        reorderInContainer,
        removeItem,
        moveItem,
        moveItemNoSnapshot,
        setPositionDrag,
        setReorderDrag,
        undo,
        redo,
        pushSnapshot,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be inside BuilderProvider");
  return ctx;
};

/**
 * Hook de conveniência que encapsula a exportação e validação do schema.
 * Lê automaticamente `containers`, `configs` e `stepConfig` do contexto —
 * elimina o risco de esquecer de passar `stepConfig` manualmente.
 *
 * @example
 * ```ts
 * const { buildSchema, validate } = useBuilderExport();
 *
 * const { errors, warnings } = validate();
 * if (errors.length > 0) { showError(errors.join('\n')); return; }
 *
 * const schema = buildSchema({ nome, status, template, id });
 * await api.save(schema);
 * ```
 */
export const useBuilderExport = () => {
  const { containers, configs, stepConfig } = useBuilder();
  const buildSchema = useCallback(
    (meta: Omit<Parameters<typeof builderToFormSchema>[2], "stepConfig">) =>
      builderToFormSchema({ containers }, configs, { ...meta, stepConfig }),
    [containers, configs, stepConfig],
  );
  const validate = useCallback(
    () => validateBuilderIntegrity({ containers }, configs),
    [containers, configs],
  );
  return { buildSchema, validate };
};
