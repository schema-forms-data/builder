/**
 * Reusable 12-column grid overlay for visual positioning guidance.
 * Shown when items are being position-dragged or when selected.
 */

import type { PositionDragState } from "../types";

interface GridOverlayProps {
  /** Show the 12-column guide lines */
  showGuides?: boolean;
  /** Position drag state for ghost indicator */
  positionDrag?: PositionDragState | null;
}

export const GridOverlay = ({ showGuides, positionDrag }: GridOverlayProps) => {
  if (!showGuides && !positionDrag) return null;

  return (
    <>
      {/* 12-column guide lines */}
      {showGuides && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            padding: "inherit",
            gap: "inherit",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="border border-dashed border-muted-foreground/20 rounded-sm flex items-end justify-center pb-1"
            >
              <span className="text-[8px] text-muted-foreground/40 font-mono">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ghost indicator during position drag */}
      {positionDrag && (
        <div
          className="absolute pointer-events-none z-20 rounded-lg border-2 border-dashed border-destructive/60 bg-destructive/10"
          style={{
            top: "12px",
            bottom: "12px",
            left: `calc(${((positionDrag.ghostStart - 1) / 12) * 100}% + 12px)`,
            width: `calc(${(positionDrag.ghostSpan / 12) * 100}% - 8px)`,
            transition: "left 0.1s ease-out, width 0.1s ease-out",
          }}
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
            {positionDrag.ghostStart} →{" "}
            {positionDrag.ghostStart + positionDrag.ghostSpan - 1}
          </div>
        </div>
      )}
    </>
  );
};
