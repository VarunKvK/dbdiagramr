"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const steps = [
  {
    number: "1",
    image: "/guide/Step-1.png",
    width: 2020,
    height: 1110,
    title: "Get your connection string",
    description:
      "In the production dashboard, click Connect to retrieve the connection string.",
  },
  {
    number: "2",
    image: "/guide/Step-2.png",
    width: 2020,
    height: 1416,
    title: "Select the Transaction pooler",
    description:
      "Under Connection method, select the Transaction pooler option - this ensures compatibility with stateless applications and allows dbdiagramr to detect connections properly.",
  },
  {
    number: "3",
    image: "/guide/Step-3.png",
    width: 2020,
    height: 1210,
    title: "Copy the credentials",
    description:
      "If you don't remember your database password, regenerate it in the Shared pooler section and copy-paste the new credentials into your configuration.",
  },
];

export default function HowToGuide() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="guide" ref={sectionRef} className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Step-by-Step Guide
          </span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-medium text-[#1a1a1a] md:text-4xl">
          Set up your database connection
        </h2>
        <p className="mx-auto mb-16 max-w-lg text-center text-[#737373]">
          Follow these three steps to connect your PostgreSQL database and
          generate your ER diagram.
        </p>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-0 hidden h-full w-0.5 bg-indigo-100 md:block" />

          <div className="flex flex-col gap-12">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-8"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.15}s`,
                }}
              >
                {/* Step number badge */}
                <div className="z-10 flex shrink-0 items-center gap-4 md:flex-col md:items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
                    {step.number}
                  </span>
                </div>

                {/* Content card */}
                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
                  <div className="bg-[#fafafa]">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={step.width}
                      height={step.height}
                      sizes="(max-width: 768px) 100vw, 672px"
                      loading="lazy"
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="mb-2 text-base font-semibold text-[#1a1a1a]">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#737373]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => router.push("/visualize")}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            Open Visualize &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
