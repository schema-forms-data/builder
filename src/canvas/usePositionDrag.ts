/**
 * usePositionDrag — horizontal-only position drag (changes inicioColuna).
 * Used by DroppedField (and anything that needs ONLY position drag, not reorder).
 *
 * The grip element should be a dedicated handle; the existing sortable grip
 * is kept untouched so dnd-kit still handles reorder/cross-container moves.
 */

import { useCallback, useRef, useEffect } from "react";
import type { PositionDragState } from "../types";

interface UsePositionDragOptions {
    id: string;
    /** Ref to the field/container element itself (to read its real DOM position) */
    elementRef: React.RefObject<HTMLDivElement | null>;
    onPositionApply: (inicioColuna: number) => void;
    setPositionDrag: (v: PositionDragState | null) => void;
    setSelected: (id: string) => void;
    /** Called once at drag start to push an undo snapshot */
    pushSnapshot?: () => void;
}

export const usePositionDrag = ({
    id,
    elementRef,
    onPositionApply,
    setPositionDrag,
    setSelected,
    pushSnapshot,
}: UsePositionDragOptions) => {
    const activeCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => { activeCleanupRef.current?.(); }, []);

    const handlePositionMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            pushSnapshot?.();
            setSelected(id);

            const el = elementRef.current;
            if (!el) return;
            const parentEl = el.parentElement;
            if (!parentEl) return;

            const parentRect = parentEl.getBoundingClientRect();
            const colWidth = parentRect.width / 12;

            // Read actual span from DOM so we don't rely on stale config
            const elRect = el.getBoundingClientRect();
            const curSpan = Math.max(1, Math.round(elRect.width / colWidth));

            // Anchor: how many columns does the left edge of the element sit at?
            const anchorLeft = elRect.left - parentRect.left;
            // startMouse - anchorLeft = offset of the grip click inside the element
            const clickOffset = e.clientX - elRect.left;

            const calcNewInicio = (clientX: number): number => {
                // We want the element's left edge to follow the cursor minus the
                // offset where the user clicked inside the element.
                const newLeft = clientX - parentRect.left - clickOffset;
                const newCol = Math.round(newLeft / colWidth) + 1;
                return Math.max(1, Math.min(13 - curSpan, newCol));
            };

            const curInicio = Math.max(
                1,
                Math.min(12, Math.round(anchorLeft / colWidth) + 1),
            );

            setPositionDrag({
                itemId: id,
                ghostStart: curInicio,
                ghostSpan: curSpan,
                cursorX: e.clientX,
                cursorY: e.clientY,
            });

            const onMove = (me: MouseEvent) => {
                setPositionDrag({
                    itemId: id,
                    ghostStart: calcNewInicio(me.clientX),
                    ghostSpan: curSpan,
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

            activeCleanupRef.current = () => {
                setPositionDrag(null);
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        },
        [id, elementRef, onPositionApply, setPositionDrag, setSelected, pushSnapshot],
    );

    return { handlePositionMouseDown };
};
