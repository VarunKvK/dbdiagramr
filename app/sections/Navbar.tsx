"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const links = [
  { label: "Product", target: "/#demo" },
  { label: "Features", target: "/#features" },
  { label: "Schemas", target: "/schema" },
  { label: "Alternatives", target: "/alternatives" },
  { label: "Pricing", target: "/#pricing" },
];

export default function Navbar() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      scrollToId(window.location.hash.slice(1));
    }
  }, [pathname]);

  function onClickHref(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    if (pathname === "/") {
      e.preventDefault();
      scrollToId(hash);
    }
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-border backdrop-blur-lg">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <a
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center text-xl font-medium text-ink"
        >
          dbdiagramr
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-sm bg-indigo-600" />
        </a>

        <div className="flex items-center gap-6">
          {links.map((link) => {
            const hash = link.target.split("#")[1] ?? "";
            return (
              <a
                key={link.target}
                href={link.target}
                onClick={(e) => {
                  if (hash) onClickHref(e, hash);
                }}
                className="text-sm font-medium text-ink transition-colors hover:underline"
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="/visualize"
            className="text-sm font-medium text-ink transition-colors hover:underline"
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  );
}