# Design log

## 2026-10-11 · dbdiagramr · quiet
Direction: Console Quiet (A) — SUPERSEDED by Sticker Pack revamp
Ground: cool slate #F8FAFC | Shape: 8px radius, 1px borders, shadow only on canvas | Density: dense/work-first, 56px nav, 380px rail | Layout: /visualize split rail+canvas, home left-aligned work-first
Type voice: engineered psql-native (faces: IBM Plex Sans UI/headings, IBM Plex Mono code-only) | Imagery: live diagram only, no stock | Palette: text #0F172A, muted #64748B, accent indigo #4338CA

## 2026-10-11 · dbdiagramr · balanced (revamp)
Direction: Sticker Pack (C)
Ground: warm paper #FFF7ED | Shape: 14px radius, 2px cocoa borders, 4px hard offset shadows, zero blur | Density: roomy marketing, dense canvas | Layout: home hero = full-bleed live canvas w/ floating card+toolbar, /visualize = full-screen canvas + floating panel
Type voice: playful board-game (faces: Nunito 800/900 headings+UI, IBM Plex Mono code-only) | Imagery: live diagram only, no stock | Palette: ink cocoa #431407, muted #9A3412, accent orange-700 #C2410C, 6-sticker table rotation
Note: clear .next after token changes — stale webpack cache served old Tailwind tokens to dev AND build.

## 2026-10-11 · dbdiagramr · balanced (figma revamp)
Direction: user's Figma Product Design (DBdiagramr-Home-Page) — supersedes all above
Ground: pale green #F3FFE6 | Shape: 20px cards, 10px buttons, 20px meta pills, 1px hairlines, soft shadows | Density: roomy bands, dense canvas | Layout: hero canvas (wheel-zoom OFF so page scrolls) → demo tabs → 4 alternating feature cards → pale everyone band → solved bento 1+2/2+1 → two-ways → dark asymmetric blog grid → dark footer w/ giant headline
Type voice: Instrument Sans 600 headlines + Plex Mono code/machines | Imagery: live diagram only, dark #1E1E1E table nodes w/ green sticker headers | Palette: ink #1E1E1E, muted #55604C, accent #3D7E16, soft #EAF2E4, punch #7AA861
Components: pills.tsx (GreenButton/OutlineButton/MetaPill), dark schema cards w/ table-count + View-diagram pills, dual-button dark CTA bands. Deleted dead ui files (shiny-button, theme-toggle, variable-font-hover). Note: feat/ui-revamp branch is ancient (predates current main) — not reused.

## 2026-10-11 · dbdiagramr · figma copy + scroll fix + hero declutter
Layout: centered Figma headline + buttons on top, sample toolbar row, live preview in a contained rounded-20 frame below (nothing floats over the canvas). New `minimal` prop on SchemaDiagram hides minimap + download menu in embedded previews (zoom controls stay). Fixed dropped `passive` field declaration that broke the build.
Copy: hero now uses exact Figma copy (H1/sub/CTAs); home CTA band added w/ Figma "Ready to visualize your database?" + Try it free + GitHub.
 Scroll: hero preview is now fully passive (new `passive` prop: zoomOnScroll=false + preventScrolling=false + panOnDrag/nodesDraggable/elementsSelectable=false + touch-action:pan-y override). Root cause of trap: ReactFlow `preventScrolling` defaults true AND `.react-flow__pane{touch-action:none}` — zoomOnScroll=false alone was insufficient. Verified in @xyflow/system source: with preventScrolling=false the wheel handler returns before preventDefault.

## 2026-10-11 · dbdiagramr · about goes dark
About "Database visualization for everyone" band: near-white surface replaced with dark ink band (white headline, punch-green accent, white/70 copy) — no more white block between the pale sections.

