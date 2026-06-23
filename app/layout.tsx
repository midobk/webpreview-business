import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "SiteSprint — Beautiful websites for Canadian small business",
  description:
    "Generate a complete, on-brand website preview for your business in 90 seconds. Built for Canadian small businesses. No credit card. No sales call.",
  metadataBase: new URL("https://webpreview-business.vercel.app"),
  openGraph: {
    title: "SiteSprint — See your new website before you pay a dollar.",
    description:
      "AI-generated website previews for Canadian small businesses. Free preview in 90 seconds.",
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
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}