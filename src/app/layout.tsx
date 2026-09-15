import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito, Patrick_Hand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import { site } from "@/lib/site";
import { CrayonDefs } from "@/components/illustrations/CrayonDefs";

/* PRD §4.3 — a rounded storybook display face, a hand-lettered accent that
   echoes the logo, and a clean rounded sans for body copy. */
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

const patrick = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — cards, stories, and hope for kids with cancer`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "cancer",
    "volunteer",
    "childrens hospital",
    "handmade cards",
    "cancer research",
    "student volunteering",
    "volunteer certificate",
    "student service hours",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — creativity is a form of courage`,
    description: site.description,
    url: site.url,
    locale: site.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — creativity is a form of courage`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fffcf8",
  colorScheme: "light",
};

/**
 * Root layout: fonts, page texture, and the shared SVG filter defs.
 *
 * The public header and footer deliberately live one level down, in
 * `(site)/layout.tsx`, so the `/admin` workspace doesn't inherit marketing
 * chrome it has no use for.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable} ${patrick.variable}`}>
      <body className="flex min-h-dvh flex-col bg-paper antialiased">
        {/* Paper grain multiplies over the whole page, below the sticky header. */}
        <div className="paper-grain-overlay" aria-hidden="true" />
        <CrayonDefs />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
