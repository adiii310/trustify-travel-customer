import type { Metadata, Viewport } from "next";

import SiteFooter from "@/components/SiteFooter";
import SiteNav from "@/components/SiteNav";
import { BRAND } from "@/lib/brand";
import { DialogProvider } from "@/providers/DialogProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider, themeInitScript } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND} – Travel. Verified.`,
    template: `%s · ${BRAND}`,
  },
  description:
    "Find India's most trusted travel companies. Every company is independently reviewed, verified and ranked across 9 trust parameters before we recommend it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a1424" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1218" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before first paint to avoid a flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/*
          Provider order matters:
          - QueryProvider owns the server-state cache and must wrap anything
            that reads or writes the API.
          - ToastProvider sits above DialogProvider because the shared forms
            report their outcome with a toast.
          Device-owned state (saved companies, compare tray, trips) needs no
          provider at all — it lives in Zustand stores under `src/store`.
        */}
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <DialogProvider>
                <SiteNav />
                <main>{children}</main>
                <SiteFooter />
              </DialogProvider>
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
