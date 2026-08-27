"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Состояние метаслоя. Две независимые вещи: пины с решениями и панель
 * дизайн-системы. Обе выключены по умолчанию — экран должен открываться
 * продуктом, а не разбором продукта.
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
  if (!ctx) throw new Error("useMeta вызван вне MetaProvider");
  return ctx;
}
