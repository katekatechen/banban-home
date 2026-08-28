"use client";

import { createContext, useContext } from "react";

type DrawerContextValue = {
  openDrawer: () => void;
};

export const DrawerContext = createContext<DrawerContextValue | null>(null);

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used within AppShell");
  return ctx;
}
