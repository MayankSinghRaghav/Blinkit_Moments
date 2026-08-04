import type { Category } from "@/lib/data/catalog";

/** Presentation-only category icons — no data/logic, just visual richness. */
export const CATEGORY_ICON: Record<Category, string> = {
  Beverages: "🥤",
  Snacks: "🍿",
  Home: "🧹",
  Desserts: "🍰",
  Mixers: "🍋",
  Pet: "🐾",
  Baby: "🍼",
  PersonalCare: "🧴",
  Wellness: "💊",
  Groceries: "🛒",
  Electronics: "🔌",
};

/** DOM id + scroll-margin anchor for a category section on the shop page. */
export const catAnchor = (c: string) => `cat-${c}`;
