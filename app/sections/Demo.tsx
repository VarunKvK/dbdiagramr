"use client";

import { useState, useEffect, useRef } from "react";

const TABLES = [
  { id: "users", name: "users", x: 20, y: 20, w: 170, h: 138 },
  { id: "posts", name: "posts", x: 280, y: 20, w: 170, h: 160 },
  { id: "tags", name: "tags", x: 550, y: 20, w: 170, h: 94 },
  { id: "comments", name: "comments", x: 110, y: 280, w: 170, h: 118 },
  { id: "post_tags", name: "post_tags", x: 430, y: 280, w: 170, h: 94 },
];

const CONNECTIONS = [
  { id: "c1", from: "users", to: "posts", d: "M 190 55 L 220 55 L 220 77 L 280 77", label1: "1", label2: "*", lx1: 198, ly1: 53, lx2: 275, ly2: 80 },
  { id: "c2", from: "users", to: "comments", d: "M 105 158 L 105 210 L 195 210 L 195 280", label1: "1", label2: "*", lx1: 108, ly1: 200, lx2: 192, ly2: 208 },
  { id: "c3", from: "posts", to: "comments", d: "M 365 180 L 365 220 L 195 220 L 195 280", label1: "1", label2: "*", lx1: 362, ly1: 218, lx2: 192, ly2: 218 },
  { id: "c4", from: "posts", to: "post_tags", d: "M 450 170 L 450 220 L 515 220 L 515 280", label1: "*", label2: "*", lx1: 448, ly1: 218, lx2: 512, ly2: 218 },
  { id: "c5", from: "tags", to: "post_tags", d: "M 635 114 L 635 200 L 600 200 L 600 280", label1: "*", label2: "*", lx1: 632, ly1: 198, lx2: 598, ly2: 198 },
];

