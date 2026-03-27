# Faza 4: Hub pages, sitemap, internal linking, performance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create hub/index pages for all sections, centralize internal linking, add sitemap + robots.txt, custom 404, and verify performance.

**Architecture:** Three hub pages (integracje, alternatywa-dla, ai-dla) using Astro static pages with existing component patterns (BaseLayout, SectionHeader, Breadcrumbs, Card, CTASection). Category filtering on /integracje/ uses pure client-side JS with data-attributes (no React). Centralized `related.ts` helper replaces inline related-link logic in [slug].astro templates. Astro sitemap integration generates XML sitemap.

**Tech Stack:** Astro 5 (SSG), Tailwind CSS 4, @astrojs/sitemap, pure JS (filtering)

**Data summary:**
- 85 integrations, categories: ai, crm, e-commerce, erp, komunikacja, ksiegowosc, kurierzy, logistyka, marketplace, platforma-sklepowa, platnosci
- 26 alternatives, categories: beauty, crm, e-commerce, education, erp, project-management, restaurants
- 15 AI industries: E-commerce, Logistyka, Nieruchomości, Gastronomia, Medycyna, Edukacja, Fintech, HR i Rekrutacja, Marketing, Prawo, Produkcja, Turystyka, Fitness i Sport, Beauty i Kosmetyka, Budownictwo

---

### Task 1: Create `src/lib/related.ts` — centralized related links helper

**Files:**
- Create: `src/lib/related.ts`

**Context:** Currently each [slug].astro template calculates related items inline. This task centralizes that logic into a reusable helper. The helper is used by existing [slug].astro pages AND the new hub pages for cross-linking.

- [ ] **Step 1: Create `src/lib/related.ts`**

```typescript
// src/lib/related.ts

interface RelatedItem {
  title: string;
  href: string;
  description: string;
}

interface Integration {
  slug: string;
  toolA: string;
  toolB: string;
  categoryA: string;
  categoryB: string;
  description: string;
}

interface Alternative {
  slug: string;
  systemName: string;
  category: string;
  whatItIs: string;
}

interface AIIndustry {
  slug: string;
  industry: string;
  intro: string;
}

export function getRelatedIntegrations(
  currentSlug: string,
  allIntegrations: Integration[],
  limit = 4
): RelatedItem[] {
  const current = allIntegrations.find((i) => i.slug === currentSlug);
  if (!current) return [];

  return allIntegrations
    .filter(
      (i) =>
        i.slug !== currentSlug &&
        (i.toolA === current.toolA ||
          i.toolB === current.toolB ||
          i.toolA === current.toolB ||
          i.toolB === current.toolA)
    )
    .slice(0, limit)
    .map((i) => ({
      title: `${i.toolA} + ${i.toolB}`,
      href: `/integracje/${i.slug}/`,
      description: i.description.slice(0, 120) + '...',
    }));
}

export function getRelatedAlternatives(
  currentSlug: string,
  allAlternatives: Alternative[],
  limit = 3
): RelatedItem[] {
  const current = allAlternatives.find((a) => a.slug === currentSlug);
  if (!current) return [];

  return allAlternatives
    .filter((a) => a.slug !== currentSlug && a.category === current.category)
    .slice(0, limit)
    .map((a) => ({
      title: `Alternatywa dla ${a.systemName}`,
      href: `/alternatywa-dla/${a.slug}/`,
      description: a.whatItIs.slice(0, 120) + '...',
    }));
}

export function getRelatedAIIndustries(
  currentSlug: string,
  allIndustries: AIIndustry[],
  limit = 3
): RelatedItem[] {
  return allIndustries
    .filter((i) => i.slug !== currentSlug)
    .slice(0, limit)
    .map((i) => ({
      title: `AI dla branży ${i.industry}`,
      href: `/ai-dla/${i.slug}/`,
      description: i.intro.slice(0, 120) + '...',
    }));
}

export function getIntegrationsForTool(
  toolName: string,
  allIntegrations: Integration[],
  limit = 3
): RelatedItem[] {
  return allIntegrations
    .filter((i) => i.toolA === toolName || i.toolB === toolName)
    .slice(0, limit)
    .map((i) => ({
      title: `${i.toolA} + ${i.toolB}`,
      href: `/integracje/${i.slug}/`,
      description: i.description.slice(0, 120) + '...',
    }));
}
```

