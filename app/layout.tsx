import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
 * Мета-слой обёрнут вокруг экрана, а не встроен в него: полоса сверху, пины
 * поверх и панель справа живут в layout, а сам экран о них не знает и ничего
 * им не отдаёт, кроме атрибутов `data-note` на якорях.
 *
 * Оба переключателя выключены по умолчанию, так что по умолчанию это просто
 * экран.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <MetaProvider>
          <MetaBar />
          {children}
          <NotesOverlay />
          <SystemPanel />
        </MetaProvider>
      </body>
    </html>
  );
}
