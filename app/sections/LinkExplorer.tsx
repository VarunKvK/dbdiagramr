import Link from "next/link";

export type ExplorerLink = { href: string; label: string };

export default function LinkExplorer({
  tools,
  schemas,
}: {
  tools: ExplorerLink[];
  schemas: ExplorerLink[];
}) {
  const groups = [
    { label: `Free tools (${tools.length})`, links: tools },
    { label: `Schemas (${schemas.length})`, links: schemas },
  ];

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 md:p-8">
      <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-ink">
        Keep exploring
      </h3>

      {groups.map((group) => (
        <div key={group.label} className="mt-5">
          <p className="text-sm font-medium text-muted">{group.label}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-[20px] border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft"
              >
                {l.label}{" "}
                <span className="text-muted transition-colors group-hover:text-accent">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