- [ ] **Step 2: Build to verify no TypeScript errors**

Run: `npm run build`
Expected: Build succeeds (file is importable)

- [ ] **Step 3: Commit**

```bash
git add src/lib/related.ts
git commit -m "feat: add centralized related links helper (related.ts)"
```

---

### Task 2: Refactor [slug].astro templates to use `related.ts`

**Files:**
- Modify: `src/pages/integracje/[slug].astro` (lines 33-47)
- Modify: `src/pages/alternatywa-dla/[slug].astro` (lines 20-27)
- Modify: `src/pages/ai-dla/[slug].astro` (lines 21-28)

**Context:** Replace inline related-link calculations with centralized `related.ts` functions. Functionality stays identical.

- [ ] **Step 1: Update `src/pages/integracje/[slug].astro`**

Add import at top (after other imports):
```typescript
import { getRelatedIntegrations } from '../../lib/related';
```

Replace lines 33-47 (the inline `related` calculation) with:
```typescript
const related = getRelatedIntegrations(integration.slug, allIntegrations);
```

- [ ] **Step 2: Update `src/pages/alternatywa-dla/[slug].astro`**

Add import:
```typescript
import { getRelatedAlternatives } from '../../lib/related';
```

Replace lines 20-27 (the inline `related` calculation) with:
```typescript
const related = getRelatedAlternatives(alt.slug, allAlternatives);
```

- [ ] **Step 3: Update `src/pages/ai-dla/[slug].astro`**

Add import:
```typescript
import { getRelatedAIIndustries } from '../../lib/related';
```

Replace lines 21-28 (the inline `related` calculation) with:
```typescript
const related = getRelatedAIIndustries(industry.slug, allIndustries);
```

- [ ] **Step 4: Build to verify refactor doesn't break anything**

Run: `npm run build`
Expected: Build succeeds, same 130 pages generated

- [ ] **Step 5: Commit**

```bash
git add src/pages/integracje/[slug].astro src/pages/alternatywa-dla/[slug].astro src/pages/ai-dla/[slug].astro
git commit -m "refactor: use centralized related.ts in [slug] templates"
```

---

### Task 3: Create hub page `/integracje/index.astro`

**Files:**
- Create: `src/pages/integracje/index.astro`

**Context:** Hub page listing all 85 integrations as Card components with category filter buttons. Filtering uses pure client-side JS with `data-category` attributes on cards — NO React. Follow the pattern from existing `narzedzia/index.astro`. Schema: CollectionPage.

Category labels map (for display):
```
ai → AI
crm → CRM
e-commerce → E-commerce
erp → ERP
komunikacja → Komunikacja
ksiegowosc → Księgowość
kurierzy → Kurierzy
logistyka → Logistyka
marketplace → Marketplace
platforma-sklepowa → Platforma sklepowa
platnosci → Płatności
```

