import { Zap, Share2, Shield } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant",
    description:
      "Connect your PostgreSQL database and generate a diagram in under 10 seconds. No manual drawing required.",
  },
  {
    icon: Share2,
    title: "Shareable",
    description:
      "Export as PNG or share an interactive link with your team. Everyone sees the same schema, always up to date.",
  },
  {
    icon: Shield,
    title: "Secure",
    description:
      "Your connection string is never stored. We introspect your schema and discard everything else. Your data never leaves your control.",
  },
];

export default function Features() {
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <h2 className="mb-4 text-center text-3xl font-medium text-ink md:text-4xl">
          Everything you need
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-muted">
          No complex setup. No enterprise sales. Just your database, visualized.
        </p>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-lg bg-cream p-10"
              >
                <Icon size={40} className="mx-auto text-ink" />
                <h3 className="mt-6 text-center text-xl font-medium text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-center leading-relaxed text-muted">
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
