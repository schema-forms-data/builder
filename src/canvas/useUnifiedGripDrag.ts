/**
 * useUnifiedGripDrag — Single grip handle that detects drag direction.
 *
 * - Horizontal (|dx| > |dy|) → position drag (change inicioColuna)
 * - Vertical   (|dy| > |dx|) → reorder drag
 *
 * For fields: vertical reorder triggers DDF's DRAG_START via useDispatch.
 * For containers: vertical reorder uses the custom sibling-swap logic.
 *
 * Dead zone: 5px before any drag is committed.
 */

import { useCallback, useRef, useEffect } from "react";
import type { PositionDragState, ReorderDragState } from "../types";

// ── Reorder strategies ──────────────────────────────────────────────

/** Custom reorder — swaps among siblings via moveItemNoSnapshot */
export interface CustomReorderStrategy {
    kind: "custom";
    /** Move without pushing an undo snapshot (called many times during drag) */
    moveItemNoSnapshot: (id: string, direction: "up" | "down") => void;
    /** Push a single undo snapshot — called once when drag starts */
    pushSnapshot: () => void;
    setReorderDrag: (v: ReorderDragState | null) => void;
    /** data attribute used to identify siblings, e.g. 'data-container-id' */
    dataAttribute?: string;
}

export type ReorderStrategy = CustomReorderStrategy;

// ── Hook options ────────────────────────────────────────────────────

interface UseUnifiedGripDragOptions {
    id: string;
    /** Ref to the element being dragged (used to compute grid column width) */
    elementRef: React.RefObject<HTMLDivElement | null>;
    tamanho: number;
    inicioColuna: number;
    /** Called when the horizontal position drag ends with a new inicioColuna */
    onPositionApply: (inicioColuna: number) => void;
    setPositionDrag: (v: PositionDragState | null) => void;
    setSelected: (id: string) => void;
    reorderStrategy: ReorderStrategy;
}

interface UseUnifiedGripDragReturn {
    handleGripMouseDown: (e: React.MouseEvent) => void;
}

const DEAD_ZONE = 5;

