import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@xyflow/react/dist/style.css";
import { Providers } from "@/components/providers/Providers";
import { RouteGuard } from "@/components/auth/RouteGuard";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReCore AI | Enterprise Legacy-Code Modernization Platform",
  description:
    "De-risk legacy Python modernizations with automated AST dependency graphs, blast-radius isolation, business rule extraction, and deterministic parity test proofs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                const theme = localStorage.getItem('recore-theme') || 'dark';
                const htmlEl = document.documentElement;
                htmlEl.classList.remove('light', 'dark');
                htmlEl.classList.add(theme);
              } catch (e) {
                // localStorage might not be available
              }
            })();
          `}
        </Script>
      </head>
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col" suppressHydrationWarning>
        <Providers>
          <RouteGuard>{children}</RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
