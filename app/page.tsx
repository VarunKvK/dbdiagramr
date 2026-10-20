import Hero from "@/app/sections/Hero";
import ProductShowcase from "@/app/sections/ProductShowcase";
import Features from "@/app/sections/Features";
import About from "@/app/sections/About";
import Comparison from "@/app/sections/Comparison";
import CtaBand from "@/app/sections/CtaBand";
import BlogTeaser from "@/app/sections/BlogTeaser";
import Footer from "@/app/sections/Footer";

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to generate an ER diagram from a PostgreSQL database",
  description:
    "Generate an interactive entity-relationship diagram from your PostgreSQL connection string in three steps.",
  totalTime: "PT10S",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Get your connection string",
      text: "In your database provider's dashboard, click Connect to retrieve the PostgreSQL connection string.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Select the Transaction pooler",
      text:
        "Under Connection method, select the Transaction pooler option. This ensures compatibility with stateless applications and allows dbdiagramr to detect connections properly.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Paste it into dbdiagramr",
      text:
        "Paste the connection string into dbdiagramr and generate a navigable ER diagram in under 10 seconds.",
    },
  ],
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "dbdiagramr",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://www.dbdiagramr.space",
  description:
    "Free, open-source web tool that generates interactive ER diagrams from a PostgreSQL connection string or SQL.",
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
    "https://x.com/im_daedalus",
  ],
};

export default function Home() {
  return (
    <main className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
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
      <CtaBand />
      <BlogTeaser />
      <Footer />
    </main>
  );
}
