import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Diagnostics } from "@/components/meta/diagnostics";
import { MetaBar } from "@/components/meta/meta-bar";
import { NotesOverlay } from "@/components/meta/notes-overlay";
import { SystemPanel } from "@/components/meta/system-panel";
import { MetaProvider } from "@/lib/meta/context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-next",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alex's Plan — Study Surface",
  description: "Loophole Online — day timeline view",
};

/**
 * The meta layer wraps the screen rather than being built into it: the bar on
 * top, the pins over it and the panel on the right all live in the layout, and
 * the screen itself knows nothing about them and gives them nothing but
 * `data-note` attributes on its anchors.
 *
 * Both toggles are off by default, so by default this is just a screen.
 *
 * `Diagnostics` renders nothing: it puts `window.__lo` on the page and writes
 * once to the console what to do with it. The checks are for a reviewer holding
 * only the page's address.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MetaProvider>
          <MetaBar />
          {children}
          <Diagnostics />
          <NotesOverlay />
          <SystemPanel />
        </MetaProvider>
      </body>
    </html>
  );
}