- [ ] **Step 1: Create `src/pages/integracje/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import Card from '../../components/Card.astro';
import CTASection from '../../components/CTASection.astro';

const integrations = await getCollection('integrations');
const items = integrations.map((e) => e.data).sort((a, b) => a.toolA.localeCompare(b.toolA));

const categoryLabels: Record<string, string> = {
  ai: 'AI',
  crm: 'CRM',
  'e-commerce': 'E-commerce',
  erp: 'ERP',
  komunikacja: 'Komunikacja',
  ksiegowosc: 'Księgowość',
  kurierzy: 'Kurierzy',
  logistyka: 'Logistyka',
  marketplace: 'Marketplace',
  'platforma-sklepowa': 'Platforma sklepowa',
  platnosci: 'Płatności',
};

const difficultyLabels: Record<string, string> = {
  basic: 'Podstawowa',
  medium: 'Średnia',
  advanced: 'Zaawansowana',
};

const allCategories = [...new Set(items.flatMap((i) => [i.categoryA, i.categoryB]))].sort();

const title = 'Integracje systemów IT — automatyzacja procesów biznesowych | VoxquartzSystems';
const description = 'Profesjonalne integracje systemów IT: BaseLinker, Shoper, Shopify, WooCommerce, Allegro, InPost, Przelewy24 i więcej. Automatyzacja procesów biznesowych.';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Integracje systemów IT',
  description,
  url: 'https://voxquartzsystems.pl/integracje/',
  numberOfItems: items.length,
  provider: {
    '@type': 'Organization',
    name: 'VoxquartzSystems',
    url: 'https://voxquartzsystems.pl',
  },
};
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/integracje/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona główna', href: '/' },
    { label: 'Integracje', href: '/integracje/' },
  ]} />

  <SectionHeader
    label="Integracje"
    title="Integracje systemów — automatyzacja procesów biznesowych"
    description="Łączymy systemy e-commerce, płatności, kurierów, ERP i AI w jeden sprawny ekosystem. Wybierz interesującą Cię integrację."
  />

  <!-- Category filters (pure JS) -->
  <div class="flex flex-wrap gap-2 mb-8" id="category-filters">
    <button
      class="filter-btn px-4 py-2 text-sm rounded-lg border border-accent bg-accent/10 text-accent-light font-medium transition-all"
      data-filter="all"
    >
      Wszystkie ({items.length})
    </button>
    {allCategories.map((cat) => {
      const count = items.filter((i) => i.categoryA === cat || i.categoryB === cat).length;
      return (
        <button
          class="filter-btn px-4 py-2 text-sm rounded-lg border border-border text-text-muted hover:border-border-hover hover:text-text-primary transition-all"
          data-filter={cat}
        >
          {categoryLabels[cat] || cat} ({count})
        </button>
      );
    })}
  </div>

  <!-- Cards grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="integrations-grid">
    {items.map((item) => (
      <div data-category-a={item.categoryA} data-category-b={item.categoryB}>
        <Card
          title={`${item.toolA} + ${item.toolB}`}
          description={item.description.slice(0, 140) + '...'}
          href={`/integracje/${item.slug}/`}
          tags={[item.toolA, item.toolB, difficultyLabels[item.difficulty]]}
        />
      </div>
    ))}
  </div>

  <CTASection
    title="Potrzebujesz niestandardowej integracji?"
    description="Jeśli nie widzisz swojej integracji na liście — napisz. Łączymy dowolne systemy przez API, webhooks i middleware."
  />
</BaseLayout>

<script>
  const filters = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = document.querySelectorAll<HTMLElement>('#integrations-grid > div');

  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter!;

      filters.forEach((b) => {
        b.classList.remove('border-accent', 'bg-accent/10', 'text-accent-light');
        b.classList.add('border-border', 'text-text-muted');
      });
      btn.classList.remove('border-border', 'text-text-muted');
      btn.classList.add('border-accent', 'bg-accent/10', 'text-accent-light');

      cards.forEach((card) => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const catA = card.dataset.categoryA;
          const catB = card.dataset.categoryB;
          card.style.display = catA === filter || catB === filter ? '' : 'none';
        }
      });
    });
  });
</script>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds, new `/integracje/index.html` generated

- [ ] **Step 3: Commit**

```bash
git add src/pages/integracje/index.astro
git commit -m "feat: add integracje hub page with category filters"
```

---

### Task 4: Create hub page `/alternatywa-dla/index.astro`

**Files:**
- Create: `src/pages/alternatywa-dla/index.astro`

**Context:** Hub page listing all 26 alternatives grouped by category sections. Follow hub page pattern. Schema: CollectionPage.

Category labels map:
```
beauty → Beauty i Kosmetyka
crm → CRM
e-commerce → E-commerce
education → Edukacja
erp → ERP
project-management → Zarządzanie projektami
restaurants → Gastronomia
```

- [ ] **Step 1: Create `src/pages/alternatywa-dla/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import Card from '../../components/Card.astro';
import CTASection from '../../components/CTASection.astro';

