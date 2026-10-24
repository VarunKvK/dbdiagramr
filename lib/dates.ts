const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const monthLabel = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function utcDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDate(iso: string): string {
  return shortDate.format(utcDate(iso));
}

export function formatMonth(iso: string): string {
  return monthLabel.format(utcDate(iso));
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function toIsoDateTime(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00+00:00` : iso;
}
