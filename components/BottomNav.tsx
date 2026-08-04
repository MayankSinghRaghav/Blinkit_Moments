"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Mobile-only bottom tab bar. Presentation only — same routes as the header. */
const TABS: [string, string, string][] = [
  ["/", "Shop", "🛒"],
  ["/moments", "Moments", "✨"],
  ["/tracker", "Tracker", "📈"],
  ["/discovery", "Discovery", "🔬"],
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur sm:hidden"
    >
      <div className="mx-auto flex max-w-[1280px]">
        {TABS.map(([href, label, icon]) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
                active ? "text-brand" : "text-black/50"
              }`}
            >
              <span className="text-lg" aria-hidden>
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