const alternatives = await getCollection('alternatives');
const items = alternatives.map((e) => e.data);

const categoryLabels: Record<string, string> = {
  beauty: 'Beauty i Kosmetyka',
  crm: 'CRM',
  'e-commerce': 'E-commerce',
  education: 'Edukacja',
  erp: 'ERP',
  'project-management': 'Zarządzanie projektami',
  restaurants: 'Gastronomia',
};

const categoryOrder = ['e-commerce', 'crm', 'erp', 'project-management', 'beauty', 'restaurants', 'education'];

const grouped = categoryOrder
  .map((cat) => ({
    key: cat,
    label: categoryLabels[cat] || cat,
    items: items.filter((i) => i.category === cat),
  }))
  .filter((g) => g.items.length > 0);

const title = 'Alternatywy dla popularnych systemów — dedykowane rozwiązania | VoxquartzSystems';
const description = 'Porównanie popularnych systemów pudełkowych z dedykowanymi rozwiązaniami. Shoper, Salesforce, SAP, Asana, Booksy i inne — sprawdź, kiedy warto przejść na custom.';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Alternatywy dla popularnych systemów',
  description,
  url: 'https://voxquartzsystems.pl/alternatywa-dla/',
  numberOfItems: items.length,
  provider: {
    '@type': 'Organization',
    name: 'VoxquartzSystems',
    url: 'https://voxquartzsystems.pl',
  },
};
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/alternatywa-dla/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona główna', href: '/' },
    { label: 'Alternatywy', href: '/alternatywa-dla/' },
  ]} />

  <SectionHeader
    label="Alternatywy"
    title="Alternatywy dla popularnych systemów — dedykowane rozwiązania"
    description="Każdy system pudełkowy ma swoje ograniczenia. Porównaj popularne platformy z dedykowanymi rozwiązaniami szytymi na miarę."
  />

  {grouped.map((group) => (
    <section class="mb-12">
      <h2 class="text-xl font-display font-bold text-text-primary mb-4 flex items-center gap-3">
        <span class="w-8 h-0.5 bg-accent rounded-full"></span>
        {group.label}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.items.map((item) => (
          <Card
            title={`Alternatywa dla ${item.systemName}`}
            description={item.whatItIs.slice(0, 140) + '...'}
            href={`/alternatywa-dla/${item.slug}/`}
            tags={[item.systemName, categoryLabels[item.category] || item.category]}
          />
        ))}
      </div>
    </section>
  ))}

  <CTASection
    title="Nie widzisz swojego systemu?"
    description="Budujemy dedykowane alternatywy dla dowolnych platform. Opisz swoje potrzeby, a przeanalizujemy Twój przypadek."
  />
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds, new `/alternatywa-dla/index.html` generated

- [ ] **Step 3: Commit**

```bash
git add src/pages/alternatywa-dla/index.astro
git commit -m "feat: add alternatywa-dla hub page grouped by category"
```

---

### Task 5: Create hub page `/ai-dla/index.astro`

**Files:**
- Create: `src/pages/ai-dla/index.astro`

**Context:** Hub page listing all 15 AI industries in a grid. Includes link to AI audit tool at the top. Schema: CollectionPage.

