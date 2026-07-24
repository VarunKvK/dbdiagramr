import Navbar from "@/app/sections/Navbar";
import Hero from "@/app/sections/Hero";
import Demo from "@/app/sections/Demo";
import Features from "@/app/sections/Features";
import Pricing from "@/app/sections/Pricing";
import Footer from "@/app/sections/Footer";

export default function Home() {
  return (
    <main className="">
      <Navbar />
      <div id="hero" className="scroll-mt-16">
        <Hero />
      </div>
      <div className="scroll-mt-16">
        <Demo />
      </div>
      <div id="features" className="scroll-mt-16">
        <Features />
      </div>
      <div id="pricing" className="scroll-mt-16">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
