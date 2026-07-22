"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/data/catalog";
import { useDemo } from "@/lib/session";
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
            <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-black/40">
              <span aria-hidden>🔍</span>
              <span className="truncate">Search &quot;beer&quot;, &quot;nachos&quot;, &quot;dog treats&quot;</span>
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
            <span
              key={c}
              className="shrink-0 px-3 py-3 text-sm text-black/45"
              title="Categories are illustrative in this prototype"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
