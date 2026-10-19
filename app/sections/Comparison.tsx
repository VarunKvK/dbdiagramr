import { cn } from "@/lib/utils";

const cards = [
  {
    title: "No diagram limit",
    description:
      "Create as many diagrams as you need. No counts, no quotas, no upgrade prompts.",
    className: "bg-accent-soft text-ink md:col-span-1",
    muted: false,
  },
  {
    title: "Connect directly",
    description:
      "Paste your PostgreSQL connection string and see your real schema with no manual SQL input, no query running, and no extra steps.",
    className: "bg-ink text-white md:col-span-2",
    muted: true,
  },
  {
    title: "Private by design",
    description:
      "Paste SQL never leaves your browser. Live connections go to our backend for one request, then are discarded. No stored schemas, no accounts.",
    className: "bg-punch text-white md:col-span-2",
    muted: true,
  },
  {
    title: "No learning curve",
    description:
      "Paste SQL or connect to your database. No DSL to learn, no syntax to memorize.",
    className: "bg-accent-soft text-ink md:col-span-1",
    muted: false,
  },
];

export default function Comparison() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mx-auto max-w-4xl text-center text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          We <span className="text-accent">solved</span> the problems other
          tools make you live with
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className={cn(
                "flex min-h-[320px] flex-col justify-end rounded-[20px] p-8",
                c.className
              )}
            >
              <h3 className="text-3xl font-semibold tracking-tight">
                {c.title}
              </h3>
              <p
                className={cn(
                  "mt-3 max-w-md text-lg font-medium leading-relaxed",
                  c.muted ? "text-white/75" : "text-muted"
                )}
              >
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
