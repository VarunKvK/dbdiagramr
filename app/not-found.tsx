import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | dbdiagramr",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: {
    title: "Page not found | dbdiagramr",
    description: "The page you are looking for does not exist.",
    type: "website",
    images: [
      {
        url: "https://www.dbdiagramr.space/DbDiagramr-OG.png",
        width: 1200,
        height: 630,
        alt: "dbdiagramr PostgreSQL ER diagram",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Page not found | dbdiagramr",
    description: "The page you are looking for does not exist.",
    images: ["https://www.dbdiagramr.space/DbDiagramr-OG.png"],
  },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-6xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-[10px] bg-accent px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Back to dbdiagramr
      </Link>
    </main>
  );
}
