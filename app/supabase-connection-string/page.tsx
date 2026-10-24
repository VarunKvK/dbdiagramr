import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import FaqAccordion from "@/app/sections/FaqAccordion";
import AuthorByline from "@/components/AuthorByline";
import { GreenButton, MetaPill, OutlineButton } from "@/components/ui/pills";
import { toIsoDateTime } from "@/lib/dates";
import {
  breadcrumbNode,
  organizationRef,
  personNode,
  PERSON_URL,
} from "@/lib/structuredData";

const URL = "https://www.dbdiagramr.space/supabase-connection-string";
const TITLE = "Supabase Connection String: Every Mode, Port and Setting";
const DESCRIPTION =
  "Supabase connection strings explained: direct, session and transaction poolers, ports 5432 and 6543, usernames, SSL, and official driver settings.";
const PUBLISHED = "2026-10-25";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "supabase connection string",
    "supabase transaction pooler",
    "supabase session pooler",
    "supabase direct connection",
    "supabase port 6543",
    "supabase pgbouncer",
  ],
  authors: [{ name: "Varun Krishnan", url: PERSON_URL }],
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "article",
    url: URL,
    publishedTime: toIsoDateTime(PUBLISHED),
    modifiedTime: toIsoDateTime(PUBLISHED),
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/DbDiagramr-OG.png"],
  },
};

const faqs = [
  {
    q: "Which Supabase connection string should I use?",
    a: "Use the shared transaction pooler on port 6543 for serverless or edge functions, with prepared statements disabled. Use the shared session pooler on port 5432 for a persistent backend on an IPv4-only network. Use the direct connection on port 5432 when you have IPv6 or the IPv4 add-on, especially for migrations and pg_dump.",
  },
  {
    q: "Why does the direct Supabase host fail with ENOTFOUND?",
    a: "The direct host db.[ref].supabase.co is IPv6 by default. On an IPv4-only network the hostname has no IPv4 address, so Node reports getaddrinfo ENOTFOUND. Switch to the shared session pooler on port 5432, or buy the IPv4 add-on.",
  },
  {
    q: "Do I need pgbouncer=true with Prisma?",
    a: "For the shared transaction pooler, add pgbouncer=true and keep migrations on a direct or session URL. Prisma 7 recommends omitting the flag on PgBouncer 1.21 or newer, but Supabase documents it for Supavisor, and it is the safe setting for Prisma on the shared transaction pooler.",
  },
  {
    q: "Can I run migrations through the transaction pooler?",
    a: "No. Prisma Migrate and similar tools need a single session, and transaction mode does not keep session state. Use the direct host or the shared session pooler on port 5432 for migrations, dumps, and schema changes.",
  },
  {
    q: "Where do I copy the Supabase connection string?",
    a: "Open the Supabase Dashboard, choose Connect, select the mode, and copy the whole string. Replace only the password placeholder. Do not build the pooler hostname yourself, because it includes a pooler cluster index that is not the region name.",
  },
  {
    q: "Does sslmode=require verify the Supabase certificate?",
    a: "No. require encrypts the connection but does not verify the server identity. Use verify-full with Supabase's prod-ca-2021.crt root certificate when you need verification.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "@id": `${URL}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      url: URL,
      image: "https://www.dbdiagramr.space/DbDiagramr-OG.png",
      datePublished: toIsoDateTime(PUBLISHED),
      dateModified: toIsoDateTime(PUBLISHED),
      inLanguage: "en-US",
      author: personNode(),
      publisher: organizationRef(),
      mainEntityOfPage: URL,
      about: {
        "@type": "Thing",
        name: "Supabase PostgreSQL connection strings",
      },
    },
    breadcrumbNode([
      { name: "Home", url: "https://www.dbdiagramr.space" },
      { name: "Supabase Connection String", url: URL },
    ]),
  ],
};

const prose =
  "max-w-none leading-relaxed text-muted [&_h2]:mt-16 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 hover:[&_a]:text-accent-hover [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-top [&_th]:font-medium [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-muted [&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white/85 [&_code]:break-words [&_code]:rounded [&_code]:bg-ink/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-ink [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/85";

