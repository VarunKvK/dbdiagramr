import type { Metadata } from "next";
import Link from "next/link";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import ConnStringBuilder from "@/components/ConnStringBuilder";

const URL = "https://www.dbdiagramr.space/postgres-connection-string";
const TITLE = "PostgreSQL Connection String Builder & Parser";
const DESCRIPTION =
  "Build or decode a PostgreSQL URI, with Supabase, Neon, and Railway presets. The decoder checks pooler mode, port, username, SSL, and Prisma settings.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "postgres connection string, postgresql connection url format, postgresql connection string builder, connection string parser, supabase connection string",
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

const faqs = [
  {
    q: "What is the format of a PostgreSQL connection string?",
    a: "postgresql://user:password@host:port/dbname?sslmode=require. The user and password are percent-encoded when they contain special characters, port defaults to 5432, and query parameters carry options like sslmode, connect_timeout, and application_name.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Build URIs from parts or decode pasted URIs, and check Supabase pooler mode, port, username, SSL, and Prisma settings. Presets cover Supabase, Neon, Railway, and localhost.",
  },
  {
    q: "Is my password uploaded anywhere?",
    a: "No. Building, parsing, and checking run entirely in your browser. Nothing is sent to a server, and when you open the result in dbdiagramr, the connection string travels via sessionStorage, never via URL parameters or server logs.",
  },
  {
    q: "Which providers are supported?",
    a: "Any PostgreSQL URI parses. Presets prefill Supabase (session, transaction, direct, and dedicated), Neon (pooled host, sslmode=require), Railway, and localhost. Both Supabase Session (5432) and Transaction (6543) poolers work for schema introspection. Session mode is the safer default because it supports prepared statements.",
  },
  {
    q: "Can I visualize the database this connects to?",
    a: "Yes. Click Open in dbdiagramr to hand the connection string to the visualizer securely (sessionStorage, not URL params) and get an interactive ER diagram of the live schema.",
  },
];

const prose =
  "max-w-none leading-relaxed text-muted [&_h2]:mt-0 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 hover:[&_a]:text-accent-hover [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-2 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-muted [&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white/85 [&_code]:break-words [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-ink [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/85";

const jsonLd = buildToolJsonLd({
  appName: "PostgreSQL Connection String Builder",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function ConnStringPage() {
  return (
    <ToolPageShell
      appName="PostgreSQL Connection String Builder"
      h1="PostgreSQL connection string builder"
      intro="Build a PostgreSQL URI from parts, or paste one to decode every field and check pooler, SSL, and Prisma settings. Presets for Supabase, Neon, and Railway. Passwords never leave your browser."
      current="/postgres-connection-string"
      siblings={["/", "/visualize"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/", label: "PostgreSQL ER Diagram Tool" },
        { href: "/supabase-connection-string", label: "Supabase Connection String Guide" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ConnStringBuilder />
      <p className="mt-3 text-sm text-muted">
        The decoder runs in your browser and flags Supabase pooler mode, port,
        username, SSL, and Prisma settings. Nothing is uploaded.
      </p>

      <section className="mt-16">
        <div className={prose}>
          <h2>PostgreSQL URI format and provider examples</h2>
          <p>
            Every PostgreSQL connection string uses the same URI shape. The
            differences between providers are the host, the port, the username,
            and whether the endpoint is a pooler.
          </p>
          <pre><code>{`postgresql://user:password@host:5432/database?sslmode=require`}</code></pre>
          <table>
            <thead>
              <tr>
                <th scope="col">Part</th>
                <th scope="col">Example</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Protocol</td>
                <td><code>postgresql://</code></td>
                <td><code>postgres://</code> also works.</td>
              </tr>
              <tr>
                <td>User</td>
                <td><code>postgres</code></td>
                <td>Supabase shared poolers add the project ref.</td>
              </tr>
              <tr>
                <td>Password</td>
                <td><code>p%40ssword</code></td>
                <td>Percent-encode reserved characters.</td>
              </tr>
              <tr>
                <td>Host</td>
                <td><code>db.example.com</code></td>
                <td>Copy it from the provider.</td>
              </tr>
              <tr>
                <td>Port</td>
                <td><code>5432</code></td>
                <td>Supabase transaction pooling uses <code>6543</code>.</td>
              </tr>
              <tr>
                <td>Database</td>
                <td><code>postgres</code></td>
                <td>The database name, not the project name.</td>
              </tr>
              <tr>
                <td>Query</td>
                <td><code>sslmode=require</code></td>
                <td>Carries TLS and driver options.</td>
              </tr>
            </tbody>
          </table>
          <p>
            A raw <code>@</code> in the password ends the userinfo section early.
            Encode it as <code>%40</code>, and encode <code>#</code>,{" "}
            <code>?</code>, <code>/</code>, and spaces too. The{" "}
            <Link href="/supabase-connection-string#password">
              Supabase guide has the full encoding table
            </Link>
            .
          </p>

          <h3>Neon: pooled or direct</h3>
          <p>
            Neon uses the same port for both endpoints. The pooled hostname ends
            in <code>-pooler</code>; the direct hostname does not. Use the pooled
            endpoint for application traffic and the direct endpoint for
            migrations or tools that need session state.
          </p>
          <pre><code>{`# Pooled
postgresql://user:pass@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Direct
postgresql://user:pass@ep-cool-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`}</code></pre>

          <h3>Railway: private and public URLs</h3>
          <p>
            Railway exposes <code>DATABASE_URL</code> for services inside the
            same project. For a connection from your laptop or another network,
            enable the public TCP proxy and use{" "}
            <code>DATABASE_PUBLIC_URL</code>. Both keep the standard PostgreSQL
            URI shape.
          </p>
          <pre><code>{`DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
DATABASE_PUBLIC_URL=postgresql://postgres:password@[proxy-host]:[proxy-port]/railway`}</code></pre>
          <p>
            The host and port in the public URL come from Railway. Copy the
            variable instead of constructing the proxy hostname yourself.
          </p>

          <h3>Supabase: four modes, not one</h3>
          <p>
            Supabase changes the host, port, username, IP support, and prepared
            statement behavior across direct, session, transaction, and
            dedicated connections. The shared pooler is IPv4; direct and
            dedicated endpoints are IPv6 by default, with IPv4 available as a
            paid add-on. Use the{" "}
            <Link href="/supabase-connection-string">
              Supabase connection string guide
            </Link>{" "}
            for the mode table, SSL setup, and driver settings.
          </p>
        </div>
      </section>
    </ToolPageShell>
  );
}
