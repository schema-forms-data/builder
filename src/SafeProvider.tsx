/**
 * SafeProvider — kept for backwards-compat import in FormSchemaBuilder.
 * After migrating from @data-driven-forms/dnd to @dnd-kit, this is a
 * transparent passthrough. The real DnD context is DndContext from @dnd-kit/core,
 * managed inside BuilderEditor.
 */
import React from "react";

interface SafeProviderProps {
  children: React.ReactNode;
  // Legacy props accepted but ignored
  dispatch?: unknown;
  state?: unknown;
  DropCursorProps?: unknown;
}

const SafeProvider: React.FC<SafeProviderProps> = ({ children }) => (
  <>{children}</>
);

export default SafeProvider;
