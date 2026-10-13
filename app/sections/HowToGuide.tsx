"use client";

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

  return (
    <section id="guide" className="bg-white">
      <div className="mx-auto max-w-4xl px-4 py-20">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 font-mono text-xs font-medium text-accent">
            Step-by-step guide
          </span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Set up your database connection
        </h2>
        <p className="mx-auto mb-12 max-w-lg text-center text-muted">
          Follow these three steps to connect your PostgreSQL database and
          generate your ER diagram.
        </p>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-0 hidden h-full w-0.5 bg-accent/20 md:block" />

          <div className="flex flex-col gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col gap-4 md:flex-row md:items-start md:gap-8"
              >
                {/* Step number badge */}
                <div className="z-10 flex shrink-0 items-center gap-4 md:flex-col md:items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-mono text-sm font-medium text-white">
                    {step.number}
                  </span>
                </div>

                {/* Content card */}
                <div className="min-w-0 flex-1 overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
                  <div className="bg-surface">
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
                    <h3 className="mb-2 text-base font-medium text-ink">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/visualize")}
            className="rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Open Visualize &rarr;
          </button>
        </div>
      </div>
    </section>
  );
}
