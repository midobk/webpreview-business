import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import { ThemeScript } from "./admin/_components/ThemeScript";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Fraunces — variable serif with optical sizing. Used for the display
// headlines and italic emphasis ("PROOF · DRAFT 01", "before you pay a
// dollar") that anchor the warm-print visual identity. Body copy stays
// Geist; the serif is a deliberate signature, not a default.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Seaway Sites — Beautiful websites for Canadian small business",
  description:
    "A complete, on-brand website preview for your business within the hour — machine-drafted, human-checked. Built for Canadian small businesses. No credit card. No sales call.",
  metadataBase: new URL("https://webpreview-business.vercel.app"),
  openGraph: {
    title: "Seaway Sites — See your new website before you pay a dollar.",
    description:
      "Fast website previews for Canadian small businesses. Free preview, no credit card, no commitment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]"
        suppressHydrationWarning
      >
        {/* ThemeScript sets the admin light/dark class before paint (no FOUC);
            Providers (MotionConfig reducedMotion="user") then wraps the tree in
            a client boundary so this layout stays a Server Component. */}
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}