"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const links = [
  { label: "Schemas", target: "/schema" },
  { label: "Blog", target: "/blog" },
  { label: "Alternatives", target: "/alternatives" },
  { label: "Pricing", target: "/#pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isVisualize = pathname.startsWith("/visualize");

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
    <nav
      className={
        isVisualize
          ? "fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/10 bg-[#1a1a1a]/70 backdrop-blur-lg"
          : "fixed left-0 right-0 top-0 z-50 h-16 border-b border-border backdrop-blur-lg"
      }
    >
      <div className="flex h-full items-center justify-between px-6 lg:px-8">
        <a
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className={isVisualize ? "flex items-center text-xl font-medium text-white" : "flex items-center text-xl font-medium text-ink"}
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
                className={
                  isVisualize
                    ? "text-sm font-medium text-white/80 transition-colors hover:underline hover:text-white"
                    : "text-sm font-medium text-ink transition-colors hover:underline"
                }
              >
                {link.label}
              </a>
            );
          })}
          <a
            href="/visualize"
            className={
              isVisualize
                ? "text-sm font-medium text-white/80 transition-colors hover:underline hover:text-white"
                : "text-sm font-medium text-ink transition-colors hover:underline"
            }
          >
            Get started
          </a>
        </div>
      </div>
    </nav>
  );
}