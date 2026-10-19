import { Code, Search, Download, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Code,
    title: "Instant Import",
    description:
      "Paste SQL or connect to a live PostgreSQL database. See your entire schema as an interactive diagram in seconds.",
    dark: true,
  },
  {
    icon: Search,
    title: "Search & Navigate",
    description:
      "Press / to find any table, column, or type instantly, even in databases with 50+ tables.",
    dark: false,
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Download as SVG or PNG. Embed diagrams in docs, READMEs, or presentations.",
    dark: true,
  },
  {
    icon: Plug,
    title: "Live Connection",
    description:
      "Connect directly to your PostgreSQL database. Tables, columns, and foreign keys with no manual SQL required.",
    dark: false,
  },
];

export default function Features() {
  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            What it does
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Your database, <span className="text-accent">diagrammed.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={cn(
                  "flex min-h-[280px] flex-col justify-end rounded-[20px] p-6",
                  f.dark ? "bg-ink text-white" : "bg-accent-soft text-ink"
                )}
              >
                <Icon
                  size={28}
                  strokeWidth={2}
                  className={f.dark ? "text-punch" : "text-accent"}
                />
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p
                  className={cn(
                    "mt-2 text-sm font-medium leading-relaxed",
                    f.dark ? "text-white/70" : "text-muted"
                  )}
                >
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
