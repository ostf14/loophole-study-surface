"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * The meta layer's state. Two independent things: the decision pins and the
 * design system panel. Both off by default — the screen should open as the
 * product, not as a commentary on the product.
 */

type MetaState = {
  notes: boolean;
  panel: boolean;
  toggleNotes: () => void;
  togglePanel: () => void;
  closePanel: () => void;
};

const MetaContext = createContext<MetaState | null>(null);

export function MetaProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState(false);
  const [panel, setPanel] = useState(false);

  const toggleNotes = useCallback(() => setNotes((v) => !v), []);
  const togglePanel = useCallback(() => setPanel((v) => !v), []);
  const closePanel = useCallback(() => setPanel(false), []);

  const value = useMemo(
    () => ({ notes, panel, toggleNotes, togglePanel, closePanel }),
    [notes, panel, toggleNotes, togglePanel, closePanel],
  );

  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}

export function useMeta() {
  const ctx = useContext(MetaContext);
  if (!ctx) throw new Error("useMeta was called outside MetaProvider");
  return ctx;
}
