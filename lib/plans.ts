export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: string;
  available: boolean;
  price: { amount: number; currency: "USD"; interval: "month" } | null;
  priceLabel: string;
  description: string;
  features: string[];
  cta: { label: string; href: string } | null;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    available: true,
    price: null,
    priceLabel: "$0",
    description:
      "Everything you need to diagram a PostgreSQL database that already exists.",
    features: [
      "Unlimited diagrams, no monthly cap",
      "Live PostgreSQL introspection",
      "Paste-SQL mode, parsed in your browser",
      "SVG and PNG export",
      "No signup, no account",
    ],
    cta: { label: "Visualize your database", href: "/visualize" },
  },
  {
    id: "pro",
    name: "Pro",
    available: false,
    price: null,
    priceLabel: "In development",
    description:
      "For teams documenting a schema that keeps changing: save it, version it, share it.",
    features: [
      "Saved diagrams and table layout",
      "Version history and schema diffs",
      "Multiple schemas in one diagram",
      "Shareable links",
      "Licence for private repositories in the GitHub Action",
    ],
    cta: null,
  },
];