- [ ] **Step 1: Create `src/pages/ai-dla/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import Card from '../../components/Card.astro';
import CTASection from '../../components/CTASection.astro';

const industries = await getCollection('ai-industries');
const items = industries.map((e) => e.data);

const title = 'Integracja AI dla Twojej branży | VoxquartzSystems';
const description = 'Wdrożenie sztucznej inteligencji dopasowane do Twojej branży. E-commerce, logistyka, medycyna, fintech, HR i więcej — sprawdź zastosowania AI i ROI.';

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'AI dla branż',
  description,
  url: 'https://voxquartzsystems.pl/ai-dla/',
  numberOfItems: items.length,
  provider: {
    '@type': 'Organization',
    name: 'VoxquartzSystems',
    url: 'https://voxquartzsystems.pl',
  },
};
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/ai-dla/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona główna', href: '/' },
    { label: 'AI dla branż', href: '/ai-dla/' },
  ]} />

  <SectionHeader
    label="AI dla branż"
    title="Integracja AI dla Twojej branży"
    description="Sztuczna inteligencja to nie gadżet — to narzędzie, które już teraz oszczędza firmom tysiące godzin rocznie. Sprawdź, jak AI zmienia Twoją branżę."
  />

  <!-- AI Audit CTA banner -->
  <a
    href="/narzedzia/audyt-gotowosci-ai/"
    class="group flex items-center justify-between gap-4 mb-10 p-5 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-all"
  >
    <div>
      <p class="text-text-primary font-semibold">Sprawdź czy Twoja firma jest gotowa na AI</p>
      <p class="text-text-muted text-sm">10 pytań, wykres radarowy i spersonalizowane rekomendacje</p>
    </div>
    <span class="text-accent-light group-hover:translate-x-1 transition-transform">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </span>
  </a>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {items.map((item) => (
      <Card
        title={`AI dla branży ${item.industry}`}
        description={item.intro.slice(0, 140) + '...'}
        href={`/ai-dla/${item.slug}/`}
        tags={item.stack.slice(0, 3)}
      />
    ))}
  </div>

  <CTASection
    title="Nie widzisz swojej branży?"
    description="Wdrażamy AI w dowolnym sektorze. Opisz swój przypadek, a przeanalizujemy możliwości automatyzacji."
  />
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds, new `/ai-dla/index.html` generated

- [ ] **Step 3: Commit**

```bash
git add src/pages/ai-dla/index.astro
git commit -m "feat: add ai-dla hub page with industry grid and audit CTA"
```

---

### Task 6: Add sitemap integration

**Files:**
- Modify: `astro.config.mjs`
- Create: `public/sitemap-main.xml`

**Context:** Install `@astrojs/sitemap` and configure with priority levels. Create manual sitemap-main.xml for the homepage (which Astro doesn't generate since it's a static HTML outside Astro).

- [ ] **Step 1: Install @astrojs/sitemap**

Run: `npx astro add sitemap --yes`

- [ ] **Step 2: Update `astro.config.mjs` with sitemap configuration**

The `npx astro add` command will add the basic integration. Modify the config to include custom serialization:

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://voxquartzsystems.pl',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/_'),
      serialize: (item) => {
        if (
          item.url.endsWith('/integracje/') ||
          item.url.endsWith('/alternatywa-dla/') ||
          item.url.endsWith('/ai-dla/') ||
          item.url.endsWith('/narzedzia/')
        ) {
          return { ...item, priority: 0.9, changefreq: 'monthly' as const };
        }
        return { ...item, priority: 0.8, changefreq: 'monthly' as const };
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [tailwindcss()],
    build: { assetsInlineLimit: 0 },
  },
});
```

- [ ] **Step 3: Create `public/sitemap-main.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://voxquartzsystems.pl/</loc>
    <priority>1.0</priority>
    <changefreq>monthly</changefreq>
  </url>
</urlset>
```

- [ ] **Step 4: Build and verify sitemap generated**

Run: `npm run build && ls dist/sitemap*.xml`
Expected: Build succeeds, sitemap-index.xml and sitemap-0.xml present in dist/

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs public/sitemap-main.xml package.json package-lock.json
git commit -m "feat: add sitemap integration with priority levels"
```

---

### Task 7: Create `public/robots.txt`

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create `public/robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://voxquartzsystems.pl/sitemap-index.xml
Sitemap: https://voxquartzsystems.pl/sitemap-main.xml
```

- [ ] **Step 2: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt with sitemap references"
```

---

### Task 8: Create custom 404 page

**Files:**
- Create: `src/pages/404.astro`

**Context:** Dark theme 404 page with links to homepage, integracje hub, narzedzia hub, and contact section. Follows existing design system.

