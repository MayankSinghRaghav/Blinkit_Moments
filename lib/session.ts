"use client";
import { useSyncExternalStore } from "react";
import { toLines, type CartLine } from "@/lib/cart";

export type Demo = {
  sessionId: string;
  /** the single source of truth for the cart — id + quantity */
  cart: CartLine[];
  comfort: number;
  context: string;
  occasionId: string;
  occasionLabel: string;
};

const KEY = "blinkit-moments";
const START: Demo = {
  sessionId: "",
  cart: [
    { id: "bev_beer", qty: 1 },
    { id: "snk_nachos", qty: 2 },
  ],
  comfort: 50,
  context: "Fri 7pm",
  occasionId: "",
  occasionLabel: "",
};

let state: Demo = START;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const saved = localStorage.getItem(KEY);
  // toLines migrates carts saved as string[] by earlier versions
  state = saved ? { ...START, ...JSON.parse(saved) } : START;
  state = { ...state, cart: toLines(state.cart) };
  if (!state.sessionId) state = { ...state, sessionId: crypto.randomUUID() };
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function setDemo(patch: Partial<Demo>) {
  hydrate();
  state = { ...state, ...patch };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useDemo(): Demo {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => {
      hydrate();
      return state;
    },
    () => START,
  );
}
