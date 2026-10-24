import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "@/app/sections/Navbar";
import SmoothScroll from "@/components/SmoothScroll";
import Popup from "@/components/Popup";
import AnalyticsOptOut from "@/components/AnalyticsOptOut";
import DeferredAnalytics from "@/components/DeferredAnalytics";
import { Toaster } from "sonner";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "optional",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dbdiagramr.space"),
  title: "PostgreSQL ER Diagram Tool in 10 Seconds | dbdiagramr",
  description:
    "Paste a PostgreSQL connection string and generate an interactive ER diagram in under 10 seconds. No signup, no setup, no diagram limit.",
  keywords:
    "postgresql er diagram, postgresql schema diagram, er diagram generator, database schema visualization, postgresql schema visualization, db diagram, supabase schema, er diagram tool",
  authors: [
    {
      name: "Varun Krishnan",
      url: "https://www.dbdiagramr.space/about",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PostgreSQL ER Diagram Tool | Paste Connection String, Get Diagram",
    description:
      "Generate interactive ER diagrams from any PostgreSQL database. Hover to trace foreign key relationships, export as SVG or PNG. Free.",
    type: "website",
    url: "https://www.dbdiagramr.space",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "dbdiagramr - ER diagrams from PostgreSQL",
    description:
      "No signup, no setup. Paste a connection string and get a beautiful schema diagram in under 10 seconds.",
    images: ["/DbDiagramr-OG.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrument.variable} ${plexMono.variable}`}>
      <body className="antialiased">
        <Script id="analytics-opt-out" strategy="beforeInteractive">
          {`(function(){try{var p=new URLSearchParams(location.search).get("notrack");if(p==="1")localStorage.setItem("dbd_notrack","1");else if(p==="0")localStorage.removeItem("dbd_notrack");if(localStorage.getItem("dbd_notrack")==="1"){window["ga-disable-${GA_MEASUREMENT_ID}"]=true;}}catch(e){}})();`}
        </Script>
        <AnalyticsOptOut />
        <SmoothScroll />
        <DeferredAnalytics />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.dbdiagramr.space#website",
      "name": "dbdiagramr",
      "url": "https://www.dbdiagramr.space",
      "description": "Generate interactive ER diagrams from any PostgreSQL connection string. No signup required.",
      "publisher": { "@id": "https://www.dbdiagramr.space#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.dbdiagramr.space/schema?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://www.dbdiagramr.space#organization",
      "name": "dbdiagramr",
      "url": "https://www.dbdiagramr.space",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.dbdiagramr.space/favicon.svg"
      },
      "description": "Free, open-source web tool for generating interactive entity-relationship diagrams from PostgreSQL databases.",
      "sameAs": [
        "https://github.com/VarunKvK/dbdiagramr",
        "https://x.com/im_daedalus"
      ]
    }
  ]
}`}}
        />
        <Navbar />
        <Toaster position="top-center" />
        {children}
        <Popup
          id="exit-visualize"
          trigger="exit"
          title="See your database this clearly"
          body="Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds. No signup."
          ctaLabel="Visualize my database"
          ctaHref="/visualize"
          declineLabel="No thanks - I'm just browsing"
        />
      </body>
    </html>
  );
}