- [ ] **Step 1: Create `src/pages/404.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const title = 'Strona nie znaleziona — 404 | VoxquartzSystems';
const description = 'Strona, której szukasz, nie istnieje. Przejdź do strony głównej lub sprawdź nasze integracje i narzędzia.';
---

<BaseLayout title={title} description={description}>
  <div class="flex flex-col items-center justify-center text-center py-20">
    <span class="text-8xl font-display font-bold text-accent/20 mb-4">404</span>
    <h1 class="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
      Strona nie znaleziona
    </h1>
    <p class="text-text-muted text-lg max-w-md mb-10">
      Strona, której szukasz, nie istnieje lub została przeniesiona. Sprawdź poniższe linki.
    </p>
    <nav class="flex flex-wrap justify-center gap-4">
      <a
        href="/"
        class="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors"
      >
        Strona główna
      </a>
      <a
        href="/integracje/"
        class="px-6 py-3 border border-border hover:border-border-hover text-text-primary rounded-lg transition-colors"
      >
        Integracje
      </a>
      <a
        href="/narzedzia/"
        class="px-6 py-3 border border-border hover:border-border-hover text-text-primary rounded-lg transition-colors"
      >
        Narzędzia
      </a>
      <a
        href="/#contact"
        class="px-6 py-3 border border-border hover:border-border-hover text-text-primary rounded-lg transition-colors"
      >
        Kontakt
      </a>
    </nav>
  </div>
</BaseLayout>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds, `/404.html` generated in dist/

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "feat: add custom 404 page"
```

---

### Task 9: Enhanced cross-linking between sections

**Files:**
- Modify: `src/pages/integracje/[slug].astro`
- Modify: `src/pages/alternatywa-dla/[slug].astro`
- Modify: `src/pages/ai-dla/[slug].astro`

**Context:** Per spec, sections should cross-link:
- Integracje → powiązane integracje + alternatywy danego systemu
- Alternatywy → integracje z tym systemem + inne alternatywy z kategorii
- AI branże → audytor AI + integracje z AI narzędziami

The [slug] templates already have RelatedLinks with same-section items. This task adds cross-section links.

- [ ] **Step 1: Update `src/pages/integracje/[slug].astro` — add alternative cross-links**

After the existing `import { getRelatedIntegrations }` add:
```typescript
import { getRelatedIntegrations, getIntegrationsForTool } from '../../lib/related';
```

After the `related` const, add:
```typescript
// Cross-link to alternatives if toolA or toolB has an alternative page
const altCollection = await getCollection('alternatives');
const allAlternatives = altCollection.map((e) => e.data);
const crossAlternatives = allAlternatives
  .filter((a) => a.systemName === integration.toolA || a.systemName === integration.toolB)
  .slice(0, 2)
  .map((a) => ({
    title: `Alternatywa dla ${a.systemName}`,
    href: `/alternatywa-dla/${a.slug}/`,
    description: a.whatItIs.slice(0, 120) + '...',
  }));
```

Then in the template, after the existing `<RelatedLinks>`, add:
```astro
{crossAlternatives.length > 0 && (
  <RelatedLinks items={crossAlternatives} heading="Alternatywy" />
)}
```

- [ ] **Step 2: Update `src/pages/alternatywa-dla/[slug].astro` — add integration cross-links**

Add import:
```typescript
import { getIntegrationsForTool } from '../../lib/related';
```

After existing `related` const, add:
```typescript
const intCollection = await getCollection('integrations');
const allIntegrations = intCollection.map((e) => e.data);
const crossIntegrations = getIntegrationsForTool(alt.systemName, allIntegrations, 3);
```

In template, after existing `<RelatedLinks>`, add:
```astro
{crossIntegrations.length > 0 && (
  <RelatedLinks items={crossIntegrations} heading={`Integracje z ${alt.systemName}`} />
)}
```

- [ ] **Step 3: Update `src/pages/ai-dla/[slug].astro` — add AI integration cross-links**

