import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz", "SOFT"] });

export const metadata: Metadata = {
  title: "Germany Wire",
  description: "German news and admin changes that affect expats, translated into calm, plain English.",
};

export const viewport: Viewport = { themeColor: "#f6f3ea" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh">
        <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
          <header className="mb-6 flex items-baseline justify-between">
            <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-sage-deep">
              Germany Wire
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-ink-soft">
              <Link href="/" className="hover:text-ink">Briefing</Link>
              <Link href="/saved" className="hover:text-ink">Saved</Link>
            </nav>
          </header>
          {children}
          <footer className="mt-16 text-sm leading-relaxed text-ink-faint">
            Summaries are written by AI from official German sources. Always check the original before you act on anything legal or visa-related.
          </footer>
        </div>
      </body>
    </html>
  );
}
