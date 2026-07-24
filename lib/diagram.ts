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

const TABLE_W = 200;
const HEADER_H = 36;
const ROW_H = 28;
const COL_GAP = 80;
const ROW_GAP = 60;
const PADDING = 40;
const COLS = 3;
const EXTRA_BOTTOM = 8;

function h(len: number): number {
  return HEADER_H + len * ROW_H + EXTRA_BOTTOM;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateDiagramSVG(schema: Schema): string {
  const { tables } = schema;

  if (!tables || tables.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <rect width="600" height="300" fill="#1a1a1a" rx="12" />
  <text x="300" y="145" textAnchor="middle" fill="#a0a0a0" fontFamily="system-ui, sans-serif" fontSize="16">No tables found</text>
</svg>`;
  }

  const positions: Map<string, { x: number; y: number; w: number; h: number }> =
    new Map();
  const rows: number[] = [];

  for (let i = 0; i < tables.length; i++) {
    const ri = Math.floor(i / COLS);
    const th = h(tables[i].columns.length);
    if (!rows[ri] || th > rows[ri]) rows[ri] = th;
  }

  let yAcc = PADDING;
  const rowY: number[] = [];
  for (let r = 0; r < rows.length; r++) {
    rowY[r] = yAcc;
    yAcc += rows[r] + ROW_GAP;
  }
  const totalH = yAcc - ROW_GAP + PADDING;
  const totalW = PADDING + COLS * TABLE_W + (COLS - 1) * COL_GAP + PADDING;

  for (let i = 0; i < tables.length; i++) {
    const ri = Math.floor(i / COLS);
    const ci = i % COLS;
    const x = PADDING + ci * (TABLE_W + COL_GAP);
    const y = rowY[ri];
    positions.set(tables[i].name, { x, y, w: TABLE_W, h: h(tables[i].columns.length) });
  }

  const lines: string[] = [];
  const cards: string[] = [];

  for (const table of tables) {
    const pos = positions.get(table.name)!;
    const cx = pos.x + pos.w / 2;
    const cy = pos.y + pos.h / 2;
    const bottom = pos.y + pos.h;
    const right = pos.x + pos.w;

    for (const fk of table.foreignKeys) {
      const tgt = positions.get(fk.referencesTable);
      if (!tgt) continue;

      const tCx = tgt.x + tgt.w / 2;
      const tCy = tgt.y + tgt.h / 2;
      const tTop = tgt.y;
      const tLeft = tgt.x;
      const tRight = tgt.x + tgt.w;

      let x1: number, y1: number, x2: number, y2: number;

      if (bottom <= tgt.y) {
        x1 = cx; y1 = bottom;
        x2 = tCx; y2 = tTop;
      } else if (pos.y >= tgt.y + tgt.h) {
        x1 = cx; y1 = pos.y;
        x2 = tCx; y2 = tgt.y + tgt.h;
      } else if (pos.x + pos.w <= tgt.x) {
        x1 = right; y1 = cy;
        x2 = tLeft; y2 = tCy;
      } else if (pos.x >= tgt.x + tgt.w) {
        x1 = pos.x; y1 = cy;
        x2 = tRight; y2 = tCy;
      } else {
        x1 = cx; y1 = bottom;
        x2 = tCx; y2 = tTop;
      }

      lines.push(
        `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4f46e5" strokeWidth="2" marker-start="url(#arrow)" />`
      );
    }
  }

  for (const table of tables) {
    const pos = positions.get(table.name)!;
    const { x, y, w } = pos;
    const th = h(table.columns.length);

    const hasFk = table.foreignKeys.length > 0;
    const fkColumns = new Set(table.foreignKeys.map((f) => f.column));

    const colLines: string[] = [];
    for (let i = 0; i < table.columns.length; i++) {
      const col = table.columns[i];
      const rowY = y + HEADER_H + i * ROW_H;
      const textY = rowY + ROW_H - 8;

      let badges = "";
      if (col.isPrimaryKey) {
        badges += `<tspan fill="#818cf8" fontSize="10" fontFamily="monospace"> PK</tspan>`;
      }
      if (hasFk && fkColumns.has(col.name)) {
        if (!col.isPrimaryKey) {
          badges += `<tspan fill="#818cf8" fontSize="10" fontFamily="monospace"> FK</tspan>`;
        }
      }

      colLines.push(
        `      <text x="${x + 12}" y="${textY}" fill="#a0a0a0" fontSize="12" fontFamily="monospace">${esc(col.name)}${badges}</text>`
      );
    }

    const sepLines: string[] = [];
    for (let i = 0; i < table.columns.length - 1; i++) {
      const sy = y + HEADER_H + (i + 1) * ROW_H;
      sepLines.push(
        `      <line x1="${x + 1}" y1="${sy}" x2="${x + w - 1}" y2="${sy}" stroke="#333" strokeWidth="1" />`
      );
    }

    cards.push(
      `    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${th}" rx="8" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
      <rect x="${x}" y="${y}" width="${w}" height="${HEADER_H}" rx="8" fill="#252525" />
      <rect x="${x}" y="${y + HEADER_H - 6}" width="${w}" height="6" fill="#252525" />
      <text x="${x + w / 2}" y="${y + HEADER_H - 10}" textAnchor="middle" fill="#e5e5e5" fontSize="14" fontFamily="system-ui, sans-serif" fontWeight="600">${esc(table.name)}</text>
${sepLines.join("\n")}
${colLines.join("\n")}
    </g>`
    );
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
    </marker>
  </defs>
  <rect width="${totalW}" height="${totalH}" fill="#1a1a1a" rx="12" />`,
  ];

  if (lines.length > 0) {
    parts.push(`  <g id="connectors">\n${lines.join("\n")}\n  </g>`);
  }

  parts.push(`  <g id="tables">\n${cards.join("\n")}\n  </g>`);
  parts.push("</svg>");

  return parts.join("\n");
}