After existing `related` const, add:
```typescript
const intCollection = await getCollection('integrations');
const allIntegrations = intCollection.map((e) => e.data);
const aiIntegrations = allIntegrations
  .filter((i) => i.categoryA === 'ai' || i.categoryB === 'ai')
  .slice(0, 3)
  .map((i) => ({
    title: `${i.toolA} + ${i.toolB}`,
    href: `/integracje/${i.slug}/`,
    description: i.description.slice(0, 120) + '...',
  }));
```

In template, after existing `<RelatedLinks>`, add:
```astro
{aiIntegrations.length > 0 && (
  <RelatedLinks items={aiIntegrations} heading="Integracje AI" />
)}
```

- [ ] **Step 4: Add cross-links to `src/pages/narzedzia/kalkulator-kosztow-saas.astro`**

Add imports and related items before `</BaseLayout>`:
```typescript
// In frontmatter:
import { getCollection } from 'astro:content';
import RelatedLinks from '../../components/react/../RelatedLinks.astro';

const intCollection = await getCollection('integrations');
const popularIntegrations = intCollection.map((e) => e.data).slice(0, 3).map((i) => ({
  title: `${i.toolA} + ${i.toolB}`,
  href: `/integracje/${i.slug}/`,
  description: i.description.slice(0, 120) + '...',
}));

const aiCollection = await getCollection('ai-industries');
const aiIndustries = aiCollection.map((e) => e.data).slice(0, 3).map((i) => ({
  title: `AI dla branży ${i.industry}`,
  href: `/ai-dla/${i.slug}/`,
  description: i.intro.slice(0, 120) + '...',
}));
```

Add before `<CTASection>` in template:
```astro
  <RelatedLinks items={popularIntegrations} heading="Popularne integracje" />
  <RelatedLinks items={aiIndustries} heading="AI dla branż" />
```

- [ ] **Step 5: Add cross-links to `src/pages/narzedzia/audyt-gotowosci-ai.astro`**

Same pattern as Step 4 — add imports and RelatedLinks before CTASection with popular integrations and AI industry links.

- [ ] **Step 6: Normalize trailing slashes in existing [slug].astro templates**

In Task 2's refactored templates, the `related.ts` helper already outputs trailing slashes. Additionally, check other inline hrefs in [slug].astro files (breadcrumbs, other links) and add trailing slashes where missing to match canonical URLs.

- [ ] **Step 7: Build and verify**

Run: `npm run build`
Expected: Build succeeds, same page count, cross-links rendered on all pages including narzedzia

- [ ] **Step 8: Commit**

```bash
git add src/pages/integracje/[slug].astro src/pages/alternatywa-dla/[slug].astro src/pages/ai-dla/[slug].astro src/pages/narzedzia/kalkulator-kosztow-saas.astro src/pages/narzedzia/audyt-gotowosci-ai.astro
git commit -m "feat: add cross-section internal linking across all page types"
```

---

### Task 10: Final build, page count, and performance verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds. Count pages:
```bash
find dist -name "*.html" | wc -l
```
Expected: ~133 pages (85 integracje + 26 alternatywy + 15 AI + 3 hubs + 3 narzedzia + 404 + index)

- [ ] **Step 2: Verify sitemap content**

Run: `cat dist/sitemap-index.xml`
Verify all hub pages and subpages are present.

- [ ] **Step 3: Verify zero JS on static pages**

Run: `grep -l '<script' dist/integracje/baselinker-z-przelewy24/index.html`
Expected: Only inline filter script on /integracje/index.html, zero JS on individual integracje pages.

- [ ] **Step 4: Verify JSON-LD on hub pages**

Run: `grep 'CollectionPage' dist/integracje/index.html`
Expected: CollectionPage schema present.

- [ ] **Step 5: Check dist/ size**

Run: `du -sh dist/`

- [ ] **Step 6: Commit any final adjustments and report checkpoint**

Report to user:
- Total URL count in sitemap
- dist/ folder size
- JS bundle on static pages (should be 0 KB)
- Confirmation that filtering works on /integracje/
- Schema.org verification (CollectionPage, BreadcrumbList)

**CHECKPOINT 4 reached — wait for user confirmation before proceeding to Faza 5.**
