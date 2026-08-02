import { computeLayout, getRowY, routePath } from "@/lib/diagramLayout";
import type { Rect } from "@/lib/diagramLayout";

export type Column = {
  name: string;
  type: string;
  nullable: string;
  default: string | null;
  isPrimaryKey: boolean;
};

export type ForeignKey = {
  column: string;
  referencesTable: string;
  referencesColumn: string;
};

export type Table = {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
};

export type Schema = {
  tables: Table[];
};

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badge(x: number, y: number, label: string, active: boolean): string {
  const fill = active ? "#a5b4fc" : "#4f46e5";
  const stroke = active ? "#6366f1" : "#333";
  return `      <g transform="translate(${x}, ${y})">
        <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#1a1a1a" stroke="${stroke}" strokeWidth="1" />
        <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill="${fill}" fontSize="9" fontWeight="bold" fontFamily="monospace">${label}</text>
      </g>`;
}

export function generateDiagramSVG(schema: Schema): string {
  const { tables } = schema;

  if (!tables || tables.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <rect width="600" height="300" fill="#1a1a1a" rx="12" />
  <text x="300" y="145" textAnchor="middle" fill="#a0a0a0" fontFamily="system-ui, sans-serif" fontSize="16">No tables found</text>
</svg>`;
  }

  const layout = computeLayout(schema);
  const all = Object.values(layout) as Rect[];
  const minX = Math.min(...all.map((p) => p.x)) - 40;
  const minY = Math.min(...all.map((p) => p.y)) - 40;
  const maxX = Math.max(...all.map((p) => p.x + p.w)) + 40;
  const maxY = Math.max(...all.map((p) => p.y + p.h)) + 40;
  const vw = maxX - minX;
  const vh = maxY - minY;

  const connections: string[] = [];
  tables.forEach((table) => {
    table.foreignKeys.forEach((fk) => {
      const fromPos = layout[table.name];
      const toPos = layout[fk.referencesTable];
      if (!fromPos || !toPos) return;

      const sy = getRowY(table.name, fk.column, schema, layout);
      const ey = getRowY(fk.referencesTable, fk.referencesColumn, schema, layout);
      const sx = fromPos.x + fromPos.w;
      const ex = toPos.x;

      connections.push(
        `    <g>
      <path d="${routePath(sx, sy, ex, ey)}" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" marker-end="url(#arrowhead)" />
${badge(sx + 10, sy - 14, "*", false)}
${badge(ex - 10, ey - 14, "1", false)}
    </g>`
      );
    });
  });

  const cards: string[] = [];
  tables.forEach((table) => {
    const pos = layout[table.name];
    const { x, y, w, h } = pos;
    const isFk = table.foreignKeys.length > 0;
    const fkColumns = new Set(table.foreignKeys.map((f) => f.column));

    const colLines: string[] = [];
    table.columns.forEach((col, i) => {
      const cy = y + 42 + i * 26;
      const isPk = col.isPrimaryKey;
      const isFkCol = isFk && fkColumns.has(col.name);

      colLines.push(
        `      <line x1="${x + 1}" y1="${cy + 10}" x2="${x + w - 1}" y2="${cy + 10}" stroke="#2a2a2a" strokeWidth="1" />`
      );
      colLines.push(
        `      <text x="${x + 14}" y="${cy}" fill="#a0a0a0" fontSize="12" fontFamily="monospace">${esc(col.name)}</text>`
      );
      if (isPk) {
        colLines.push(
          `      <text x="${x + w - 14}" y="${cy}" textAnchor="end" fill="#6366f1" fontSize="10" fontWeight="bold" fontFamily="monospace">PK</text>`
        );
      } else if (isFkCol) {
        colLines.push(
          `      <text x="${x + w - 14}" y="${cy}" textAnchor="end" fill="#6366f1" fontSize="10" fontWeight="bold" fontFamily="monospace">FK</text>`
        );
      }
    });

    cards.push(
      `    <g>
      <rect x="${x + 2}" y="${y + 3}" width="${w}" height="${h}" rx="8" fill="black" opacity="0.25" filter="url(#glow)" />
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1.5" />
      <rect x="${x}" y="${y}" width="${w}" height="38" rx="8" fill="#252525" />
      <rect x="${x}" y="${y + 30}" width="${w}" height="10" fill="#252525" />
      <text x="${x + w / 2}" y="${y + 25}" textAnchor="middle" fill="#e5e5e5" fontSize="13" fontWeight="600" fontFamily="Inter, sans-serif">${esc(table.name)}</text>
${colLines.join("\n")}
    </g>`
    );
  });

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${vw} ${vh}" width="100%" height="100%">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
    </marker>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222" strokeWidth="0.5" />
    </pattern>
  </defs>
  <rect x="${minX}" y="${minY}" width="${vw}" height="${vh}" fill="url(#grid)" />`,
  ];

  if (connections.length > 0) {
    parts.push(`  <g id="connectors">\n${connections.join("\n")}\n  </g>`);
  }

  parts.push(`  <g id="tables">\n${cards.join("\n")}\n  </g>`);
  parts.push("</svg>");

  return parts.join("\n");
}