## 2026-10-11 · dbdiagramr · figma logo
Logo: Figma "db" mark (green #7AA861 rounded square, white serif db) saved as public/db-logo.svg; Navbar + footer now use it (old Logo_noBG.png fully unreferenced). favicon.svg replaced (was a plain indigo placeholder square).

## 2026-10-11 · dbdiagramr · link explorer
BlogTeaser link walls replaced with a tabbed LinkExplorer (Free tools (17) / Schemas (8)) rendering scannable chips with green hover — one compact card, no dead space.

## 2026-10-11 · dbdiagramr · declutter batch
Schemas hub: Show more/less (6 + rest). Modal redesigned to screenshot (max-w-lg, darker overlay, 28px headline, roomier CTA). Em/en dashes removed from all UI statements (titles use |, labels use :, prose uses commas/periods; datetime + code untouched). TwoWays removed from all 5 tool pages + file deleted. DB previews removed from 4 landing pages, kept only on postgres-er-diagram (+ schema/[slug] core diagrams). Converter callouts/borders/buttons unified; zero hardcoded hex and zero indigo left in app/components.

## 2026-10-12 · dbdiagramr · remove 4 tool pages
Deleted routes supabase-schema-diagram, free-schema-generator, database-diagram-online, postgres-schema-visualizer (17 tools down to 13). Stripped every reference: tools hub array + JSON-LD description, RelatedTools, BlogTeaser toolLinks (LinkExplorer count auto), footer Guides (swapped in Analyzer + Formatter), sitemap entries + lastmods, blog Try-it box, csv/json exploreLinks, conn-string siblings. Zero slug matches left in code; tsc clean; build green at 62 pages.

## 2026-10-12 · dbdiagramr · sql formatter revamp
Rebuilt SqlFormatter: ActionRow below panels (Copy SQL / Visualize this schema / Download .sql, 44px targets) replacing tiny dark-header text buttons, with goVisualizeWithSql handoff gated on parseSqlToSchema finding tables (old bare link dropped users on an empty board). Messy sample preloads on arrival; header shows input to output line delta (1 to 15 lines); output panel gets a scroll-locked line-number gutter; error block with title + extracted line/col + hint + raw message; Already formatted chip on no-op; keyword/indent become segmented controls (10px system radius) and samples become accent outline pills; PostgreSQL MetaPill; formatting debounced 200ms; textarea text-base on mobile (iOS zoom fix); aria-label; keyword/indent persist to localStorage. tsc clean, build green, all states verified in browser.

## 2026-10-12 · dbdiagramr · tool family styling pass
Rolled the formatter treatment across all 11 remaining tools. New shared lib/useDebouncedValue (200ms) wired into every per-keystroke parser (csv, json, mermaid, prisma, ts, dbml, diff x2, prisma-erd). Every dark output panel gets a scroll-locked line-number gutter, a titled error block (title + hint + raw message), and a centered two-line empty state. Duplicate Copy text-buttons removed from dark headers (ActionRow below already covers it). Input headers show line counts (schema.sql, query.sql, old/new.sql, schema.prisma). TS mode and DBML direction toggles become segmented controls; conn-string presets become 20px pills; analyzer severity pills to 20px; validator dark panel to bg-ink token; all rounded-lg inputs/buttons to 10px; aria-labels on every tool textarea. tsc clean, build green at 62 pages, TS/Diff/Validator/ConnString verified in browser.

## 2026-10-12 · dbdiagramr · blog CTA button mismatch
Blog post CTA band had mismatched buttons: green Try it free at text-xs beside Browse schemas with no text size (rendered 16px vs 12px), rounded-lg vs 10px, border-white/20 vs family-standard white/40. Aligned Browse schemas to text-xs, rounded-[10px], border-white/40 to match the blog hub band. Swept all usages: the only other outline-on-dark buttons (blog hub GitHub, ToolPageShell, CtaBand) already match; lone green CTAs on 8 landing pages untouched. Verified both buttons at identical 42px in browser; tsc clean, build green.
## 2026-10-11 · dbdiagramr · showcase consistency + remove twoways
Watch it work: header rebuilt to band standard (centered kicker/headline/sub, 6xl), step tabs centered with mono numerals + accent dots. TwoWaysToUse removed from home (file kept for SEO pages at the time; deleted in declutter batch).

## 2026-10-11 · dbdiagramr · product screenshots
4 WEBP captures moved to public/product/ (paste-sql, connect-database, search-filter, hover-trace); ProductShowcase slides now use them. Frame: image fills container (object-cover, matching 5760:2904 aspect), 2px border instead of shadow.

## 2026-10-19 · dbdiagramr · visualize connect mode full-height
The Paste SQL / Connect toggle collapsed Connect: page went min-h-screen items-start, rail h-auto, TryModal h-auto (from commit 07f9b83 "parent modal adjusts to child height on connect tab"), so the white rail stopped mid-screen with cream below it while the board stayed tall. Both modes now share the full-height shell (h-screen lg:items-stretch, rail lg:h-auto, board min-h-0 flex-1), and TryModal gained an opt-in fill prop set only by /visualize so /database-schema-analyzer keeps its content-height card. The connect card hugs content at the top of the full rail (max-h-full, middle region scrolls when the safety accordion opens) instead of stretching to leave a dead gap; Generate diagram sits under the form, the spinner swaps into that button slot while loading, and error/result cards center vertically. Board empty state is mode-aware (connect: database icon, No diagram yet, Read-only + TLS verified pills; sql unchanged). Verified both modes at 1440 + 390, analyzer untouched; tsc clean, lint clean, build green at 62 pages.

## 2026-10-20 · dbdiagramr · native smooth scroll
Native smooth scroll was already on (scroll-smooth on the html element) but inconsistent: Navbar and ConnStringBuilder forced JS behavior:"smooth" (which ignores prefers-reduced-motion), and the footer Features link (href="#features") was dead on the ~10 non-home pages Footer renders on. Moved scroll-behavior:smooth into a prefers-reduced-motion:no-preference base rule and dropped the scroll-smooth utility; removed the forced smooth from JS so reduce-mode users get instant jumps; footer Features now points to /#features (smooth on home, lands on the section from any page); #guide gained scroll-mt-16. Next 14 keeps route changes instant via handleSmoothScroll and only lets hash changes animate. Verified sampled scroll animates (0 → 2279 with the target landing at 64px under the nav) and the cross-page footer link lands at 64px; tsc clean, lint clean, build green.

## 2026-10-21 · dbdiagramr · postgres guide + sitewide FAQ accordion
Postgres guide rebuilt in the landing language: cream band, BlogTeaser header (mono kicker, "PostgreSQL ER diagrams, explained", OutlineButton), two borderless cards (bg-ink type rows, bg-accent-soft 01/02/03 steps + privacy note), copy and postgresFaqs/postgresHowToSteps kept verbatim for JSON-LD. New FaqAccordion (exclusive single-open, 300ms ease-in-out grid-template-rows + opacity, plus rotates 45deg, white open card, full aria wiring) now renders every FAQ surface: landing (2-col bg-surface), ToolPageShell + tool/alternative/schema pages (1-col bordered card, 60px header target), RLS page (flush divided rows in its existing container). tsc clean, lint clean, build green at 80 pages; verified closed/open heights, rotate 45deg, exclusivity, desktop + 390.

## 2026-10-21 · dbdiagramr · Lenis smooth scroll
Native CSS smooth felt abrupt, so replaced it with Lenis 1.3.27: lerp 0.09, autoRaf, smooth wheel only (touch stays native), anchors:true (Lenis honors scroll-margin-top, so targets still land 64px under the fixed nav), allowNestedScroll for textareas/panels, stopInertiaOnNavigate, and respectReducedMotion (default) for reduce users. New components/SmoothScroll mounted in the root layout with lenis.css; lib/scroll.ts routes Navbar logo/anchors and ConnStringBuilder through lenis.scrollTo. data-lenis-prevent on the visualize board so React Flow wheel zoom/pan still works. Verified real-wheel scroll eases over ~1s, /#features and #demo land at the right offset, nested SQL textarea scrolls natively with the page fixed, Lenis survives client navigation, prod build serves it; tsc clean, lint clean (2 pre-existing img warnings).
