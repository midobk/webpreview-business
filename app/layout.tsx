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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Seaway Sites — Beautiful websites for Canadian small businesses",
  description:
    "Request a free, personalized first draft of your website. Most eligible requests are delivered within the hour during service hours. No credit card and no sales call.",
  metadataBase: new URL("https://seawaysites.com"),
  openGraph: {
    title: "Seaway Sites — See your new website before you pay a dollar.",
    description:
      "Personalized website drafts and managed websites for Canadian small businesses.",
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
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
