import type { Metadata } from "next";
import Hero from "@/app/sections/Hero";
import ProductShowcase from "@/app/sections/ProductShowcase";
import Features from "@/app/sections/Features";
import About from "@/app/sections/About";
import Comparison from "@/app/sections/Comparison";
import CtaBand from "@/app/sections/CtaBand";
import BlogTeaser from "@/app/sections/BlogTeaser";
import PostgresGuide, { postgresFaqs, postgresHowToSteps } from "@/app/sections/PostgresGuide";
import Footer from "@/app/sections/Footer";
import { organizationRef, personNode, SITE_URL } from "@/lib/structuredData";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.dbdiagramr.space",
  },
};

const softwareJsonLd = {
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#software`,
  name: "dbdiagramr",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://www.dbdiagramr.space",
  image: `${SITE_URL}/DbDiagramr-OG.png`,
  description:
    "Free, open-source web tool that generates interactive ER diagrams from a PostgreSQL connection string or SQL.",
  author: personNode(),
  publisher: organizationRef(),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  license: "https://opensource.org/licenses/MIT",
  codeRepository: "https://github.com/VarunKvK/dbdiagramr",
  isAccessibleForFree: true,
  featureList: [
    "Live PostgreSQL schema introspection",
    "Interactive ER diagrams with foreign-key tracing",
    "Per-table Row Level Security status",
    "SVG and PNG export",
    "Paste-SQL mode parsed in the browser",
    "No signup and no diagram limit",
  ],
  sameAs: [
    "https://github.com/VarunKvK/dbdiagramr",
  ],
};

const homepageJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    softwareJsonLd,
    {
      "@type": "FAQPage",
      "@id": "https://www.dbdiagramr.space/#faq",
      mainEntity: postgresFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@type": "HowTo",
      "@id": "https://www.dbdiagramr.space/#howto",
      name: "How to generate a PostgreSQL ER diagram",
      description:
        "Turn a live PostgreSQL database or SQL dump into an interactive ER diagram.",
      totalTime: "PT1M",
      step: postgresHowToSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.name,
        text: step.text,
      })),
    },
  ],
};

export default function Home() {
  return (
    <main className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
      />
      <div id="hero" className="scroll-mt-16">
        <Hero />
      </div>
      <div id="demo" className="scroll-mt-16">
        <ProductShowcase />
      </div>
      <div id="features" className="scroll-mt-16">
        <Features />
      </div>
      <div className="scroll-mt-16">
        <About />
      </div>
      <div id="comparison" className="scroll-mt-16">
        <Comparison />
      </div>
      <PostgresGuide />
      <CtaBand />
      <BlogTeaser />
      <Footer />
    </main>
  );
}
