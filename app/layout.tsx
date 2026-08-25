import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-next",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alex's Plan — Study Surface",
  description: "Loophole Online — day timeline view",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
