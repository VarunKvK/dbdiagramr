import Image from "next/image";
import AskAi from "@/app/sections/AskAi";

const badges = [
  {
    href: "https://www.codehype.ai/product/dbdiagramr?utm_source=codehype_badge",
    src: "https://www.codehype.ai/badges/dbdiagramr.svg?variant=find-us&v=20",
    alt: "Featured on CodeHype",
    width: 180,
    height: 65,
    rel: "noopener noreferrer",
  },
  {
    href: "https://noonlaunch.com/product/dbdiagramr",
    src: "https://noonlaunch.com/badges/dbdiagramr.svg",
    alt: "Featured on Noonlaunch",
    width: 220,
    height: 60,
    rel: "noopener noreferrer dofollow",
  },
  {
    href: "https://braginpublic.com/?utm_source=badge&utm_medium=referral",
    src: "https://braginpublic.com/badge?theme=light",
    alt: "Featured on Brag in Public",
    width: 208,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    href: "https://scrappystartups.com/startup/dbdiagramr",
    src: "https://scrappystartups.com/badge.svg?theme=light",
    alt: "Find us on Scrappy Startups",
    width: 305,
    height: 56,
    rel: "noopener noreferrer",
  },
  {
    href: "https://www.betterlaunch.co/product/dbdiagramr",
    src: "https://www.betterlaunch.co/badge-launching-dark.svg",
    alt: "Dbdiagramr on Better Launch",
    width: 200,
    height: 56,
    rel: "noopener noreferrer",
  },
  {
    href: "https://buildrship.xyz/products/dbdiagramrspace",
    src: "https://buildrship.xyz/assets/featured-on-buildrship-v2.png",
    alt: "Featured on Buildrship",
    width: 163,
    height: 65,
    rel: "noopener",
  },
  {
    href: "https://startupfa.st",
    src: "https://startupfa.st/images/badges/powered-by-light.svg",
    alt: "Powered by Startup Fast",
    width: 150,
    height: 44,
    rel: "noopener noreferrer",
  },
];

const badgeCopies = [0, 1, 2];

export default function Footer() {
  return (
    <div className="bg-cream px-4 pb-6 md:px-6">
      <AskAi />
      <footer className="mx-auto max-w-7xl rounded-[20px] bg-ink px-6 py-10 text-white md:px-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-md">
            <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Image
                src="/db-logo.svg"
                alt="dbdiagramr logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              dbdiagramr
            </span>
            <p className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Paste SQL. See your schema. Ship{" "}
              <span className="text-punch">faster.</span>
            </p>
            <p className="mt-4 text-sm font-medium text-white/60">
              Visualize your PostgreSQL database in seconds.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h3 className="mb-4 text-xl font-semibold">Product</h3>
              <ul className="space-y-3 text-lg font-medium text-white/70">
                <li><a href="/#features" className="transition-colors hover:text-white">Features</a></li>
                <li>
                  <a href="/changelog" className="transition-colors hover:text-white">
                    Changelog
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/VarunKvK/dbdiagramr/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">Resources</h3>
              <ul className="space-y-3 text-lg font-medium text-white/70">
                <li>
                  <a href="/schema" className="transition-colors hover:text-white">Schema Library</a>
                </li>
                <li>
                  <a href="/alternatives" className="transition-colors hover:text-white">Alternatives</a>
                </li>
                <li>
                  <a href="/blog" className="transition-colors hover:text-white">Blog</a>
                </li>
                <li>
                  <a href="/about" className="transition-colors hover:text-white">About</a>
                </li>
                <li>
                  <a
                    href="https://github.com/VarunKvK/dbdiagramr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-xl font-semibold">Guides</h3>
              <ul className="space-y-3 text-lg font-medium text-white/70">
                <li>
                  <a href="/supabase-er-diagram" className="transition-colors hover:text-white">Supabase ER Diagram</a>
                </li>
                <li>
                  <a href="/supabase-connection-string" className="transition-colors hover:text-white">Supabase Connection String</a>
                </li>
                <li>
                  <a href="/supabase-rls-check" className="transition-colors hover:text-white">Supabase RLS Check</a>
                </li>
                <li>
                  <a href="/" className="transition-colors hover:text-white">PostgreSQL ER Diagram</a>
                </li>
                <li>
                  <a href="/database-schema-analyzer" className="transition-colors hover:text-white">Schema Health Analyzer</a>
                </li>
                <li>
                  <a href="/sql-formatter" className="transition-colors hover:text-white">SQL Formatter</a>
                </li>
                <li>
                  <a href="/tools" className="transition-colors hover:text-white">All tools →</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-white/15 pt-6 lg:flex-row lg:items-center lg:gap-8">
          <p className="shrink-0 text-xl font-semibold text-white">
            &copy; 2026 dbdiagramr. Free and open source (MIT).
          </p>
          <div
            className="badge-marquee-mask min-w-0 overflow-hidden lg:flex-1"
            role="group"
            aria-label="Featured on"
          >
            <div className="badge-marquee flex w-max items-center">
              {badgeCopies.map((copy) => {
                const isDuplicate = copy > 0;
                return (
                  <div
                    key={copy}
                    data-badge-copy
                    data-badge-dup={isDuplicate ? "" : undefined}
                    aria-hidden={isDuplicate || undefined}
                    className="flex shrink-0 items-center gap-3 pr-3"
                  >
                    {badges.map((badge) => (
                      <a
                        key={badge.href}
                        href={badge.href}
                        target="_blank"
                        rel={badge.rel}
                        tabIndex={isDuplicate ? -1 : undefined}
                        className="inline-flex opacity-90 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <Image
                          src={badge.src}
                          alt={badge.alt}
                          width={badge.width}
                          height={badge.height}
                          unoptimized
                          loading="eager"
                          className="block h-9 w-auto"
                        />
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-8 text-xl font-semibold">
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-punch"
              aria-label="dbdiagramr on GitHub"
            >
              Github
            </a>
            <a
              href="/blog"
              className="transition-colors hover:text-punch"
            >
              Blog
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
