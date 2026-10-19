import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Footer from "@/app/sections/Footer";
import { plans } from "@/lib/plans";

const URL = "https://www.dbdiagramr.space/pricing";
const TITLE = "Pricing";
const DESCRIPTION =
  "dbdiagramr is free with no diagram limit and no account. A Pro plan for saved diagrams, version history and sharing is in development.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-cream pt-14">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Pricing
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-6xl">
          Free for the work you do <span className="text-accent">today.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
          Every diagramming feature is free, with no diagram limit and no
          account. Pro adds saved diagrams, version history and sharing, and it
          is still in development.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={
                plan.available
                  ? "flex flex-col rounded-[20px] border border-border bg-surface p-8"
                  : "flex flex-col rounded-[20px] bg-ink p-8 text-white"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={
                    plan.available
                      ? "inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent"
                      : "inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-punch"
                  }
                >
                  {plan.name}
                </span>
                {!plan.available && (
                  <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-white/50">
                    In development
                  </span>
                )}
              </div>

              <div className="mt-6">
                <span
                  className={
                    plan.available
                      ? "text-5xl font-medium text-ink"
                      : "text-3xl font-medium text-white"
                  }
                >
                  {plan.priceLabel}
                </span>
                {plan.price && (
                  <span className="ml-1 text-lg text-muted">/month</span>
                )}
              </div>

              <p
                className={
                  plan.available
                    ? "mt-4 text-muted"
                    : "mt-4 text-sm font-medium text-white/70"
                }
              >
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
                      className={
                        plan.available
                          ? "mt-0.5 shrink-0 text-accent"
                          : "mt-0.5 shrink-0 text-punch"
                      }
                    />
                    <span
                      className={
                        plan.available
                          ? "text-sm text-muted"
                          : "text-sm text-white/80"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.cta ? (
                  <Link
                    href={plan.cta.href}
                    className="block w-full rounded-[10px] bg-accent py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                  >
                    {plan.cta.label}
                  </Link>
                ) : (
                  <a
                    href="https://github.com/VarunKvK/dbdiagramr/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-[10px] border border-white/25 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Follow progress on GitHub
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-[20px] border border-border bg-surface p-8">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Nothing is for sale yet
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
            There is no checkout, no subscription and no card on file. The free
            plan will stay free with unlimited diagrams when Pro ships. Pro will
            be an optional upgrade for persistence, history, multi-schema
            diagrams and sharing.
          </p>
        </section>
      </div>
      <Footer />
    </main>
  );
}