export default function SupabaseConnectionStringPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted">
          <Link href="/" className="font-medium text-accent hover:text-accent-hover">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span>Supabase connection string</span>
        </nav>

        <header>
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            Supabase guide
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            Supabase connection string: every mode, port and setting
          </h1>
          <AuthorByline
            published={PUBLISHED}
            readingMinutes={10}
            verb="Written by"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <MetaPill>
              <time dateTime="2026-10-25">Verified Oct 25, 2026</time>
            </MetaPill>
            <MetaPill>
              <time dateTime="2026-10-23">Pooler tested Oct 23, 2026</time>
            </MetaPill>
          </div>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Supabase gives one database four connection modes: direct, shared
            session, shared transaction, and dedicated. The host, port, and
            username change between them. This guide shows which string belongs
            where, how to disable prepared statements, and what each connection
            error actually means.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <GreenButton href="/postgres-connection-string">
              Check your connection string →
            </GreenButton>
            <OutlineButton href="/supabase-er-diagram">
              Visualize a Supabase schema
            </OutlineButton>
          </div>
        </header>

        <nav
          aria-label="On this page"
          className="mt-10 rounded-[20px] border border-border bg-surface p-5"
        >
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            On this page
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {[
              ["#modes", "The four modes"],
              ["#choose", "Choose a mode"],
              ["#copy-the-string", "Copy the string"],
              ["#usernames", "Usernames"],
              ["#password", "Password encoding"],
              ["#ssl", "SSL"],
              ["#prisma", "Driver settings"],
              ["#errors", "Errors"],
              ["#faq", "FAQ"],
              ["#sources", "Sources"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="font-medium text-accent hover:text-accent-hover"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        <article className={prose}>
          <section>
            <h2>The short answer</h2>
            <ul>
              <li>
                <strong>Serverless or edge:</strong> shared transaction pooler,
                port <code>6543</code>, prepared statements off.
              </li>
              <li>
                <strong>Persistent app on IPv4:</strong> shared session pooler,
                port <code>5432</code>.
              </li>
              <li>
                <strong>IPv6 network or IPv4 add-on:</strong> direct connection,
                port <code>5432</code>.
              </li>
              <li>
                <strong>Paid, high-performance app:</strong> dedicated pooler,
                port <code>6543</code>, transaction mode only.
              </li>
              <li>
                <strong>Migrations, <code>pg_dump</code>, schema tools:</strong>{" "}
                direct or shared session. Never the transaction pooler.
              </li>
            </ul>
            <p>
              The shared pooler is IPv4 on every plan. The direct and dedicated
              endpoints are IPv6 by default; IPv4 needs Supabase’s paid IPv4
              add-on. That one difference explains most <code>ENOTFOUND</code>{" "}
              reports.
            </p>
          </section>

          <section id="modes" className="scroll-mt-24">
            <h2>All four Supabase connection modes</h2>
            <div className="mt-6 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Mode</th>
                    <th scope="col">Host pattern</th>
                    <th scope="col">Port</th>
                    <th scope="col">IPv4 / IPv6 by plan</th>
                    <th scope="col">Username format</th>
                    <th scope="col">Prepared statements</th>
                    <th scope="col">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Direct</strong></td>
                    <td><code>db.[ref].supabase.co</code></td>
                    <td><code>5432</code></td>
                    <td>IPv6 by default; IPv4 add-on</td>
                    <td><code>postgres</code></td>
                    <td>Yes</td>
                    <td>Migrations, <code>pg_dump</code>, long-lived IPv6 apps</td>
                  </tr>
                  <tr>
                    <td><strong>Shared session</strong></td>
                    <td><code>aws-[n]-[region].pooler.supabase.com</code></td>
                    <td><code>5432</code></td>
                    <td>IPv4 on every plan</td>
                    <td><code>postgres.[ref]</code></td>
                    <td>Yes</td>
                    <td>Persistent IPv4 apps, BI tools, database GUIs</td>
                  </tr>
                  <tr>
                    <td><strong>Shared transaction</strong></td>
                    <td><code>aws-[n]-[region].pooler.supabase.com</code></td>
                    <td><code>6543</code></td>
                    <td>IPv4 on every plan</td>
                    <td><code>postgres.[ref]</code></td>
                    <td>No</td>
                    <td>Serverless, edge, short-lived connections</td>
                  </tr>
                  <tr>
                    <td><strong>Dedicated</strong></td>
                    <td><code>db.[ref].supabase.co</code></td>
                    <td><code>6543</code></td>
                    <td>Paid plans; IPv6 by default, IPv4 add-on</td>
                    <td><code>postgres</code></td>
                    <td>No</td>
                    <td>High-performance apps on paid plans</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The dedicated pooler shares a hostname with the direct connection
              and uses port <code>6543</code>. It supports transaction mode only.
              A session-mode connection on a paid plan still goes through the
              shared pooler.
            </p>
            <p>
              <code>[n]</code> is a pooler cluster index, not part of the region.
              A region can have more than one. Copy the full host from{" "}
              <strong>Dashboard → Connect</strong>; do not assemble it from a
              blog post or from memory.
            </p>
          </section>

          <section id="choose" className="scroll-mt-24">
            <h2>Which mode should you use?</h2>
            <p>
              Match the mode to the lifetime of the connection, not to the
              framework name.
            </p>
            <ol>
              <li>
                <strong>Vercel, Cloudflare, Lambda, or another short-lived
                runtime:</strong> shared transaction on <code>6543</code>. Turn
                off prepared statements in the driver.
              </li>
              <li>
                <strong>Long-running server on an IPv4-only network:</strong>{" "}
                shared session on <code>5432</code>. It keeps session state and
                supports prepared statements.
              </li>
              <li>
                <strong>Long-running server with IPv6:</strong> direct on{" "}
                <code>5432</code>. It has the fewest moving parts.
              </li>
              <li>
                <strong>High connection volume on a paid plan:</strong> dedicated
                pooler on <code>6543</code>. Budget for transaction-mode limits.
              </li>
              <li>
                <strong>Migration or dump:</strong> direct or shared session.
                Transaction pooling cannot hold the session your tool needs.
              </li>
            </ol>
            <p>
              When in doubt, a shared session string is the safest diagnostic
              default because it works on IPv4 and accepts prepared statements.
              Move to transaction mode once you know the deployment is
              serverless.
            </p>
          </section>

          <section id="copy-the-string" className="scroll-mt-24">
            <h2>Copy the string from Supabase</h2>
            <ol>
              <li>Open the Supabase Dashboard for the project.</li>
              <li>Choose <strong>Connect</strong>.</li>
              <li>Select Direct, Session pooler, Transaction pooler, or Dedicated pooler.</li>
              <li>Copy the complete string.</li>
              <li>Replace only the password placeholder.</li>
            </ol>
            <pre><code>{`postgresql://postgres.[ref]:[password]@aws-[n]-[region].pooler.supabase.com:5432/postgres?sslmode=require`}</code></pre>
            <p>
              Keep the host and username exactly as shown. The shared pooler
              username is <code>postgres.[ref]</code>, not <code>postgres</code>.
              A custom database role follows the same{" "}
              <code>role.[ref]</code> shape on the shared pooler.
            </p>
            <p>
              Test the string before wiring it into the app:
            </p>
            <pre><code>{`psql "postgresql://postgres.[ref]:[password]@aws-[n]-[region].pooler.supabase.com:5432/postgres?sslmode=require" -c "select 1"`}</code></pre>
            <p>
              If that succeeds, the host, port, username, password, and TLS
              settings are all working. If it fails, the error usually names the
              layer that broke.
            </p>
          </section>

          <section id="usernames" className="scroll-mt-24">
            <h2>Usernames are the second-most-common break</h2>
            <div className="mt-6 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Mode</th>
                    <th scope="col">Username</th>
                    <th scope="col">What goes wrong</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Direct</td>
                    <td><code>postgres</code></td>
                    <td>Adding <code>.[ref]</code> produces an authentication failure.</td>
                  </tr>
                  <tr>
                    <td>Dedicated</td>
                    <td><code>postgres</code></td>
                    <td>Same as direct: plain role, no project suffix.</td>
                  </tr>
                  <tr>
                    <td>Shared session</td>
                    <td><code>postgres.[ref]</code></td>
                    <td>Dropping <code>.[ref]</code> gives <code>Tenant or user not found</code>.</td>
                  </tr>
                  <tr>
                    <td>Shared transaction</td>
                    <td><code>postgres.[ref]</code></td>
                    <td>Dropping <code>.[ref]</code> gives the same tenant error.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              The shared pooler has to find the tenant before it can find the
              role. Without the project ref, <code>postgres</code> is ambiguous.
              Supabase returns <code>Tenant or user not found</code> or{" "}
              <code>FATAL: (ENOTFOUND) tenant/user postgres.[ref] not found</code>{" "}
              when the host and username do not belong together.
            </p>
            <p>
              The fix is not to guess. Copy both values from the same Connect
              string. If you rotate credentials, use the same role and project
              ref; the pooler may keep old credentials until existing
              connections recycle.
            </p>
          </section>

          <section id="password" className="scroll-mt-24">
            <h2>Passwords and URL encoding</h2>
            <p>
              A connection string is a URL. A raw <code>@</code> changes where
              the password ends. A raw <code>#</code> starts a fragment, and a
              raw <code>/</code> starts the database path. Encode reserved
              characters before placing a password in the URI:
            </p>
            <pre><code>{`raw:      p@ss word
encoded:  p%40ss%20word`}</code></pre>
            <ul>
              <li><code>@</code> becomes <code>%40</code></li>
              <li><code>#</code> becomes <code>%23</code></li>
              <li><code>?</code> becomes <code>%3F</code></li>
              <li><code>/</code> becomes <code>%2F</code></li>
              <li>a space becomes <code>%20</code></li>
            </ul>
            <p>
              A password with only letters and numbers can go in unchanged.
              When in doubt, encode the password component with{" "}
              <code>encodeURIComponent()</code> in JavaScript or{" "}
              <code>urllib.parse.quote()</code> in Python.
            </p>
            <p>
              If the server says <code>FATAL: password authentication failed</code>,
              check the username first, then the password. A correctly encoded
              password for the wrong role still fails. If you reset the password
              in the Dashboard, update every environment variable that uses it
              and restart the app so pooled connections reconnect with the new
              credentials.
            </p>
          </section>

          <section id="ssl" className="scroll-mt-24">
            <h2>SSL: require encrypts, verify-full verifies</h2>
            <p>
              Supabase accepts unencrypted connections unless you enable SSL
              enforcement. Set <code>sslmode=require</code> at minimum. It
              encrypts traffic, but it does not verify that the server is really
              Supabase.
            </p>
            <p>
              To verify the server identity, download the Supabase root
              certificate from <strong>Database settings</strong> and use{" "}
              <code>verify-full</code> with <code>sslrootcert</code>:
            </p>
            <pre><code>{`postgresql://postgres.[ref]:[password]@aws-[n]-[region].pooler.supabase.com:5432/postgres?sslmode=verify-full&sslrootcert=prod-ca-2021.crt`}</code></pre>
            <p>
              The certificate filename is <code>prod-ca-2021.crt</code>. Keep it
              out of source control if your deployment policy treats
              certificates as configuration. For most applications,{" "}
              <code>sslmode=require</code> is the practical default;{" "}
              <code>verify-full</code> is the stronger choice when you can ship
              and rotate the CA.
            </p>
            <p>
              Do not use <code>sslmode=prefer</code> for Supabase. It allows a
              silent fallback to an unencrypted connection. Do not use{" "}
              <code>sslmode=disable</code> outside a local test.
            </p>
          </section>

          <section id="prisma" className="scroll-mt-24">
            <h2>Driver settings for transaction mode</h2>
            <p>
              Transaction pooling hands a server connection back after each
              transaction. Session state and named prepared statements do not
              survive. Each driver disables them differently:
            </p>
            <div className="mt-6 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Driver</th>
                    <th scope="col">Setting</th>
                    <th scope="col">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Prisma</td>
                    <td><code>?pgbouncer=true</code></td>
                    <td>Use a direct or session URL for migrations.</td>
                  </tr>
                  <tr>
                    <td>Drizzle + postgres.js</td>
                    <td><code>prepare: false</code></td>
                    <td>Set it when creating the client.</td>
                  </tr>
                  <tr>
                    <td>node-postgres</td>
                    <td>Omit <code>name</code></td>
                    <td>An unnamed query is not a named prepared statement.</td>
                  </tr>
                  <tr>
                    <td>psycopg 3</td>
                    <td><code>prepare_threshold=None</code></td>
                    <td>Disables automatic prepared statements.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Prisma</h3>
            <pre><code>{`DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-[n]-[region].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-[n]-[region].pooler.supabase.com:5432/postgres?sslmode=require"`}</code></pre>
            <p>
              On Prisma 6, put <code>{'directUrl = env("DIRECT_URL")'}</code> in the
              datasource block and use <code>DATABASE_URL</code> for the pooled
              runtime connection. On Prisma 7 and later,{" "}
              <code>directUrl</code> is deprecated: put the direct or session
              URL in <code>prisma.config.ts</code> as{" "}
              <code>datasource.url</code>, and create Prisma Client with a
              driver adapter such as <code>@prisma/adapter-pg</code>.
            </p>
            <p>
              Prisma 7 recommends leaving out <code>pgbouncer=true</code> on
              PgBouncer 1.21 or newer. Supabase’s pooler is Supavisor, and
              Supabase still documents the flag for pooled Prisma connections.
              Keep it on the shared transaction string; it is the setting Prisma
              expects for a pooler that does not support prepared statements.
            </p>

            <h3>Drizzle with postgres.js</h3>
            <pre><code>{`import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });`}</code></pre>

            <h3>node-postgres</h3>
            <pre><code>{`await client.query({ text: "select 1" });`}</code></pre>
            <p>
              Leave out <code>name</code>. Supplying a name turns the query into
              a prepared statement that the next transaction may not find.
            </p>

            <h3>psycopg 3</h3>
            <pre><code>{`import psycopg

conn = psycopg.connect(conninfo, prepare_threshold=None)`}</code></pre>
          </section>

          <section id="errors" className="scroll-mt-24">
            <h2>Supabase connection errors and what they mean</h2>
            <div className="mt-6 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Error</th>
                    <th scope="col">Cause</th>
                    <th scope="col">Fix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>getaddrinfo ENOTFOUND db.[ref].supabase.co</code></td>
                    <td>IPv4-only network hitting the IPv6-only direct host.</td>
                    <td>Use shared session on <code>5432</code>, or buy the IPv4 add-on.</td>
                  </tr>
                  <tr>
                    <td><code>FATAL: (ENOTFOUND) tenant/user postgres.[ref] not found</code></td>
                    <td>Pooler host and username are from different modes or projects.</td>
                    <td>Copy host and username from the same Connect string.</td>
                  </tr>
                  <tr>
                    <td><code>prepared statement &quot;s0&quot; already exists</code></td>
                    <td>Named prepared statements through transaction pooling.</td>
                    <td>Disable them in the driver, or use direct or shared session.</td>
                  </tr>
                  <tr>
                    <td><code>FATAL: password authentication failed</code></td>
                    <td>Wrong role or password, or the password is not URL-encoded.</td>
                    <td>Check the username, encode reserved characters, then reset if needed.</td>
                  </tr>
                  <tr>
                    <td><code>ENETUNREACH</code> / <code>ETIMEDOUT</code></td>
                    <td>An IPv6 address was returned but the network has no route or is blocked.</td>
                    <td>Use the shared pooler or add IPv4.</td>
                  </tr>
                  <tr>
                    <td><code>Max client connections reached</code> / <code>No more connections allowed (max_client_conn)</code></td>
                    <td>The pooler has exhausted its client connection limit.</td>
                    <td>Use transaction mode, reduce pool size, close clients, or upgrade compute.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Start with the exact error text. <code>ENOTFOUND</code> is a DNS
              problem, <code>ETIMEDOUT</code> is a path problem, and{" "}
              <code>password authentication failed</code> is a credential
              problem. They point at different fixes.
            </p>
          </section>

          <section id="tested" className="scroll-mt-24">
            <h2>What was tested</h2>
            <p>
              On October 23, 2026, both shared pooler modes connected to a
              20-table test project and read the schema plus Supabase’s{" "}
              <code>auth</code> and <code>storage</code> tables. Session mode on{" "}
              <code>5432</code> and transaction mode on <code>6543</code> each
              completed in 2–4 seconds. Prepared statements were disabled for
              the transaction-mode run.
            </p>
            <p>
              The direct endpoint was not tested from an IPv4-only network. Its
              IPv6 default and the IPv4 add-on behavior come from Supabase’s
              current connection docs, not from that test run.
            </p>
          </section>

          <section id="faq" className="scroll-mt-24">
            <h2>Frequently asked questions</h2>
            <div className="mt-6 [&_h3]:mt-0 [&_p]:mt-0">
              <FaqAccordion items={faqs} variant="card" columns={1} />
            </div>
          </section>

          <section id="sources" className="scroll-mt-24">
            <h2>Sources</h2>
            <ul>
              <li>
                <a href="https://supabase.com/docs/guides/database/connecting-to-postgres">
                  Supabase: Connecting to your database
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits">
                  Supabase: Connection pooling and limits
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP">
                  Supabase: IPv4 and IPv6 compatibility
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/platform/ssl-enforcement">
                  Supabase: Postgres SSL enforcement
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL">
                  Supabase: Disabling prepared statements
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/troubleshooting/fatal-password-authentication-failed">
                  Supabase: Password authentication failed
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found">
                  Supabase: Tenant or user not found
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/troubleshooting/too-many-connections-for-database-postgres">
                  Supabase: Too many connections
                </a>
              </li>
              <li>
                <a href="https://supabase.com/docs/guides/database/prisma">
                  Supabase: Connecting with Prisma
                </a>
              </li>
              <li>
                <a href="https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer">
                  Prisma 7: Configure Prisma Client with PgBouncer
                </a>
              </li>
              <li>
                <a href="https://orm.drizzle.team/docs/connect-supabase">
                  Drizzle: Connect Supabase
                </a>
              </li>
              <li>
                <a href="https://node-postgres.com/features/queries#prepared-statements">
                  node-postgres: Prepared statements
                </a>
              </li>
              <li>
                <a href="https://www.psycopg.org/psycopg3/docs/advanced/prepare.html">
                  psycopg 3: Prepared statements
                </a>
              </li>
            </ul>
          </section>
        </article>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Keep going
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                href: "/postgres-connection-string",
                title: "PostgreSQL Connection String Builder",
                body: "Build or decode any PostgreSQL URI, with presets for Supabase, Neon, and Railway.",
              },
              {
                href: "/supabase-er-diagram",
                title: "Supabase Schema Diagram",
                body: "Connect a Supabase project and see public, auth, and storage tables as an ER diagram.",
              },
              {
                href: "/supabase-rls-check",
                title: "Supabase RLS Check",
                body: "Find public tables with RLS off, RLS with no policies, or policies that need review.",
              },
              {
                href: "/blog/supabase-connection-string-ipv6-enotfound",
                title: "Fix Supabase ENOTFOUND",
                body: "A shorter walkthrough of the IPv4 and IPv6 failure and the pooler fix.",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-[20px] border border-border bg-surface p-5 transition-colors hover:border-accent/60"
              >
                <div className="flex items-start justify-between gap-2 font-medium text-ink">
                  <span>{link.title}</span>
                  <span className="shrink-0 text-accent">→</span>
                </div>
                <div className="mt-1 text-sm text-muted">{link.body}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[20px] bg-ink px-8 py-12 text-center">
            <h2 className="text-2xl font-semibold text-white">
              Check your Supabase string
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">
              Paste a connection string into the free checker. It runs in your
              browser, flags the mode, port, username, SSL, and Prisma
              settings, and never sends the password anywhere.
            </p>
            <GreenButton href="/postgres-connection-string" className="mt-6">
              Open the checker →
            </GreenButton>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
