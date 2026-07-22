"use client";
import { useSyncExternalStore } from "react";

export type Demo = {
  sessionId: string;
  /** product ids currently in the cart */
  cart: string[];
  comfort: number;
  context: string;
  occasionId: string;
  occasionLabel: string;
};

const KEY = "blinkit-moments";
const START: Demo = {
  sessionId: "",
  cart: ["bev_beer", "snk_nachos"],
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
  state = saved ? { ...START, ...JSON.parse(saved) } : START;
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
