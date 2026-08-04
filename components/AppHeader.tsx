"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/data/catalog";
import { CATEGORY_ICON, catAnchor } from "@/lib/category-meta";
import { useDemo } from "@/lib/session";
import { useSearch, setSearch } from "@/lib/search";
import { countItems } from "@/lib/cart";

const NAV = [
  ["/", "Shop"],
  ["/moments", "Moments"],
  ["/tracker", "Tracker"],
  ["/discovery", "Discovery"],
];

export function AppHeader() {
  const demo = useDemo();
  const pathname = usePathname();
  const router = useRouter();
  const q = useSearch();

  function onSearch(v: string) {
    setSearch(v);
    // searching implies shopping — bring the grid into view
    if (v && pathname !== "/") router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className="bg-accent">
        <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0 text-lg font-extrabold leading-none tracking-tight">
            blinkit<span className="text-brand"> moments</span>
          </Link>

          <div className="hidden shrink-0 leading-tight sm:block">
            <p className="text-sm font-bold">Delivery in 8 minutes</p>
            <p className="text-xs text-black/60">Home — Koramangala, Bengaluru</p>
          </div>

          <div className="ml-auto hidden min-w-0 flex-1 sm:block">
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-brand/40">
              <span aria-hidden>🔍</span>
              <input
                type="search"
                value={q}
                onChange={(e) => onSearch(e.target.value)}
                placeholder='Search "beer", "nachos", "dog treats"'
                aria-label="Search products"
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-black/40"
              />
            </div>
          </div>

          <span className="ml-auto shrink-0 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white sm:ml-0">
            🛒 {countItems(demo.cart)}
          </span>
        </div>
      </div>

      <div className="border-b border-line">
        <div className="no-bar mx-auto flex max-w-[1280px] items-center gap-1 overflow-x-auto px-4 sm:px-6">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium ${
                pathname === href
                  ? "border-brand text-brand"
                  : "border-transparent text-black/55 hover:text-black"
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px shrink-0 bg-line" />
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/#${catAnchor(c)}`}
              onClick={() => setSearch("")}
              className="flex shrink-0 items-center gap-1 px-3 py-3 text-sm text-black/55 hover:text-black"
            >
              <span aria-hidden>{CATEGORY_ICON[c]}</span>
              {c}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
