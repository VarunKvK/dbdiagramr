import Image from "next/image";
import AskAi from "@/app/sections/AskAi";

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

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-6 md:flex-row md:items-center">
          <p className="text-xl font-semibold text-white">
            &copy; 2026 dbdiagramr. Free and open source (MIT).
          </p>
          <div className="flex items-center gap-8 text-xl font-semibold">
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
              href="https://x.com/im_daedalus"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-punch"
              aria-label="dbdiagramr on X"
            >
              X
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
