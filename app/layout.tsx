import type { Metadata } from "next";
import type { ReactNode } from "react";
import Nav from "@/components/layout/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auditable AI Referral Review Demo",
  description:
    "Frontend-only mock demo of a governed AI-assisted referral review workflow.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
