import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Germany Wire",
  description: "German news and admin changes that affect expats, translated into plain English.",
};

export const viewport: Viewport = { themeColor: "#f5f5f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-dvh">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-5 sm:px-6">
          <header className="mb-5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-[-0.02em]">
              <span aria-hidden="true" className="flex w-5 flex-col gap-[3px]">
                <span className="h-[5px] rounded-[1px] bg-ink" />
                <span className="h-[5px] rounded-[1px] bg-forest" />
                <span className="h-[5px] rounded-[1px] bg-amber" />
              </span>
              Germany Wire
            </Link>
            <nav className="flex gap-1 text-sm font-medium text-muted">
              <Link href="/" className="rounded-md px-3 py-1.5 hover:bg-line/60 hover:text-ink">Briefing</Link>
              <Link href="/saved" className="rounded-md px-3 py-1.5 hover:bg-line/60 hover:text-ink">Saved</Link>
            </nav>
          </header>
          {children}
          <footer className="mt-16 max-w-xl text-[13px] leading-relaxed text-faint">
            Summaries are written by AI from official German sources. Check the original before you act on anything legal or visa-related.
          </footer>
        </div>
      </body>
    </html>
  );
}
