import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "dbdiagramr — Visualize Your PostgreSQL Database",
  description:
    "Paste your PostgreSQL connection string and generate a beautiful ER diagram in seconds. No signup required.",
  keywords:
    "postgresql, er diagram, database schema, schema visualization, db diagram",
  authors: [{ name: "dbdiagramr" }],
  openGraph: {
    title: "dbdiagramr — Visualize Your PostgreSQL Database",
    description:
      "Paste your PostgreSQL connection string and generate a beautiful ER diagram in seconds. No signup required.",
    type: "website",
    url: "https://dbdiagramr.space",
  },
  twitter: {
    card: "summary_large_image",
    title: "dbdiagramr — Visualize Your PostgreSQL Database",
    description:
      "Paste your PostgreSQL connection string and generate a beautiful ER diagram in seconds. No signup required.",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} scroll-smooth`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
