# Design: Merge portfolio + portfolio_seo into one Astro project

## Context

Two separate projects exist for voxquartzsystems.pl:
1. **portfolio** — Vanilla HTML/CSS/JS freelancer hub with 6 demo projects. Hosted on GitHub Pages.
2. **portfolio_seo** — Astro 6 SSG with ~110 programmatic SEO pages (integrations, alternatives, AI industries, tools). Not yet deployed.

Both share the same domain, design system (dark theme, indigo accent, Inter/Playfair/Manrope fonts), and branding. They need to be merged into a single deployable project with cross-linking for SEO.

## Architecture

Single **Astro 6.1.0 SSG** project deployed to **Cloudflare Pages**.

### URL Structure

```
voxquartzsystems.pl/
├── /                            ← Portfolio hub (migrated from index.html)
├── /realizacje/zlota-misa/      ← Demo projects (static HTML in public/)
├── /realizacje/taskflow/
├── /realizacje/nowy-dom/
├── /realizacje/studio-m/
├── /realizacje/zielonydom/
├── /realizacje/atelier-piekna/
├── /integracje/                 ← SEO hub + 100+ detail pages
├── /alternatywa-dla/            ← SEO hub + 30+ detail pages
├── /ai-dla/                     ← SEO hub + 16 detail pages
├── /narzedzia/                  ← Interactive tools (React islands)
└── /404                         ← Custom 404
```

### Project Structure

```
voxquartzsystems.pl/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── favicon.ico, favicon.svg, og-image.png
│   ├── manifest.json
│   ├── robots.txt
│   ├── _redirects              ← Cloudflare Pages redirects
│   ├── _headers                ← Security + noindex for demos
│   ├── images/                 ← Portfolio thumbnails
│   └── realizacje/             ← Demo projects (static HTML)
│       ├── zlota-misa/
│       ├── taskflow/
│       ├── nowy-dom/
│       ├── studio-m/
│       ├── zielonydom/
│       └── atelier-piekna/
├── src/
│   ├── components/
│   │   ├── SiteNav.astro       ← NEW unified navigation
│   │   ├── SiteFooter.astro    ← NEW unified footer
│   │   ├── portfolio/          ← NEW portfolio section components
│   │   │   ├── HeroSection.astro
│   │   │   ├── SocialProofBar.astro
│   │   │   ├── AboutSection.astro
│   │   │   ├── ProjectsSection.astro
│   │   │   ├── ProcessSection.astro
│   │   │   ├── TechSection.astro
│   │   │   ├── FAQSection.astro
│   │   │   └── ContactSection.astro
│   │   ├── Badge.astro         ← existing
│   │   ├── Breadcrumbs.astro   ← existing
│   │   ├── Card.astro          ← existing
│   │   ├── CTASection.astro    ← existing (extended)
│   │   ├── FAQ.astro           ← existing
│   │   ├── RelatedLinks.astro  ← existing
│   │   ├── SchemaOrg.astro     ← existing
│   │   ├── SectionHeader.astro ← existing
│   │   └── react/              ← existing React islands
│   ├── data/
│   │   ├── integrations.json   ← existing
│   │   ├── alternatives.json   ← existing
│   │   ├── ai-industries.json  ← existing
│   │   ├── projects.ts         ← NEW portfolio project data
│   │   └── navigation.ts       ← NEW centralized nav config
│   ├── layouts/
│   │   ├── BaseLayout.astro    ← existing (updated imports)
│   │   └── PortfolioLayout.astro ← NEW full-width layout
│   ├── content.config.ts       ← existing (collections: integrations, alternatives, ai-industries)
│   ├── lib/                    ← existing utilities
│   ├── pages/
│   │   ├── index.astro         ← REPLACED: portfolio hub (was redirect)
│   │   ├── 404.astro           ← existing (updated links)
│   │   ├── integracje/         ← existing
│   │   ├── alternatywa-dla/    ← existing
│   │   ├── ai-dla/             ← existing
│   │   └── narzedzia/          ← existing
│   └── styles/
│       ├── global.css          ← existing Tailwind
│       └── portfolio.css       ← NEW extracted from index.html
```

## Migration Details

### Portfolio index.html (2353 lines) decomposition

