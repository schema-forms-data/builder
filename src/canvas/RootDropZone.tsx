/**
 * RootDropZone — dnd-kit migration.
 * SortableContext para reordenar steps; useDroppable id="root" para drops da paleta.
 */

import { Layers } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBuilder } from "../BuilderContext";
import { DroppedStep } from "./DroppedStep";
import { getItemType } from "../constants";
import { DroppedContainer } from "./DroppedContainer";
import { DroppedField } from "./DroppedField";

export const RootDropZone = () => {
  const { containers, setSelected } = useBuilder();
  const children = containers.root?.children ?? [];
  const stepIds = children.filter((id) => getItemType(id) === "step");
  const { setNodeRef, isOver } = useDroppable({ id: "root" });

  return (
    <div
      ref={setNodeRef}
      onClick={() => setSelected(null)}
      className={`min-h-[500px] rounded-xl border p-4 space-y-4 transition-all duration-150 ${
        isOver
          ? "bg-primary/10 border-primary/60 ring-2 ring-primary/30 shadow-[0_0_0_4px_theme(colors.primary/10%)]"
          : "border-border/40"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle, hsl(var(--muted-foreground) / 0.12) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundColor: isOver ? undefined : "hsl(var(--muted) / 0.3)",
      }}
    >
      {children.length === 0 && (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/50">
              Arraste <strong>Steps</strong> da paleta para cá
            </p>
          </div>
        </div>
      )}
      <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
        {children.map((childId, idx) => {
          const type = getItemType(childId);
          if (type === "step")
            return (
              <DroppedStep
                key={childId}
                id={childId}
                container="root"
                index={idx}
              />
            );
          if (type === "container")
            return (
              <DroppedContainer key={childId} id={childId} container="root" />
            );
          return <DroppedField key={childId} id={childId} container="root" />;
        })}
      </SortableContext>
    </div>
  );
};
