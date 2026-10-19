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
      "RLS status on live connections",
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
      "For private repositories: catch risky schema changes before they merge, inside GitHub Actions.",
    features: [
      "Schema checks on private-repo pull requests",
      "Lint rules for risky migrations",
      "Sticky PR comments with the diff and ER diagram",
      "Licence covers one organisation",
    ],
    cta: null,
  },
];