| Lines | Content | Target |
|-------|---------|--------|
| 28-1400 | CSS (1370 lines) | `src/styles/portfolio.css` (minus nav/footer styles) |
| 1387-1401 | Navigation | Replaced by `SiteNav.astro` |
| 1404-1427 | Hero section | `HeroSection.astro` |
| 1429-1460 | Social proof bar | `SocialProofBar.astro` |
| 1463-1537 | About section | `AboutSection.astro` |
| 1540-1729 | Projects section | `ProjectsSection.astro` |
| 1732-1771 | Process section | `ProcessSection.astro` |
| 1774-1830 | Tech section | `TechSection.astro` |
| 1833-1895 | FAQ section | `FAQSection.astro` |
| 1898-1936 | Contact section | `ContactSection.astro` |
| 1939-1991 | Footer | Replaced by `SiteFooter.astro` |
| 1993-2221 | JavaScript (228 lines) | Distributed to component `<script>` tags |
| 2223-2350 | JSON-LD (3 blocks) | `SchemaOrg.astro` in `PortfolioLayout` |

### CSS Strategy

Portfolio CSS uses vanilla CSS with `:root` variables and class names (`.hero`, `.about-grid`, `.project-card`). These don't conflict with Tailwind utility classes. Strategy:
1. Extract CSS to `portfolio.css`
2. Remove nav/footer styles (replaced by SiteNav/SiteFooter)
3. **Remove duplicate `:root` variables** — portfolio.css defines `--bg`, `--accent`, `--font-sans` etc. that overlap with `global.css` `@theme` block. Remove them from portfolio.css and reference the Tailwind theme variables instead (they use identical values).
4. Import in `PortfolioLayout.astro` alongside `global.css`
5. No need to rewrite to Tailwind — hybrid approach works

### Contact Form

The portfolio contact form uses **Web3Forms API** with:
- Access key: `177c045b-3001-4911-ac1d-27cb026478e3` (public, hardcoded)
- External hCaptcha script: `https://web3forms.com/client/script.js`
- Dark theme hCaptcha: `data-theme="dark"`

In `ContactSection.astro`: keep as vanilla JS form (no React island needed). Include the Web3Forms script and preserve the access key. The form submission is domain-agnostic so it works after migration.

### OG Image

Standardize on `og-image.png` (from portfolio, 972KB). Copy to `public/og-image.png`. Update `BaseLayout.astro` default `ogImage` prop from `/og-default.png` to `/og-image.png`.

### Google Fonts

Portfolio loads Inter with weights `300;400;500;600;700`. SEO project loads `400;500;600;700`. Unify to the broader set (include weight 300) in the shared layout `<head>`.

### PortfolioLayout.astro

Shares `<head>` logic with `BaseLayout.astro` (meta tags, fonts, OG, favicon). Key difference: `<main>` has no `max-w-6xl mx-auto` constraint — full-bleed layout for hero, social proof bar, and other full-width sections. Both layouts use `SiteNav` and `SiteFooter`.

### Demo Projects

Copy vanilla HTML demos to `public/realizacje/` with folder structure preserved. Updates per demo:
- Add `<meta name="robots" content="noindex, follow">`
- **Remove `<link rel="canonical">`** — noindex pages should not have self-referencing canonicals (conflicting signals). Let Google handle deindexing cleanly.
- Update favicon path to `/favicon.ico`
- Add top banner: "Demo realizacji VoxquartzSystems" linking to `/`
- Verify internal asset paths (`images/`, `css/`, `js/`) work with preserved folder structure
- Update any "back to portfolio" links from `../` to `/`

### Booking Portal

**Excluded entirely.** Next.js + SQLite requires server runtime, incompatible with static output. Not deployed previously. Can be deployed separately in the future if needed.

## Navigation

### SiteNav.astro (replaces SubpageNav.astro)

Based on existing SubpageNav, extended with portfolio sections:

```typescript
// src/data/navigation.ts
export const mainNavLinks = [
  { label: 'Portfolio', href: '/#projects' },
  { label: 'O mnie', href: '/#about' },
  { label: 'Integracje', href: '/integracje/' },
  { label: 'AI dla biznesu', href: '/ai-dla/' },
  { label: 'Narzedzia', href: '/narzedzia/' },
  { label: 'Kontakt', href: '/#contact', isCTA: true },
];
```

### SiteFooter.astro (replaces SubpageFooter.astro)

4-column layout (responsive: 4 cols desktop, 2 cols tablet, 1 col mobile):
1. **Brand** — Logo, description, social links
2. **Realizacje** — Links to demo projects + PiosenkoApp
3. **Uslugi IT** — Links to SEO hubs (integracje, alternatywy, AI, narzedzia)
4. **Popularne** — Sample SEO detail page links + anchor links to portfolio sections

## Cross-Linking Strategy

