import { Code, MousePointer, Download } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "Paste SQL or Connect",
    description:
      "Two ways to generate a diagram. Paste CREATE TABLE statements for a quick preview, or connect to your live database for the full schema.",
  },
  {
    icon: MousePointer,
    title: "Interactive diagram",
    description:
      "Pan, zoom, and hover to trace foreign key relationships. See exactly how your tables connect at a glance.",
  },
  {
    icon: Download,
    title: "Export anywhere",
    description:
      "Download as SVG or PNG, or share an interactive link with your team. Your data stays private.",
  },
];

export default function Features() {
  return (
    <section className="bg-cream pb-24 pt-[120px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-medium text-ink md:text-4xl">
          Everything you need
        </h2>
        <p className="mb-16 max-w-2xl text-lg text-muted">
          No complex setup. No enterprise sales. Just your database, visualized.
        </p>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex flex-col rounded-2xl bg-white p-8 pt-14"
              >
                <div className="mb-8 flex h-32 items-end">
                  <Icon size={32} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-medium text-ink">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
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
