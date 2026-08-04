import Hero from "@/app/sections/Hero";
import Demo from "@/app/sections/Demo";
import HowToGuide from "@/app/sections/HowToGuide";
import Features from "@/app/sections/Features";
import Comparison from "@/app/sections/Comparison";
import Pricing from "@/app/sections/Pricing";
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

export default function Home() {
  return (
    <main className="">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <div id="hero" className="scroll-mt-16">
        <Hero />
      </div>
      <div className="scroll-mt-16">
        <Demo />
      </div>
      <div id="guide-section" className="scroll-mt-16">
        <HowToGuide />
      </div>
      <div id="features" className="scroll-mt-16">
        <Features />
      </div>
      <div id="comparison" className="scroll-mt-16">
        <Comparison />
      </div>
      <div id="pricing" className="scroll-mt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