### Portfolio -> SEO
- Hero: badge/link to `/narzedzia/`
- Projects section: "Uslugi IT" block linking to `/integracje/`, `/alternatywa-dla/`, `/ai-dla/`
- Tech section: inline link to `/integracje/`
- FAQ: 1-2 questions with links to SEO pages
- Contact: link to `/narzedzia/kalkulator-kosztow-saas/`

### SEO -> Portfolio
- CTASection: secondary CTA "Zobacz realizacje" -> `/#projects`
- Breadcrumbs: "Strona glowna" already links to `/`
- SiteNav: "Portfolio" link
- SiteFooter: full cross-linking

### Demo -> Portfolio
- Top banner with link back to `/`
- Footer credit with link to portfolio

## SEO Configuration

### robots.txt
```
User-agent: *
Allow: /

Sitemap: https://voxquartzsystems.pl/sitemap-index.xml
```

Note: No `Disallow: /realizacje/` — using `noindex` meta tags instead. Disallow prevents crawling, which means Google can't discover the noindex directive. With `noindex` only, Google crawls the page, sees noindex, and properly de-indexes it. The `follow` directive lets link equity flow back to the portfolio.

Note: Only reference `sitemap-index.xml` (auto-generated by `@astrojs/sitemap`). Remove manual `sitemap-main.xml` from `public/` — `@astrojs/sitemap` already includes all Astro pages. Having two sitemaps with overlapping entries wastes crawl budget.

### Sitemap
`@astrojs/sitemap` generates all Astro pages (~110). Demo pages in `public/` are NOT included (astro sitemap only covers Astro-rendered pages):
- `/` — priority 1.0, weekly
- Hub pages — priority 0.9, monthly
- Detail pages — priority 0.8, monthly

### Structured Data
- **Homepage**: Person, WebSite, FAQPage (from portfolio)
- **SEO pages**: CollectionPage (hubs), Service (details), WebApplication (tools), BreadcrumbList (all)
- Demo projects: noindex, no schema

### Redirects (`public/_redirects`)
```
/01-restaurant/     /realizacje/zlota-misa/       301
/02-saas/           /realizacje/taskflow/          301
/03-realestate/     /realizacje/nowy-dom/          301
/04-photography/    /realizacje/studio-m/          301
/05-ecommerce/      /realizacje/zielonydom/        301
/07-beautysalon/    /realizacje/atelier-piekna/    301
/booking-portal/*   /                              302
```

## Cloudflare Pages Configuration

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Node version**: 22 (env: `NODE_VERSION=22`)
- **DNS**: CNAME `voxquartzsystems.pl` -> `<project>.pages.dev` (Cloudflare CNAME flattening for apex domain)
- No server adapter needed (static output)

### `public/_headers`
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/realizacje/*
  X-Robots-Tag: noindex
```

### DNS Migration from GitHub Pages
1. Remove custom domain from GitHub Pages repo settings
2. Add CNAME record in Cloudflare DNS pointing to `<project>.pages.dev`
3. For apex domain (no www): Cloudflare uses CNAME flattening automatically
4. Enable "Always Use HTTPS" in Cloudflare
5. Brief DNS propagation period (~minutes with Cloudflare proxy)

## Implementation Phases

1. **Prepare new repo** — Copy voxquartz-seo as base, verify build
2. **Demo projects** — Copy HTML to `public/realizacje/`, update paths/meta
3. **Navigation + footer** — Create SiteNav, SiteFooter, navigation.ts
4. **Homepage layout + CSS** — Extract CSS, create PortfolioLayout
5. **Homepage components** — Decompose index.html into 8 Astro components
6. **Cross-linking + SEO** — robots, sitemap, redirects, structured data
7. **Test + deploy** — Full build, preview, Cloudflare Pages setup
8. **Post-deploy** — Remove GitHub Pages custom domain, Google Search Console, test forms, monitor redirects

## Verification

1. `npm run build` succeeds, generates ~110+ HTML files
2. `npm run preview` — manually test:
   - Homepage: all sections render, animations work, contact form submits
   - Navigation: links work from every page type (portfolio, SEO, demo)
   - Demo projects: accessible at `/realizacje/*`, noindex meta present
   - SEO pages: unchanged rendering, React islands functional
   - 404 page works
3. Sitemap contains all pages except `/realizacje/*`
4. `_redirects` file present in `dist/`
5. Lighthouse audit: Performance > 90, SEO = 100
6. After deploy: verify DNS, SSL, forms, redirects in production
