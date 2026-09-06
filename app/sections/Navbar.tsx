"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { VariableFontHover } from "@/components/ui/variable-font-hover";

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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      scrollToId(window.location.hash.slice(1));
    }
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function onClickHref(e: React.MouseEvent<HTMLAnchorElement>, hash: string) {
    if (pathname === "/") {
      e.preventDefault();
      scrollToId(hash);
      setIsOpen(false);
    }
  }

  return (
    <nav className="fixed z-50 h-16 border-b border-border bg-white/70 backdrop-blur-lg w-full">
      <div className="flex h-full items-center justify-between px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <a
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2 text-xl font-medium text-ink"
        >
          <img
            src="/Logo_noBG.png"
            alt="dbdiagramr logo"
            className="h-14 w-14 object-contain"
          />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const hash = link.target.split("#")[1] ?? "";
            return (
              <a
                key={link.target}
                href={link.target}
                onClick={(e) => {
                  if (hash) onClickHref(e, hash);
                }}
              >
                <VariableFontHover
                  label={link.label}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
                  fromFontVariationSettings="'wght' 400"
                  toFontVariationSettings="'wght' 700"
                  staggerDuration={0.03}
                  staggerFrom="center"
                />
              </a>
            );
          })}
        </div>

        <div className="hidden items-center lg:flex">
          <a
            href="/visualize"
            className="rounded-lg bg-[#4F39F6] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
          >
            Get started
          </a>
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink lg:hidden"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-white px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {links.map((link) => {
              const hash = link.target.split("#")[1] ?? "";
              return (
                <a
                  key={link.target}
                  href={link.target}
                  onClick={(e) => {
                    if (hash) onClickHref(e, hash);
                    else setIsOpen(false);
                  }}
                  className="text-base font-medium text-ink hover:underline"
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="/visualize"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex justify-center rounded-lg bg-[#4F39F6] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4338CA]"
            >
              Get started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
