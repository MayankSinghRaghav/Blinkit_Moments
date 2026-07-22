import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { FloatingCart } from "@/components/cart/FloatingCart";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blinkit Moments — occasion-aware quick commerce",
  description:
    "Demo: an agent infers the occasion behind your cart and completes it across categories you've never bought.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppHeader />
        <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">{children}</main>
        <FloatingCart />
        {/* room for the floating cart so it never covers the last row */}
        <footer className="mx-auto max-w-[1280px] px-4 pb-28 pt-6 text-xs leading-relaxed text-black/35 sm:px-6">
          Prototype — not affiliated with Blinkit. Seeded catalog, no payments, no accounts.
          <br />
          Product photography from Open Food Facts, Open Beauty Facts, Open Pet Food Facts and Open
          Products Facts contributors (images CC-BY-SA, data ODbL).
        </footer>
      </body>
    </html>
  );
}
