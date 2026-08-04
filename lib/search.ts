"use client";
import { useSyncExternalStore } from "react";

// Tiny in-memory store for the header search query. Presentation-only: it just
// filters the catalog grid on the shop page — it does NOT touch the occasion
// engine, recommendations, or any ranking logic.
let query = "";
const listeners = new Set<() => void>();

export function setSearch(q: string) {
  query = q;
  listeners.forEach((l) => l());
}

export function useSearch(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => query,
    () => "",
  );
}