export default function Demo() {
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const isConnected = (tableId: string) => {
    if (!hoveredTable) return true;
    if (tableId === hoveredTable) return true;
    return CONNECTIONS.some(
      (c) =>
        (c.from === hoveredTable && c.to === tableId) ||
        (c.to === hoveredTable && c.from === tableId)
    );
  };

  const isConnectionActive = (connId: string) => {
    if (!hoveredTable) return false;
    const conn = CONNECTIONS.find((c) => c.id === connId);
    if (!conn) return false;
    return conn.from === hoveredTable || conn.to === hoveredTable;
  };

  return (
    <section id="demo" ref={sectionRef} className="bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <h2 className="mb-16 text-center text-3xl font-medium text-[#1a1a1a] md:text-4xl">
          See your database, visually
        </h2>

        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Window chrome */}
          <div className="flex h-9 items-center gap-2 bg-[#252525] px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            <span className="ml-4 select-none text-[11px] font-medium tracking-wide text-[#666]">
              dbdiagramr — mydatabase
            </span>
          </div>

          <div className="relative overflow-x-auto p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            <svg
              viewBox="15 10 730 410"
              className="mx-auto w-full max-w-4xl"
              style={{ minWidth: 600 }}
            >
              <defs>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connector lines */}
              <g strokeWidth="1.5" fill="none">
                {CONNECTIONS.map((conn, i) => {
                  const active = isConnectionActive(conn.id);
                  const dimmed = hoveredTable && !active;
                  return (
                    <g key={conn.id}>
                      <path
                        d={conn.d}
                        stroke={active ? "#6366f1" : "#333"}
                        strokeWidth={active ? 2.5 : 1.5}
                        style={{
                          transition: "all 0.3s ease",
                          opacity: dimmed ? 0.12 : active ? 1 : 0.5,
                        }}
                      />
                      {/* Fast traveling pulse dot */}
                      <circle r="3" fill="#818cf8" filter="url(#glow)">
                        <animateMotion
                          dur={`${3 + i * 0.4}s`}
                          repeatCount="indefinite"
                          path={conn.d}
                        />
                        <animate
                          attributeName="opacity"
                          values="0;1;0"
                          dur={`${3 + i * 0.4}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </g>

              {/* Relationship labels */}
              <g fontSize="11" fontFamily="monospace">
                {CONNECTIONS.map((conn) => {
                  const active = isConnectionActive(conn.id);
                  const dimmed = hoveredTable && !active;
                  return (
                    <g key={`label-${conn.id}`}>
                      <text
                        x={conn.lx1}
                        y={conn.ly1}
                        textAnchor="end"
                        fill={active ? "#818cf8" : "#4f46e5"}
                        style={{
                          transition: "all 0.3s ease",
                          opacity: dimmed ? 0.12 : active ? 1 : 0.6,
                        }}
                      >
                        {conn.label1}
                      </text>
                      <text
                        x={conn.lx2}
                        y={conn.ly2}
                        textAnchor="start"
                        fill={active ? "#818cf8" : "#4f46e5"}
                        style={{
                          transition: "all 0.3s ease",
                          opacity: dimmed ? 0.12 : active ? 1 : 0.6,
                        }}
                      >
                        {conn.label2}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Table: users */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable("users")}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  opacity: visible ? (isConnected("users") ? 1 : 0.2) : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect x="20" y="20" width="170" height="138" rx="6" fill="#1a1a1a" stroke={hoveredTable === "users" ? "#4f46e5" : "#333"} strokeWidth={hoveredTable === "users" ? 2 : 1.5} style={{ transition: "all 0.25s ease" }} />
                <rect x="20" y="20" width="170" height="30" rx="6" fill={hoveredTable === "users" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <rect x="20" y="44" width="170" height="6" fill={hoveredTable === "users" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <text x="105" y="40" textAnchor="middle" fill={hoveredTable === "users" ? "#e0e7ff" : "#e5e5e5"} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif" style={{ transition: "fill 0.25s ease" }}>users</text>
                <text x="30" y="62" fill="#a0a0a0" fontSize="12" fontFamily="monospace">id <tspan fill="#6366f1" fontSize="10">PK</tspan></text>
                <line x1="20" y1="68" x2="190" y2="68" stroke="#333" strokeWidth="1" />
                <text x="30" y="84" fill="#a0a0a0" fontSize="12" fontFamily="monospace">name</text>
                <line x1="20" y1="90" x2="190" y2="90" stroke="#333" strokeWidth="1" />
                <text x="30" y="106" fill="#a0a0a0" fontSize="12" fontFamily="monospace">email</text>
                <line x1="20" y1="112" x2="190" y2="112" stroke="#333" strokeWidth="1" />
                <text x="30" y="128" fill="#a0a0a0" fontSize="12" fontFamily="monospace">created_at</text>
              </g>

              {/* Table: posts */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable("posts")}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  opacity: visible ? (isConnected("posts") ? 1 : 0.2) : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect x="280" y="20" width="170" height="160" rx="6" fill="#1a1a1a" stroke={hoveredTable === "posts" ? "#4f46e5" : "#333"} strokeWidth={hoveredTable === "posts" ? 2 : 1.5} style={{ transition: "all 0.25s ease" }} />
                <rect x="280" y="20" width="170" height="30" rx="6" fill={hoveredTable === "posts" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <rect x="280" y="44" width="170" height="6" fill={hoveredTable === "posts" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <text x="365" y="40" textAnchor="middle" fill={hoveredTable === "posts" ? "#e0e7ff" : "#e5e5e5"} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif" style={{ transition: "fill 0.25s ease" }}>posts</text>
                <text x="290" y="62" fill="#a0a0a0" fontSize="12" fontFamily="monospace">id <tspan fill="#6366f1" fontSize="10">PK</tspan></text>
                <line x1="280" y1="68" x2="450" y2="68" stroke="#333" strokeWidth="1" />
                <text x="290" y="84" fill="#a0a0a0" fontSize="12" fontFamily="monospace">user_id <tspan fill="#6366f1" fontSize="10">FK</tspan></text>
                <line x1="280" y1="90" x2="450" y2="90" stroke="#333" strokeWidth="1" />
                <text x="290" y="106" fill="#a0a0a0" fontSize="12" fontFamily="monospace">title</text>
                <line x1="280" y1="112" x2="450" y2="112" stroke="#333" strokeWidth="1" />
                <text x="290" y="128" fill="#a0a0a0" fontSize="12" fontFamily="monospace">body</text>
                <line x1="280" y1="134" x2="450" y2="134" stroke="#333" strokeWidth="1" />
                <text x="290" y="150" fill="#a0a0a0" fontSize="12" fontFamily="monospace">created_at</text>
              </g>

              {/* Table: tags */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable("tags")}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  opacity: visible ? (isConnected("tags") ? 1 : 0.2) : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect x="550" y="20" width="170" height="94" rx="6" fill="#1a1a1a" stroke={hoveredTable === "tags" ? "#4f46e5" : "#333"} strokeWidth={hoveredTable === "tags" ? 2 : 1.5} style={{ transition: "all 0.25s ease" }} />
                <rect x="550" y="20" width="170" height="30" rx="6" fill={hoveredTable === "tags" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <rect x="550" y="44" width="170" height="6" fill={hoveredTable === "tags" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <text x="635" y="40" textAnchor="middle" fill={hoveredTable === "tags" ? "#e0e7ff" : "#e5e5e5"} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif" style={{ transition: "fill 0.25s ease" }}>tags</text>
                <text x="560" y="62" fill="#a0a0a0" fontSize="12" fontFamily="monospace">id <tspan fill="#6366f1" fontSize="10">PK</tspan></text>
                <line x1="550" y1="68" x2="720" y2="68" stroke="#333" strokeWidth="1" />
                <text x="560" y="84" fill="#a0a0a0" fontSize="12" fontFamily="monospace">name</text>
              </g>

              {/* Table: comments */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable("comments")}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  opacity: visible ? (isConnected("comments") ? 1 : 0.2) : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect x="110" y="280" width="170" height="118" rx="6" fill="#1a1a1a" stroke={hoveredTable === "comments" ? "#4f46e5" : "#333"} strokeWidth={hoveredTable === "comments" ? 2 : 1.5} style={{ transition: "all 0.25s ease" }} />
                <rect x="110" y="280" width="170" height="30" rx="6" fill={hoveredTable === "comments" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <rect x="110" y="304" width="170" height="6" fill={hoveredTable === "comments" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <text x="195" y="300" textAnchor="middle" fill={hoveredTable === "comments" ? "#e0e7ff" : "#e5e5e5"} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif" style={{ transition: "fill 0.25s ease" }}>comments</text>
                <text x="120" y="322" fill="#a0a0a0" fontSize="12" fontFamily="monospace">id <tspan fill="#6366f1" fontSize="10">PK</tspan></text>
                <line x1="110" y1="328" x2="280" y2="328" stroke="#333" strokeWidth="1" />
                <text x="120" y="344" fill="#a0a0a0" fontSize="12" fontFamily="monospace">post_id <tspan fill="#6366f1" fontSize="10">FK</tspan></text>
                <line x1="110" y1="350" x2="280" y2="350" stroke="#333" strokeWidth="1" />
                <text x="120" y="366" fill="#a0a0a0" fontSize="12" fontFamily="monospace">user_id <tspan fill="#6366f1" fontSize="10">FK</tspan></text>
                <line x1="110" y1="372" x2="280" y2="372" stroke="#333" strokeWidth="1" />
                <text x="120" y="388" fill="#a0a0a0" fontSize="12" fontFamily="monospace">content</text>
              </g>

              {/* Table: post_tags */}
              <g
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTable("post_tags")}
                onMouseLeave={() => setHoveredTable(null)}
                style={{
                  opacity: visible ? (isConnected("post_tags") ? 1 : 0.2) : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect x="430" y="280" width="170" height="94" rx="6" fill="#1a1a1a" stroke={hoveredTable === "post_tags" ? "#4f46e5" : "#333"} strokeWidth={hoveredTable === "post_tags" ? 2 : 1.5} style={{ transition: "all 0.25s ease" }} />
                <rect x="430" y="280" width="170" height="30" rx="6" fill={hoveredTable === "post_tags" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <rect x="430" y="304" width="170" height="6" fill={hoveredTable === "post_tags" ? "#252540" : "#252525"} style={{ transition: "fill 0.25s ease" }} />
                <text x="515" y="300" textAnchor="middle" fill={hoveredTable === "post_tags" ? "#e0e7ff" : "#e5e5e5"} fontSize="13" fontWeight="bold" fontFamily="Inter, sans-serif" style={{ transition: "fill 0.25s ease" }}>post_tags</text>
                <text x="440" y="322" fill="#a0a0a0" fontSize="12" fontFamily="monospace">post_id <tspan fill="#6366f1" fontSize="10">FK</tspan></text>
                <line x1="430" y1="328" x2="600" y2="328" stroke="#333" strokeWidth="1" />
                <text x="440" y="344" fill="#a0a0a0" fontSize="12" fontFamily="monospace">tag_id <tspan fill="#6366f1" fontSize="10">FK</tspan></text>
              </g>
            </svg>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-[#a3a3a3]">
          Hover over any table to trace its relationships
        </p>
      </div>
    </section>
  );
}