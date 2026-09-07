"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ClipboardPaste, Plug, Search, Eye } from "lucide-react";

const slides = [
  {
    image: "/Product Design/PasteSQL.png",
    title: "Paste SQL, get diagram",
    icon: ClipboardPaste,
    description:
      "Paste any CREATE TABLE statement and watch your schema render as an interactive ER diagram in real time. No setup, no account required.",
  },
  {
    image: "/Product Design/ConnectionString.png",
    title: "Connect to live DB",
    icon: Plug,
    description:
      "Drop in a PostgreSQL connection string and dbdiagramr introspects your live database, pulling tables, columns, keys, and constraints automatically.",
  },
  {
    image: "/Product Design/Search&Filter.png",
    title: "Search & filter",
    icon: Search,
    description:
      "Press / or \u2318K to search across tables, columns, and types. Instantly find any part of your schema, even in large databases with 50+ tables.",
  },
  {
    image: "/Product Design/Hover&Trace.png",
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
    <section className="bg-cream pb-24 pt-[90px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-12 text-3xl font-medium text-ink md:text-4xl">
          What DBdiagramr does
          <span className="ml-0.5 text-indigo-600">.</span>
        </h2>

          <div
            className="relative aspect-[1640/896] w-full"
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
                className={`object-contain transition-opacity duration-500 inset-shadow-2xs rounded-lg ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
              />
            ))}
          </div>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {slides.map((slide, i) => {
            const Icon = slide.icon;
            const isActive = i === active;
            return (
              <button
                key={slide.title}
                onClick={() => setActive(i)}
                className={`group flex flex-col items-start text-left transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-50 hover:opacity-75"
                }`}
              >
                <span className="mb-3 flex items-center gap-2">
                  <Icon
                    size={18}
                    className={`${
                      isActive ? "text-indigo-600" : "text-muted"
                    } transition-colors duration-300`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-ink" : "text-muted"
                    } transition-colors duration-300`}
                  >
                    {slide.title}
                  </span>
                </span>
                <span className="text-sm leading-relaxed text-muted">
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
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? "w-6 bg-indigo-600"
                  : "w-2 bg-indigo-200 hover:bg-indigo-300"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
