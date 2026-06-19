/**
 * Hook for resize-via-drag functionality.
 * Shared between DroppedContainer and DroppedField.
 * Snaps to 12-column grid on drag.
 */

import { useRef, useCallback, useState, useEffect } from 'react';

interface UseResizeDragOptions {
    id: string;
    currentTamanho: number;
    inicioColuna?: number;
    onResize: (tamanho: number) => void;
    /** Called once at drag start to push an undo snapshot */
    pushSnapshot?: () => void;
}

interface UseResizeDragReturn {
    resizeRef: React.RefObject<HTMLDivElement | null>;
    resizing: boolean;
    resizePreview: number | null;
    handleResizeStart: (e: React.MouseEvent) => void;
}

export const useResizeDrag = ({
    id,
    currentTamanho,
    inicioColuna,
    onResize,
    pushSnapshot,
}: UseResizeDragOptions): UseResizeDragReturn => {
    const resizeRef = useRef<HTMLDivElement>(null);
    const [resizing, setResizing] = useState(false);
    const [resizePreview, setResizePreview] = useState<number | null>(null);
    const activeCleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => { activeCleanupRef.current?.(); }, []);

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        pushSnapshot?.();

        const el = resizeRef.current;
        if (!el) return;
        const parent = el.parentElement;
        if (!parent) return;

        const parentWidth = parent.getBoundingClientRect().width;
        const startWidth = el.getBoundingClientRect().width;
        const startX = e.clientX;
        const maxCols = inicioColuna ? 13 - inicioColuna : 12;

        setResizing(true);

        const onMove = (me: MouseEvent) => {
            const dx = me.clientX - startX;
            const newWidth = startWidth + dx;
            const ratio = newWidth / parentWidth;
            const newTamanho = Math.max(1, Math.min(maxCols, Math.round(ratio * 12)));
            setResizePreview(newTamanho);
            onResize(newTamanho);
        };

        const onUp = () => {
            setResizing(false);
            setResizePreview(null);
            activeCleanupRef.current = null;
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };

        activeCleanupRef.current = () => {
            setResizing(false);
            setResizePreview(null);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [inicioColuna, onResize, pushSnapshot]);

    return { resizeRef, resizing, resizePreview, handleResizeStart };
};
