import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blinkit Moments — occasion-aware quick commerce",
  description:
    "Demo: an agent infers the occasion behind your cart and completes it across categories you've never bought.",
};

const NAV = [
  ["/", "Cart"],
  ["/moments", "Moments"],
  ["/tracker", "Tracker"],
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-black/10 bg-accent">
          <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
            <span className="font-bold tracking-tight">Blinkit <span className="text-brand">Moments</span></span>
            <nav className="ml-auto flex gap-4 text-sm">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="hover:underline">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-2xl px-4 pb-10 text-xs text-black/40">
          Prototype. Seeded catalog, no real Blinkit data, no payments.
        </footer>
      </body>
    </html>
  );
}
