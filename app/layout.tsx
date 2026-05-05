import type { Metadata, Viewport } from "next";
import { Cinzel, Spectral } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ruins of Symbaroum — Character Builder",
  description:
    "A character builder for Ruins of Symbaroum 5E. Forge a hero in the shadow of Davokar.",
};

// Mobile viewport scaffolding. `width=device-width, initial-scale=1` makes
// phones render at their CSS-pixel width instead of falling back to a
// desktop-width viewport. `viewportFit=cover` lets us extend safely under
// notches via `env(safe-area-inset-*)`. `themeColor` aligns iOS Safari's
// tinted address-bar with the parchment cream of the page background.
//
// `userScalable` is intentionally NOT set — pinch-to-zoom MUST remain
// available as an accessibility lifeline for the sheet's dense small text.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#efe5cb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