export const useUnifiedGripDrag = ({
    id,
    elementRef,
    tamanho,
    inicioColuna,
    onPositionApply,
    setPositionDrag,
    setSelected,
    reorderStrategy,
}: UseUnifiedGripDragOptions): UseUnifiedGripDragReturn => {
    // Mutable ref to avoid stale closure issues with rapidly changing inicioColuna
    const latestRef = useRef({ inicioColuna, tamanho });
    latestRef.current = { inicioColuna, tamanho };
    const activeCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => { activeCleanupRef.current?.(); }, []);

    const handleGripMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setSelected(id);

            const startX = e.clientX;
            const startY = e.clientY;
            let resolved = false;

            const cleanup = () => {
                activeCleanupRef.current = null;
                window.removeEventListener("mousemove", onFirstMove);
                window.removeEventListener("mouseup", onUpEarly);
            };

            // ── First move: decide direction ──────────────────────────
            const onFirstMove = (me: MouseEvent) => {
                const dx = Math.abs(me.clientX - startX);
                const dy = Math.abs(me.clientY - startY);
                if (dx < DEAD_ZONE && dy < DEAD_ZONE) return; // still in dead zone
                resolved = true;
                cleanup();

                if (dx >= dy) {
                    // ─── Horizontal → position drag ───────────────────────
                    startPositionDrag(me);
                } else {
                    // ─── Vertical → reorder ───────────────────────────────
                    startReorder(me);
                }
            };

            // If user releases without moving past dead zone → just a click (select)
            const onUpEarly = () => {
                if (!resolved) cleanup();
            };

            window.addEventListener("mousemove", onFirstMove);
            window.addEventListener("mouseup", onUpEarly);
            activeCleanupRef.current = cleanup;

            // ── Position drag (horizontal) ────────────────────────────
            const startPositionDrag = (initialMoveEvent: MouseEvent) => {
                const el = elementRef.current;
                if (!el) return;
                const parentEl = el.parentElement;
                if (!parentEl) return;

                const parentRect = parentEl.getBoundingClientRect();
                const parentWidth = parentRect.width;
                const colWidth = parentWidth / 12;
                const { tamanho: curTamanho } = latestRef.current;

                // Use actual DOM position as truth — config.inicioColuna may be
                // wrong if the container was auto-placed by the CSS grid.
                const elRect = el.getBoundingClientRect();
                const relativeLeft = elRect.left - parentRect.left;
                const curInicio = Math.max(
                    1,
                    Math.min(12, Math.round(relativeLeft / colWidth) + 1),
                );

                // Anchor startX to the left edge of the element so deltaCols is
                // always relative to the element's actual visual start, not to
                // the grip pixel where the mouse happened to be.
                const anchorX = elRect.left;

                setPositionDrag({
                    itemId: id,
                    ghostStart: curInicio,
                    ghostSpan: curTamanho,
                    cursorX: initialMoveEvent.clientX,
                    cursorY: initialMoveEvent.clientY,
                });

                const calcNewInicio = (clientX: number) => {
                    const dx = clientX - anchorX;
                    const newCol = Math.round(dx / colWidth) + 1;
                    return Math.max(1, Math.min(13 - curTamanho, newCol));
                };

                // Process the initial move event that triggered direction decision
                setPositionDrag({
                    itemId: id,
                    ghostStart: calcNewInicio(initialMoveEvent.clientX),
                    ghostSpan: curTamanho,
                    cursorX: initialMoveEvent.clientX,
                    cursorY: initialMoveEvent.clientY,
                });

                const onMove = (me: MouseEvent) => {
                    setPositionDrag({
                        itemId: id,
                        ghostStart: calcNewInicio(me.clientX),
                        ghostSpan: curTamanho,
                        cursorX: me.clientX,
                        cursorY: me.clientY,
                    });
                };

                const onUp = (me: MouseEvent) => {
                    onPositionApply(calcNewInicio(me.clientX));
                    setPositionDrag(null);
                    activeCleanupRef.current = null;
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
                activeCleanupRef.current = () => {
                    setPositionDrag(null);
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                };
            };

            // ── Reorder (vertical) ────────────────────────────────────
            const startReorder = (_initialMoveEvent: MouseEvent) => {
                // Custom reorder (for containers)
                const strategy = reorderStrategy;
                const el = elementRef.current;
                if (!el) return;
                const parentEl = el.parentElement;
                if (!parentEl) return;
                const dataAttr = strategy.dataAttribute || "data-container-id";

                // Push undo snapshot once at drag start (not per-swap)
                strategy.pushSnapshot();
                strategy.setReorderDrag({ draggingId: id });
                let lastSwapY = _initialMoveEvent.clientY;

                const onMove = (me: MouseEvent) => {
                    const siblings = Array.from(parentEl.children).filter(
                        (child) => child !== el && child.getAttribute(dataAttr),
                    ) as HTMLElement[];

                    for (const sibling of siblings) {
                        const rect = sibling.getBoundingClientRect();
                        const midY = rect.top + rect.height / 2;

                        if (
                            me.clientY < midY &&
                            me.clientY > rect.top &&
                            me.clientY < lastSwapY
                        ) {
                            strategy.moveItemNoSnapshot(id, "up");
                            lastSwapY = me.clientY;
                            break;
                        } else if (
                            me.clientY > midY &&
                            me.clientY < rect.bottom &&
                            me.clientY > lastSwapY
                        ) {
                            strategy.moveItemNoSnapshot(id, "down");
                            lastSwapY = me.clientY;
                            break;
                        }
                    }
                };

                const onUp = () => {
                    strategy.setReorderDrag(null);
                    activeCleanupRef.current = null;
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                };

                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
                activeCleanupRef.current = () => {
                    strategy.setReorderDrag(null);
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                };
            };
        },
        [id, elementRef, onPositionApply, setPositionDrag, setSelected, reorderStrategy],
    );

    return { handleGripMouseDown };
};
