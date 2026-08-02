/* ─── Types ─── */
export interface Column {
  name: string;
  type: string;
  nullable: string;
  default: string | null;
  isPrimaryKey: boolean;
}

export interface ForeignKey {
  column: string;
  referencesTable: string;
  referencesColumn: string;
}

export interface Table {
  name: string;
  columns: Column[];
  foreignKeys: ForeignKey[];
}

export interface Schema {
  tables: Table[];
}

/* ─── Layout Constants ─── */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const LAYOUT = {
  colW: 200,        // slightly wider for long column names
  gapX: 160,
  gapY: 80,
  header: 42,
  rowH: 28,         // slightly taller rows for better readability
  padding: 40,
  rowPad: 16,       // more bottom padding after last column
  minCanvasW: 780,
  minCanvasH: 460,
} as const;

/* ─── Smart Grid Layout ─── */
export function computeLayout(schema: Schema): Record<string, Rect> {
  const positions: Record<string, Rect> = {};
  const n = schema.tables.length;

  // Adaptive column count: more tables = more columns, up to 5
  const cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(n * 1.3))));

  // Pre-calculate heights to avoid row overlap
  const rowHeights: number[] = [];
  schema.tables.forEach((t, i) => {
    const row = Math.floor(i / cols);
    const h = LAYOUT.header + t.columns.length * LAYOUT.rowH + LAYOUT.rowPad;
    rowHeights[row] = Math.max(rowHeights[row] || 0, h);
  });

  schema.tables.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h = LAYOUT.header + t.columns.length * LAYOUT.rowH + LAYOUT.rowPad;
    const yOffset = rowHeights
      .slice(0, row)
      .reduce((sum, rh) => sum + rh + LAYOUT.gapY, LAYOUT.padding);
    positions[t.name] = {
      x: LAYOUT.padding + col * (LAYOUT.colW + LAYOUT.gapX),
      y: yOffset,
      w: LAYOUT.colW,
      h,
    };
  });

  return positions;
}

/* ─── Column Y position inside a table ─── */
export function getRowY(
  tableName: string,
  columnName: string,
  schema: Schema,
  layout: Record<string, Rect>
): number {
  const pos = layout[tableName];
  const table = schema.tables.find((t) => t.name === tableName)!;
  const idx = table.columns.findIndex((c) => c.name === columnName);
  // Connection point: centered vertically in the row
  return pos.y + LAYOUT.header + idx * LAYOUT.rowH + LAYOUT.rowH / 2;
}

/* ─── Connection routing ─── */
export function routePath(x1: number, y1: number, x2: number, y2: number): string {
  const pad = 28;
  const x1Out = x1 + pad;
  const x2In = x2 - pad;

  // Nearly horizontal, target to the right
  if (Math.abs(y1 - y2) < 8 && x2 > x1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  // Target to the right — elbow connector
  if (x2 > x1) {
    const midX = x1Out + (x2In - x1Out) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  // Target to the left — route down, across, then up
  const drop = Math.max(y1, y2) + 60;
  return `M ${x1} ${y1} L ${x1Out} ${y1} L ${x1Out} ${drop} L ${x2In} ${drop} L ${x2In} ${y2} L ${x2} ${y2}`;
}

/* ─── Content bounds (for dynamic viewBox & export) ─── */
export function getContentBounds(
  positions: Record<string, Rect>,
  extraPadding = 40
): { x: number; y: number; w: number; h: number } {
  const rects = Object.values(positions);
  if (rects.length === 0) {
    return {
      x: -extraPadding,
      y: -extraPadding,
      w: LAYOUT.minCanvasW + extraPadding * 2,
      h: LAYOUT.minCanvasH + extraPadding * 2,
    };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.h);
  }

  return {
    x: minX - extraPadding,
    y: minY - extraPadding,
    w: Math.max(LAYOUT.minCanvasW, maxX - minX + extraPadding * 2),
    h: Math.max(LAYOUT.minCanvasH, maxY - minY + extraPadding * 2),
  };
}

/* ─── Read positions from SVG DOM (for external export callers) ─── */
function readPositionsFromDom(el: SVGSVGElement): Record<string, Rect> {
  const positions: Record<string, Rect> = {};
  const tableGroups = el.querySelectorAll("g[data-table]");
  tableGroups.forEach((g) => {
    const name = g.getAttribute("data-table");
    // Select the body rect (second rect with rx="8", not the shadow)
    const rects = g.querySelectorAll('rect[rx="8"]');
    const bodyRect = rects[1] as SVGRectElement | null; // index 1 = body, index 0 = shadow
    if (name && bodyRect) {
      positions[name] = {
        x: parseFloat(bodyRect.getAttribute("x") || "0"),
        y: parseFloat(bodyRect.getAttribute("y") || "0"),
        w: parseFloat(bodyRect.getAttribute("width") || "0"),
        h: parseFloat(bodyRect.getAttribute("height") || "0"),
      };
    }
  });
  return positions;
}

/* ─── SVG Export helpers ─── */
export function serializeSvg(
  el: SVGSVGElement,
  positions?: Record<string, Rect>
): string {
  const clone = el.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("style");

  // Resolve positions: use provided, or read from DOM, or fallback
  const pos =
    positions && Object.keys(positions).length > 0
      ? positions
      : readPositionsFromDom(clone);

  // Tight viewBox from current positions
  const bounds = getContentBounds(pos, 40);
  clone.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`);
  clone.setAttribute("width", `${bounds.w}`);
  clone.setAttribute("height", `${bounds.h}`);

  // Remove pan/zoom transform so tables sit at absolute coords
  const contentGroup = clone.querySelector('g[data-content="true"]');
  if (contentGroup) {
    contentGroup.removeAttribute("transform");
  }

  // Inline global styles
  const sheet = document.querySelector("style");
  if (sheet) {
    const defs =
      clone.querySelector("defs") ||
      clone.insertBefore(
        document.createElementNS("http://www.w3.org/2000/svg", "defs"),
        clone.firstChild
      );
    const globalStyle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "style"
    );
    globalStyle.textContent = sheet.textContent || "";
    defs.appendChild(globalStyle);
  }

  // Dark background for standalone file
  const bg = clone.querySelector('rect[data-bg="true"]');
  if (bg) {
    bg.setAttribute("fill", "#0f0f0f");
    bg.removeAttribute("fill-opacity");
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportPNG(
  el: SVGSVGElement,
  filename: string,
  positions?: Record<string, Rect>
) {
  const svgString = serializeSvg(el, positions);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const pos =
    positions && Object.keys(positions).length > 0
      ? positions
      : readPositionsFromDom(el);
  const bounds = getContentBounds(pos, 40);

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = bounds.w * 2;
      canvas.height = bounds.h * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(
        img,
        bounds.x < 0 ? -bounds.x : 0,
        bounds.y < 0 ? -bounds.y : 0,
        bounds.w,
        bounds.h
      );
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
          resolve();
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}