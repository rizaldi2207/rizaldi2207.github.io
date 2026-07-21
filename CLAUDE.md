# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Appsecmonarch** — a static blog for an Indonesian Application Security community. Content is written in Bahasa Indonesia. Built with Astro (static output) and deployed to Netlify at **appsecmonarch.com**. (The repo is named `rizaldi2207.github.io` for historical reasons; GitHub Pages is not the deploy target.)

## Commands

| Command | Action |
| :-- | :-- |
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` (runs `astro build`) |
| `npm run preview` | Preview the production build locally |
| `npm run astro -- --help` | Astro CLI (e.g. `astro check` for type-checking `.astro` files) |

There is no test suite and no linter configured. Type safety comes from `@astrojs/check` + the content-collection Zod schema, surfaced via `astro check`.

## Architecture

**Stack:** Astro 5 + Tailwind 3 (`@astrojs/tailwind`) + Preact (`@astrojs/preact`, available but the UI is currently plain `.astro`).

**Content model — this is the source of truth for the blog.** Posts live in `src/content/blog/*.md` as an Astro content collection. The schema is defined in [src/content/config.ts](src/content/config.ts): `title`, `description`, `pubDate` (coerced to Date), optional `updatedDate`, `heroImage` (path under `/public`), and `tags[]`. Pages read posts via `getCollection("blog")` and sort by `pubDate` descending. Routes derive from `post.slug` (the filename). Adding a post = adding a Markdown file with valid frontmatter; nothing else needs wiring.

> Note: `src/pages/posts/*.md` is legacy loose Markdown, **not** part of the `blog` collection and not what the site renders. Don't confuse the two — all live blog content is in `src/content/blog/`.

**Layout wrapper.** Every page renders inside [src/layouts/Layout.astro](src/layouts/Layout.astro), which supplies `BaseHead` (SEO/OG meta), `Header`, `Footer`, font imports (`@fontsource`), and the global CSS. It takes `title` + `description` props.

**Routing** (`src/pages/`): `index` (home), `blog` (listing), `blog/[...slug]` (post detail via `getStaticPaths`), `tags/index` + `tags/[tag]`, plus static `about` and `contact`.

## Design system — follow these conventions when building or changing UI

The UI implements a Claude Design handoff (`AppSecMonarch Blog.dc.html`, brand: appsecmonarch). The look is calm and editorial — navy `#001840` and blue `#0070D0` on white.

**The brand guide explicitly rejects the "hacker" aesthetic** ("visual stereotip hacker — terminal hijau, matrix"). The site previously had exactly that (terminal chrome, typing animation, `// SECTION_NAME` monospace labels, cyan-on-black) and it was deliberately removed. Do not reintroduce terminal motifs, matrix/green-on-black styling, or monospace as decoration. Monospace (JetBrains Mono) is retained for **one** purpose: code inside article prose, which is content rather than styling.

The visual system is **CSS-variables-driven, not Tailwind-utility-driven.** Components use scoped `<style>` blocks reading custom properties; Tailwind is present but used sparingly. Match the surrounding pattern rather than introducing utility-class-heavy markup.

- **Tokens are the single source of truth.** Every brand color lives in the `:root` / `html.dark` blocks in [Layout.astro](src/layouts/Layout.astro) — surfaces (`--bg`, `--bg-secondary`, `--card-bg`), text (`--text`, `--text-body`, `--text-muted`, `--text-dim`), lines (`--border`, `--border-strong`), accent (`--accent`, `--accent-hover`, `--accent-soft`, `--accent-contrast`), the inverted navy band (`--surface-deep*`), `--media-bg`, `--danger`, and `--shadow-*`. **Never hardcode a brand color** — the repo is currently at zero hardcoded hex and zero `html:not(.dark)` overrides, and it should stay there.
- **Theming:** light/dark via a `.dark` class on `<html>`; an inline script in `Layout.astro` applies it pre-paint to avoid FOUC, and `Header.astro` owns the toggle + `localStorage`. Because everything reads tokens, a themed component needs no per-theme selector — only genuinely non-token cases (e.g. a hover tint) use an `html.dark` rule.
- **Light values come from the handoff verbatim. Dark values are derived** from the navy surfaces the same design specifies (its philosophy band, footer, contact panel), not invented. One deliberate exception: `--accent` lightens to `#4da3f0` in dark mode because `#0070d0` on navy only reaches ~3.8:1, below the 4.5:1 text threshold.
- **Typography:** Syne (headings/wordmark, 400–800), DM Sans (body/UI, 300–700), JetBrains Mono (article code only). Self-hosted via `@fontsource` in `Layout.astro` — do not switch to the Google Fonts CDN the prototype used.
- **Shared utilities** in `Layout.astro`: `.eyebrow` (the small uppercase accent label above a heading — the replacement for the old `.code-label`), `.eyebrow-on-deep` for navy bands, `.eyebrow-rule`, and `.container`.
- **Layout container:** `max-width: 1180px; margin: 0 auto; padding: 0 40px` (24px under 640px). Breakpoints: 900px and 640px.
- **Motifs:** cards at `border-radius: 14px` with `--shadow-card`, large panels at 18–20px, buttons 8–9px; scroll-triggered `.fade-in-up` via an `IntersectionObserver` re-declared per page.
- **Tailwind theme extension** ([tailwind.config.mjs](tailwind.config.mjs)) mirrors the same scale (`navy`, `accent`, `ink`, `line`, `mist`) plus `bg`/`card-bg` aliases that point at the CSS variables. Keep it in step with `Layout.astro`.

**Design coverage is partial.** The handoff defines only Beranda, Blog, Tentang, and Hubungi. The article detail page and the `/tags` pages are **extrapolated** from the token system — there is no mockup to check them against. Two intentional departures from the mockup are also worth knowing: the blog keeps its **pagination** (`POSTS_PER_PAGE = 6`) and Tentang keeps its **team section**, neither of which the design depicts; both were pre-existing functionality, and the design's silence was not read as a request to delete them.

**Code blocks are colored by Shiki variables, not by a `pre` rule.** Astro's highlighter writes its palette as an *inline style* on `<pre>`, which outranks scoped CSS — so a named theme silently ignores the tokens (this is exactly how the blocks ended up GitHub-grey on a navy page). `astro.config.mjs` therefore sets `shikiConfig.theme: 'css-variables'`, and the `--astro-code-*` variables in `Layout.astro` are the real control surface. Note the names are `--astro-code-background` / `--astro-code-foreground` — *not* `--astro-code-color-background`; the wrong name fails silently as a transparent background. Verify in a browser after touching this.

**Known content gap — article hero images.** The UI now follows the brand's calm, editorial direction, but every `heroImage` in `src/content/blog/` is a dark terminal screenshot with green/red code — the very "visual stereotip hacker" the brand guide rejects. The design system can't fix this; it needs new artwork. `public/assets/securecode.png` (calm, collaborative illustration, used on the homepage hero) is the closest example of the right direction.

**Client-side behavior lives in per-page inline `<script>` tags**, not shared modules — e.g. the home terminal typing animation ([index.astro](src/pages/index.astro)), tag filtering + client-side pagination ([blog.astro](src/pages/blog.astro), `POSTS_PER_PAGE`), and the post-detail image lightbox ([blog/[...slug].astro](src/pages/blog/[...slug].astro)). Prose styling for Markdown posts is a large scoped `:global()` block in the slug page.

## Changing the design system

Applies to any request to adjust, restyle, retheme, or import a new design system / layout (including porting a design from an external mockup or a Claude Design `.dc.html` file).

The token system means a retheme is now mostly a matter of editing the `:root` / `html.dark` blocks in `Layout.astro`. Confirm that still holds before relying on it — this should print `0`:

```sh
grep -roiE "#?(00d4ff|003377)" src --include=*.astro | wc -l   # legacy palette
grep -ro "html:not(.dark)" src --include=*.astro | wc -l        # per-theme overrides
```

Follow this order:

1. **Ask for the design source first** if it isn't already on disk or in the conversation — the concrete file/spec, not a verbal description. Don't infer a palette. A Claude Design handoff arrives as a zip; read its `README.md`, then the named `.dc.html` in full.
2. **Take light values verbatim; derive dark ones from the design's own dark surfaces** rather than inventing a palette. Check contrast when carrying an accent onto navy — see the `--accent` exception above. If a value must depart from the spec, say so and give the reason.
3. **Keep both themes correct.** Every color change needs its light and dark value, and a change that looks right in dark mode is not verified until light is checked too.
4. **Update [tailwind.config.mjs](tailwind.config.mjs) alongside** so the two scales don't drift, even though runtime theming does not read it.
5. **Preserve the structural conventions** unless the new design explicitly overrides them: the 1180px container, 900px/640px breakpoints, `.eyebrow` labels, and the `.fade-in-up` + `IntersectionObserver` pattern.
6. **A design's silence is not a deletion order.** Mockups routinely omit existing functionality (pagination, a team section, a social link) and cover only some routes. Restyle what the design doesn't depict; don't delete it because it isn't drawn — and flag the gap instead of quietly extrapolating.
7. **Use real data, not mockup data.** The prototypes carry invented posts and counts ("40+ tulisan"). Bind to the content collection instead, and prefer linking a card to a real post over leaving it decorative.
8. **Verify with `npm run build`** and `npx astro check`, then `npm run dev` to confirm **both themes** visually. A build that passes proves nothing about how it looks.

## Deploy

Deployed to **Netlify** at custom domain **appsecmonarch.com** (domain + DNS configured in Netlify, not via a repo CNAME file — GitHub Pages is not used). `astro.config.mjs` sets `site: 'https://appsecmonarch.com'` — this is the canonical origin for `BaseHead` (canonical + Open Graph URLs) and `@astrojs/sitemap`, so keep it in sync with the live domain. `public/robots.txt` references the sitemap. Output is static; Netlify serves the `dist/` build (`npm run build`, publish dir `dist`).

**OG images:** `BaseHead` takes an `image` prop (default `/assets/securecode.png`) resolved against `site`; `Layout` forwards it, and the article page passes each post's `heroImage`. Any page wanting a custom social card passes `image` to `Layout`.
