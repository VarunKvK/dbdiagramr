# DESIGN.md — dbdiagramr · Figma revamp (balanced intensity)

Source of truth: user's Figma `Product Design` file (`DBdiagramr-Home-Page`),
completed in code. Supersedes Console Quiet and Sticker Pack.
One signature element (dark cards on pale green); restraint everywhere else.

## Tokens

Nothing hardcoded below tokens. Legacy aliases kept so routes don't change:
`cream`/`ground` = pale green page, `surface` = near-white cards/panels,
`ink` = near-black, `muted` = green-gray text, `border` = green hairline.

| Role         | Hex       | Usage                                            |
| ------------ | --------- | ------------------------------------------------ |
| ground       | `#F3FFE6` | page ground (`cream`)                            |
| surface      | `#FDFFFB` | panels, light sections                           |
| card dark    | `#1E1E1E` | feature cards, blog cards, schema cards, footer  |
| pine         | `#111E0A` | deepest dark (tool cards hover)                  |
| ink          | `#1E1E1E` | headings, body on light                          |
| muted        | `#55604C` | secondary text on light (≈7:1)                   |
| border       | `#D5E5CB` | 1px hairlines                                    |
| accent       | `#3D7E16` | links, buttons, highlights (≈5.5:1 on ground)    |
| accent-hover | `#2F6111` | button hover                                     |
| accent-soft  | `#EAF2E4` | pale card fill, badge wash                       |
| punch        | `#7AA861` | light-green text/accents on dark, dots           |

Table node stickers (green family, deterministic by schema order):

| # | Header    | Edge      |
| - | --------- | --------- |
| 0 | `#EAF3E4` | `#3D7E16` |
| 1 | `#D9EAD3` | `#1E7E34` |
| 2 | `#E2F0E4` | `#0F766E` |
| 3 | `#F0F7E6` | `#65A30D` |
| 4 | `#DCEFE4` | `#0D9488` |
| 5 | `#E8F3DC` | `#4D7C0F` |

Color is never the only signal: names + PK/FK labels stay.

## Typefaces

- UI + headings: **Instrument Sans** (400/500/600/700). Headlines semibold 600,
  tight tracking, centered on marketing bands (70px hero scale → responsive).
- Code + machine output only: **IBM Plex Mono** (SQL, connection strings,
  table/column names, search, pills, tags).
- Data uses `tabular-nums`. Prose measure 60–75ch.

## Shape, spacing, elevation

- Cards: **20px** radius. Buttons/inputs: **10px**. Meta pills: **20px**
  (date · read time · table count, 12px mono medium, outlined green).
- Borders: 1px hairlines on light; dark cards borderless.
- Elevation: soft shadows only (`shadow-sm` → `shadow-xl`). No hard offsets,
  no gradients (except scrim over schema preview images), no blur blobs.
- Marketing bands `py-20/28`; canvas dense (38px headers, 26px rows).
- Canvas: pale-green ground, 22px `#BFD8B2` dot grid; table nodes dark
  `#1E1E1E` with sticker headers; FK edges 2px in the source table's color.

## Component rules (`components/ui/pills.tsx`)

- `GreenButton`: solid accent, white 12px medium, radius 10, 44px min-height.
- `OutlineButton`: 1px accent border, accent text, soft wash hover.
- `MetaPill`: outlined green pill for dates, read times, table counts;
  `solid` variant for active states.
- Table node: dark card, sticker header (mono bold dark title), white mono
  column names, dim green types, header-tinted PK/FK labels, edge-tinted PK wash.
- Search: floating white pill, mono 12px, dark count chip, `/` kbd hint.
- No icon in a tinted rounded square. Lucide stroke icons only.
- Motion: state fades ≤150ms; no scroll-rise, no card lifts, no pulse.
  Honor `prefers-reduced-motion`.

## Layout signatures (from Figma)

- `/` hero: full-bleed live canvas (fully passive preview — no wheel-zoom,
  no pane pan, no node drag, no selection, no scroll prevention incl.
  `touch-action: pan-y` override — so the page always scrolls) with floating
  headline card (Figma copy: "Paste SQL. See Schema. Ship Faster." /
  "Create Your Diagram" / "Watch 30s Demo" → #demo) + toolbar pill +
  sample pills.
- Home order: Hero → demo tabs → 4 alternating feature cards → dark
  "everyone" band w/ video → asymmetric "solved" bento (1+2 / 2+1) →
  two-ways tabs → asymmetric dark blog grid (tall + standards) → dark
  footer with giant headline.
- Blog/schema hubs: dark cards with meta pills + green Read More pills.
- Tool pages keep `ToolPageShell` order (SEO): badge → H1 → intro → work →
  FAQ → related → dark CTA band with green + GitHub outline buttons.

## What to avoid (per tells.md)

- No purple/blue gradients, no glow, no glass, no grain, no pulse.
- No centred pill-badge hero; the canvas is the hero.
- No three equal tinted-icon cards; alternating dark/pale Figma cards.
- No stats strip, logo cloud, testimonials, invented metrics.
- No library-default buttons, no emoji icons, no stock slate scale.
