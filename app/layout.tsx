import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Navbar from "@/app/sections/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://dbdiagramr.space"),
  title: {
    default:
      "PostgreSQL ER Diagram Tool — Generate Schema Diagrams Instantly | dbdiagramr",
    template: "%s | dbdiagramr",
  },
  description:
    "Paste your PostgreSQL connection string and generate an interactive ER diagram in seconds. No signup required. Free schema visualization tool for Supabase, Neon, Railway, and more.",
  keywords:
    "postgresql er diagram, postgresql schema diagram, er diagram generator, database schema visualization, postgresql schema visualization, db diagram, supabase schema, er diagram tool",
  authors: [{ name: "dbdiagramr" }],
  alternates: {
    canonical: "https://dbdiagramr.space",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "dbdiagramr - See your database, visually",
    description:
      "Generate interactive ER diagrams from any PostgreSQL database. Hover to trace relationships, export as SVG or PNG.",
    type: "website",
    url: "https://dbdiagramr.space",
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
    <html lang="en" className={`${inter.className} scroll-smooth`}>
      <body className="antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MK1QVPVPSJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-MK1QVPVPSJ');`}
        </Script>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="fegBS/j8h5OGggFqrvUt8A"
          strategy="afterInteractive"
        />

        <Script id="structured-data" type="application/ld+json" strategy="beforeInteractive">
          {`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://dbdiagramr.space#website",
      "name": "dbdiagramr",
      "url": "https://dbdiagramr.space",
      "description": "Generate interactive ER diagrams from any PostgreSQL connection string. No signup required.",
      "publisher": { "@id": "https://dbdiagramr.space#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dbdiagramr.space/schema?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://dbdiagramr.space#organization",
      "name": "dbdiagramr",
      "url": "https://dbdiagramr.space",
      "logo": {
        "@type": "ImageObject",
        "url": "https://dbdiagramr.space/favicon.svg"
      },
      "description": "Free, open-source web tool for generating interactive entity-relationship diagrams from PostgreSQL databases.",
      "sameAs": [
        "https://github.com/VarunKvK/dbdiagramr"
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "dbdiagramr",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Any",
      "description": "Paste your PostgreSQL connection string and generate a beautiful ER diagram in seconds.",
      "url": "https://dbdiagramr.space",
      "offers": [
        {
          "@type": "Offer",
          "name": "Free",
          "price": "0",
          "priceCurrency": "USD"
        },
        {
          "@type": "Offer",
          "name": "Pro",
          "price": "8",
          "priceCurrency": "USD",
          "priceInterval": "month"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I get my PostgreSQL connection string?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In your database provider's dashboard, click Connect to retrieve your connection string. It typically looks like: postgresql://user:password@host:5432/dbname."
          }
        },
        {
          "@type": "Question",
          "name": "Which connection method should I use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Select the Transaction pooler option. This ensures compatibility with stateless applications and allows dbdiagramr to detect connections properly."
          }
        },
        {
          "@type": "Question",
          "name": "What if I forgot my database password?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Regenerate your password in the Shared pooler section of your database provider's dashboard and copy-paste the new credentials into your connection string."
          }
        }
      ]
    }
  ]
}`}
        </Script>
        <Navbar />
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
