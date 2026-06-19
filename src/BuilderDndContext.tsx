/**
 * BuilderDndContext — encapsula todo o setup de DnD para o builder.
 *
 * Gerencia internamente:
 * - Sensores (PointerSensor)
 * - Estado do item ativo (DragOverlay)
 * - handleDragStart / handleDragEnd com toda a lógica de drag do builder
 *
 * Props:
 * - children: conteúdo do builder (deve estar dentro de BuilderWrapper)
 * - onError?: callback opcional para mensagens de erro (ex: preset sem step)
 *
 * Deve ser renderizado como descendente de <BuilderWrapper>.
 */
import { useState, type ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { getPresetById } from "@schema-forms-data/templates";
import { useBuilder, findParentContainer } from "./BuilderContext";
import { DragGhost } from "./DragGhost";

interface BuilderDndContextProps {
  children: ReactNode;
  onError?: (message: string) => void;
}

export const BuilderDndContext = ({
  children,
  onError,
}: BuilderDndContextProps) => {
  const {
    containers,
    addItem,
    addPresetBlock,
    moveCanvasItem,
    reorderInContainer,
  } = useBuilder();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [activeDrag, setActiveDrag] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
  } | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag({ data: event.active.data.current });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = active.data.current as any;
    const overId = String(over.id);

    if (data?.isPalettePreset) {
      const { presetId } = data as { presetId: string };
      const preset = getPresetById(presetId);
      if (!preset) return;
      if (overId.startsWith("zone-")) {
        const stepId = overId.slice(5);
        addPresetBlock(preset, stepId);
      } else if (overId === "root") {
        onError?.("Arraste o bloco sobre um step existente.");
      }
      return;
    }

    if (data?.isPaletteItem) {
      const { componentType } = data;
      if (overId === "root") {
        addItem(componentType, "root");
      } else if (overId.startsWith("zone-")) {
        addItem(componentType, overId.slice(5));
      }
      return;
    }

    if (data?.isCanvasItem) {
      const { type, id } = data;

      if (type === "step") {
        const rootChildren = containers.root?.children ?? [];
        const oldIdx = rootChildren.indexOf(id);
        const newIdx = rootChildren.indexOf(overId);
        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
          reorderInContainer("root", arrayMove(rootChildren, oldIdx, newIdx));
        }
        return;
      }

      if (type === "field") {
        const fromContainer = data.fromContainer as string;
        let toContainerId = fromContainer;
        let targetFieldId: string | null = null;

        if (overId.startsWith("zone-")) {
          toContainerId = overId.slice(5);
        } else {
          const parent = findParentContainer(overId, containers);
          if (parent) {
            toContainerId = parent;
            targetFieldId = overId;
          }
        }

        if (toContainerId === fromContainer && targetFieldId) {
          const children = containers[fromContainer]?.children ?? [];
          const oldIdx = children.indexOf(id);
          const newIdx = children.indexOf(targetFieldId);
          if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
            reorderInContainer(
              fromContainer,
              arrayMove(children, oldIdx, newIdx),
            );
          }
        } else if (toContainerId !== fromContainer) {
          const targetIdx = targetFieldId
            ? (containers[toContainerId]?.children ?? []).indexOf(targetFieldId)
            : -1;
          moveCanvasItem(
            id,
            fromContainer,
            toContainerId,
            targetIdx >= 0
              ? targetIdx
              : (containers[toContainerId]?.children?.length ?? 0),
          );
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeDrag ? <DragGhost data={activeDrag.data} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
