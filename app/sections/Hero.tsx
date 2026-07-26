"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const PALETTE = [
  "99, 102, 241",
  "139, 92, 246",
  "168, 85, 247",
  "59, 130, 246",
  "14, 165, 233",
];

interface CellData {
  id: number;
  skip: boolean;
}

export default function Hero() {
  const router = useRouter();
  const [activeCells, setActiveCells] = useState<Record<number, string>>({});
  const timeoutsRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const gridRef = useRef<HTMLDivElement>(null);

  const cells = useMemo<CellData[]>(
    () =>
      Array.from({ length: 160 }, (_, i) => ({
        id: i,
        skip: Math.random() < 0.35,
      })),
    []
  );

  const lightUp = useCallback((index: number) => {
    if (cells[index]?.skip) return;

    if (timeoutsRef.current[index]) {
      clearTimeout(timeoutsRef.current[index]);
    }

    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    setActiveCells((prev) => ({ ...prev, [index]: color }));

    timeoutsRef.current[index] = setTimeout(() => {
      setActiveCells((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }, 800);
  }, [cells]);

  useEffect(() => {
    const interval = setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * 160);
        lightUp(idx);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [lightUp]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colW = rect.width / 40;
      const rowH = rect.height / 4;

      const c = Math.floor(x / colW);
      const r = Math.floor(y / rowH);
      const idx = r * 40 + c;

      if (idx >= 0 && idx < 160) {
        lightUp(idx);
        const neighbors = [-1, 1, -40, 40].filter(() => Math.random() > 0.5);
        neighbors.forEach((n) => {
          const ni = idx + n;
          if (ni >= 0 && ni < 160) lightUp(ni);
        });
      }
    },
    [lightUp]
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <section className="relative bg-cream">
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-32 text-center">
        <h1 className="text-5xl font-medium leading-tight text-ink md:text-6xl">
          Stop drawing your database by hand
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          Generate a beautiful ER diagram from your PostgreSQL database in under
          10 seconds. No signup, no setup, no sketching.
        </p>
        <button
          type="button"
          onClick={() => router.push("/visualize")}
          className="mt-10 rounded-lg bg-ink px-8 py-3 font-medium text-white transition-colors hover:bg-[#333]"
        >
          Try it free
        </button>
      </div>

      <div className="w-full px-4 pb-16">
        <div
          ref={gridRef}
          className="grid w-full cursor-crosshair grid-cols-[repeat(40,1fr)] gap-px"
          onMouseMove={handleMouseMove}
        >
          {cells.map(({ id, skip }) => {
            const activeColor = activeCells[id];
            return (
              <div
                key={id}
                className="aspect-square w-full rounded-[1px]"
                style={{
                  backgroundColor: activeColor
                    ? `rgba(${activeColor}, 0.45)`
                    : skip
                      ? "transparent"
                      : "rgba(0,0,0,0.03)",
                  transition: activeColor
                    ? "background-color 0.08s ease"
                    : "background-color 0.6s ease",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
