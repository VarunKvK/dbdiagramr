import dagre from "@dagrejs/dagre";
import type { Schema, Table } from "@/lib/diagram";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const LAYOUT = {
  header: 42,
  rowH: 26,
  rowPad: 8,
  minW: 220,
  hPad: 16,
  colCharW: 7.5,
  typeCharW: 6.5,
  headCharW: 8,
  badgeW: 40,
  nodesep: 60,
  ranksep: 90,
  margin: 40,
} as const;

function shortTypeForWidth(raw: string): string {
  const t = raw.toLowerCase();
  const map: Record<string, string> = {
    "character varying": "varchar",
    "timestamp without time zone": "timestamp",
    "timestamp with time zone": "timestamptz",
    "time without time zone": "time",
    "time with time zone": "timetz",
    "double precision": "float8",
  };
  if (map[t]) return map[t];
  return raw;
}

export function tableSize(table: Table): { width: number; height: number } {
  const colW = table.columns.reduce((max, c) => {
    const typeShort = shortTypeForWidth(c.type);
    // name + type + badge + PK/FK + spacing
    const w = c.name.length * LAYOUT.colCharW + typeShort.length * LAYOUT.typeCharW + LAYOUT.badgeW + 24;
    return Math.max(max, w);
  }, 0);
  const headerW = table.name.length * LAYOUT.headCharW + 24;
  const width = Math.max(LAYOUT.minW, colW, headerW);
  const height = LAYOUT.header + table.columns.length * LAYOUT.rowH + LAYOUT.rowPad;
  return { width, height };
}

export function layoutSchema(schema: Schema): Record<string, Rect> {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: LAYOUT.nodesep,
    ranksep: LAYOUT.ranksep,
    marginx: LAYOUT.margin,
    marginy: LAYOUT.margin,
  });

  const sizes = new Map<string, { width: number; height: number }>();
  for (const table of schema.tables) {
    const size = tableSize(table);
    sizes.set(table.name, size);
    g.setNode(table.name, size);
  }
  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      g.setEdge(table.name, fk.referencesTable);
    }
  }

  dagre.layout(g);

  const positions: Record<string, Rect> = {};
  for (const table of schema.tables) {
    const node = g.node(table.name);
    const size = sizes.get(table.name)!;
    positions[table.name] = {
      x: node.x - size.width / 2,
      y: node.y - size.height / 2,
      w: size.width,
      h: size.height,
    };
  }

  return positions;
}

export const computeLayout = layoutSchema;

export function getRowY(
  tableName: string,
  columnName: string,
  schema: Schema,
  layout: Record<string, Rect>
): number {
  const pos = layout[tableName];
  const table = schema.tables.find((t) => t.name === tableName)!;
  const idx = table.columns.findIndex((c) => c.name === columnName);
  return pos.y + LAYOUT.header + idx * LAYOUT.rowH + 4;
}

export function routePath(x1: number, y1: number, x2: number, y2: number): string {
  const pad = 28;
  const x1Out = x1 + pad;
  const x2In = x2 - pad;

  if (Math.abs(y1 - y2) < 8 && x2 > x1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (x2 > x1) {
    const midX = x1Out + (x2In - x1Out) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  const drop = Math.max(y1, y2) + 50;
  return `M ${x1} ${y1} L ${x1Out} ${y1} L ${x1Out} ${drop} L ${x2In} ${drop} L ${x2In} ${y2} L ${x2} ${y2}`;
}
