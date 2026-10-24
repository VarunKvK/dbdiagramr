"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ClipboardPaste, Plug, Search, Eye } from "lucide-react";

const slides = [
  {
    image: "/product/paste-sql.webp",
    title: "Paste SQL, get diagram",
    icon: ClipboardPaste,
    description:
      "Paste any CREATE TABLE statement and watch your schema render as an interactive ER diagram in real time. No setup, no account required.",
  },
  {
    image: "/product/connect-database.webp",
    title: "Connect to live DB",
    icon: Plug,
    description:
      "Drop in a PostgreSQL connection string and dbdiagramr introspects your live database, pulling tables, columns, keys, and constraints automatically.",
  },
  {
    image: "/product/search-filter.webp",
    title: "Search & filter",
    icon: Search,
    description:
      "Press / or ⌘K to search across tables, columns, and types. Instantly find any part of your schema, even in large databases with 50+ tables.",
  },
  {
    image: "/product/hover-trace.webp",
    title: "Hover to trace relationships",
    icon: Eye,
    description:
      "Hover over any table to dim unrelated nodes and highlight every foreign key connection. See exactly how your tables relate at a glance.",
  },
];

const INTERVAL = 5000;

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <section className="bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            Live demo
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
            Watch it <span className="text-accent">work.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-muted md:text-lg">
            Four moves. That is the whole product.
          </p>
        </div>

          <div
            className="relative mt-12 aspect-[5760/2904] w-full overflow-hidden rounded-[20px] border-2 border-border bg-white"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slides.map((slide, i) => (
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.title}
                fill
                sizes="(max-width: 768px) 100vw, 72rem"
                className={`object-cover transition-opacity duration-150 ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            const isActive = i === active;
            return (
              <button
                key={slide.title}
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className="group flex flex-col items-center text-center transition-colors duration-150"
              >
                <span className="font-mono text-xs font-medium text-accent">
                  0{i + 1}
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <Icon
                    size={18}
                    className={`${
                      isActive ? "text-accent" : "text-muted"
                    } transition-colors duration-150`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-ink" : "text-muted"
                    } transition-colors duration-150`}
                  >
                    {slide.title}
                  </span>
                </span>
                <span className="mt-2 text-sm leading-relaxed text-muted">
                  {slide.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="group flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`block h-2.5 rounded-full transition-all duration-150 ${
                  i === active
                    ? "w-7 bg-accent"
                    : "w-2.5 bg-accent/30 group-hover:bg-accent/60"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
