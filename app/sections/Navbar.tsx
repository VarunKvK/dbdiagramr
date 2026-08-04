"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

const links = [
  { label: "Product", target: "demo" },
  { label: "Features", target: "features" },
  { label: "Schemas", target: "/schema" },
  { label: "Alternatives", target: "/alternatives" },
  { label: "Pricing", target: "pricing" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      scrollToId(window.location.hash.slice(1));
    }
  }, [pathname]);

  function goHome() {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  }

  function goTo(target: string) {
    if (target.startsWith("/")) {
      router.push(target);
      return;
    }
    if (pathname === "/") {
      scrollToId(target);
    } else {
      router.push(`/#${target}`);
    }
  }

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-border backdrop-blur-lg">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center text-xl font-medium text-ink"
        >
          dbdiagramr
          <span className="ml-0.5 inline-block h-1.5 w-1.5 rounded-sm bg-indigo-600" />
        </button>

        <div className="flex items-center gap-6">
          {links.map((link) =>
            link.target.startsWith("/") ? (
              <button
                key={link.target}
                type="button"
                onClick={() => router.push(link.target)}
                className="text-sm font-medium text-ink transition-colors hover:underline"
              >
                {link.label}
              </button>
            ) : (
              <button
                key={link.target}
                type="button"
                onClick={() => goTo(link.target)}
                className="text-sm font-medium text-ink transition-colors hover:underline"
              >
                {link.label}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => goTo("demo")}
            className="text-sm font-medium text-ink transition-colors hover:underline"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}