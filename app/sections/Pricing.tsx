import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description:
      "Perfect for solo developers exploring their database structure.",
    features: [
      "5 diagrams per month",
      "Static PNG export",
      "Single database connection",
      "Community support",
    ],
    cta: "Get started free",
    badge: "text-muted bg-cream",
    border: "",
    bg: "bg-surface",
    ctaStyle:
      "border border-ink text-ink hover:bg-surface rounded-lg py-3 font-medium",
    checkColor: "text-ink",
  },
  {
    name: "Pro",
    price: "$8",
    description:
      "For developers who need to share and collaborate.",
    features: [
      "Unlimited diagrams",
      "Interactive shareable links",
      "Version history",
      "Team access (up to 5 members)",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
    badge: "text-indigo-700 bg-indigo-50",
    border: "border-2 border-indigo-600",
    bg: "bg-cream",
    ctaStyle: "bg-ink text-white hover:bg-[#333] rounded-lg py-3 font-medium",
    checkColor: "text-indigo-600",
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <h2 className="mb-4 text-center text-3xl font-medium text-ink md:text-4xl">
          Simple pricing
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-muted">
          Start free. Upgrade when you need more.
        </p>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name}>
              {plan.popular && (
                <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-indigo-600">
                  <span className="inline-block rounded-full bg-indigo-50 px-3 py-1">
                    Most popular
                  </span>
                </p>
              )}
              <div
                className={`rounded-lg ${plan.bg} ${plan.border} p-10`}
              >
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider ${plan.badge}`}
                >
                  {plan.name}
                </span>
                <div className="mt-4">
                  <span className="text-5xl font-medium text-ink">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-lg text-muted">/month</span>
                </div>
                <p className="mt-4 text-muted">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <Check
                        size={16}
                        className={`shrink-0 ${plan.checkColor}`}
                      />
                      <span className="text-sm text-muted">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`mt-8 w-full transition-colors ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
