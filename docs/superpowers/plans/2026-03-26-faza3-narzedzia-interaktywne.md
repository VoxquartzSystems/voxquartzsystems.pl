# Faza 3: Narzędzia interaktywne (React Islands) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two interactive lead-generation tools (SaaS Cost Calculator + AI Readiness Audit) as React islands in Astro, plus a hub page linking them.

**Architecture:** React components rendered as Astro islands via `client:load` directive. All data/config extracted to separate TypeScript files. Pure SVG radar chart (no external charting lib). Lead capture via Web3Forms API. Dark theme using existing Tailwind CSS 4 `@theme` variables.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4 (via @theme in global.css), Astro islands (`client:load`), Web3Forms API, pure SVG for charts.

**Spec reference:** `claude-code-prompt-astro-cloudflare.md` lines 359–461

---

## File Structure

```
src/
  components/react/
    SaaSCalculator.tsx        # Multi-step wizard (4 steps), ~400 lines
    AIReadinessAudit.tsx      # Quiz + results display, ~350 lines
    RadarChart.tsx            # Reusable SVG radar chart, ~80 lines
  lib/
    calculator-data.ts        # Project types, features, scale config
    audit-data.ts             # Quiz questions, scoring rules, recommendations
  pages/narzedzia/
    index.astro               # Hub page: 2 tool cards + SEO
    kalkulator-kosztow-saas.astro   # Astro wrapper for calculator
    audyt-gotowosci-ai.astro        # Astro wrapper for audit
```

**Existing files used (read-only):**
- `src/layouts/BaseLayout.astro` — page shell with SEO
- `src/components/Breadcrumbs.astro` — breadcrumb nav + schema
- `src/components/SectionHeader.astro` — section headings
- `src/components/CTASection.astro` — CTA block
- `src/components/SchemaOrg.astro` — JSON-LD injection
- `src/components/Card.astro` — link cards for hub page
- `src/styles/global.css` — Tailwind @theme color/font variables

---

## Task 1: Calculator data + logic

**Files:**
- Create: `src/lib/calculator-data.ts`

- [ ] **Step 1: Create calculator data file**

```typescript
// src/lib/calculator-data.ts

export interface ProjectType {
  id: string;
  label: string;
  baseCost: number;
  baseDays: number;
  recommendedStack: string;
}

export interface Feature {
  id: string;
  label: string;
  cost: number;
  days: number;
  hasSlider?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  sliderMinDays?: number;
  sliderMaxDays?: number;
}

export interface ScaleOption {
  label: string;
  value: number;
  multiplier: number;
}

export interface ComplexityOption {
  label: string;
  multiplier: number;
}

export const projectTypes: ProjectType[] = [
  { id: 'landing', label: 'Landing page / Strona firmowa', baseCost: 3000, baseDays: 3, recommendedStack: 'Astro + Tailwind CSS + Cloudflare Pages' },
  { id: 'ecommerce', label: 'Sklep internetowy', baseCost: 8000, baseDays: 7, recommendedStack: 'Next.js + Stripe + Supabase + Vercel' },
  { id: 'dashboard', label: 'Panel administracyjny / Dashboard', baseCost: 10000, baseDays: 7, recommendedStack: 'Next.js + React + PostgreSQL + Prisma' },
  { id: 'saas', label: 'Aplikacja SaaS multi-tenant', baseCost: 20000, baseDays: 14, recommendedStack: 'Next.js + Supabase + Stripe + Multi-tenant architecture' },
  { id: 'marketplace', label: 'Marketplace / Platforma', baseCost: 25000, baseDays: 18, recommendedStack: 'Next.js + PostgreSQL + Stripe Connect + Elasticsearch' },
  { id: 'mobile', label: 'Aplikacja mobilna iOS + Android', baseCost: 15000, baseDays: 14, recommendedStack: 'React Native + Expo + Firebase + REST API' },
];

export const features: Feature[] = [
  { id: 'auth', label: 'Autentykacja (logowanie, rejestracja, OAuth)', cost: 2000, days: 2 },
  { id: 'user-panel', label: 'Panel uzytkownika', cost: 2000, days: 2 },
  { id: 'admin-panel', label: 'Panel administratora', cost: 4000, days: 3 },
  { id: 'payments', label: 'Platnosci online (Stripe / P24)', cost: 3000, days: 3 },
  { id: 'api-integrations', label: 'Integracje z API zewnetrznymi', cost: 3000, days: 2, hasSlider: true, sliderMin: 3000, sliderMax: 8000, sliderMinDays: 2, sliderMaxDays: 5 },
  { id: 'notifications', label: 'System powiadomien (email + push)', cost: 2500, days: 2 },
  { id: 'chat', label: 'Chat / messaging real-time', cost: 5000, days: 4 },
  { id: 'search', label: 'Zaawansowana wyszukiwarka', cost: 2500, days: 2 },
  { id: 'reporting', label: 'Raportowanie i analytics', cost: 4000, days: 3 },
  { id: 'ai', label: 'Integracja AI (OpenAI / Claude)', cost: 4000, days: 3, hasSlider: true, sliderMin: 4000, sliderMax: 10000, sliderMinDays: 3, sliderMaxDays: 7 },
  { id: 'pwa', label: 'Wersja mobilna (PWA lub native)', cost: 8000, days: 5, hasSlider: true, sliderMin: 8000, sliderMax: 15000, sliderMinDays: 5, sliderMaxDays: 10 },
  { id: 'i18n', label: 'Multi-language (i18n)', cost: 2000, days: 2 },
];

export const scaleOptions: ScaleOption[] = [
  { label: '10', value: 10, multiplier: 1.0 },
  { label: '100', value: 100, multiplier: 1.0 },
  { label: '1 000', value: 1000, multiplier: 1.2 },
  { label: '10 000', value: 10000, multiplier: 1.5 },
  { label: '100 000+', value: 100000, multiplier: 2.0 },
];

export const complexityOptions: ComplexityOption[] = [
  { label: 'Prosta', multiplier: 1.0 },
  { label: 'Srednia', multiplier: 1.3 },
  { label: 'Zaawansowana', multiplier: 1.6 },
];

export interface CalculationResult {
  baseCost: number;
  featuresCost: number;
  subtotal: number;
  scaleMultiplier: number;
  complexityMultiplier: number;
  totalBeforeRange: number;
  costMin: number;
  costMax: number;
  totalDays: number;
  agencyCost: { min: number; max: number };
  softwareHouseCost: { min: number; max: number };
  recommendedStack: string;
}

export function calculateCost(
  projectType: ProjectType,
  selectedFeatures: Feature[],
  sliderValues: Record<string, number>,
  scaleMultiplier: number,
  complexityMultiplier: number
): CalculationResult {
  const baseCost = projectType.baseCost;
  let featuresCost = 0;
  let totalDays = projectType.baseDays;

  for (const feature of selectedFeatures) {
    if (feature.hasSlider && sliderValues[feature.id] !== undefined) {
      featuresCost += sliderValues[feature.id];
      const range = feature.sliderMax! - feature.sliderMin!;
      const daysRange = feature.sliderMaxDays! - feature.sliderMinDays!;
      const ratio = range > 0 ? (sliderValues[feature.id] - feature.sliderMin!) / range : 0;
      totalDays += feature.sliderMinDays! + Math.round(ratio * daysRange);
    } else {
      featuresCost += feature.cost;
      totalDays += feature.days;
    }
  }

  const subtotal = baseCost + featuresCost;
  const totalBeforeRange = subtotal * scaleMultiplier * complexityMultiplier;
  const costMin = Math.round(totalBeforeRange * 0.8);
  const costMax = Math.round(totalBeforeRange * 1.2);

  // Scale days too (roughly)
  totalDays = Math.round(totalDays * Math.max(1, (scaleMultiplier - 1) * 0.5 + 1) * Math.max(1, (complexityMultiplier - 1) * 0.3 + 1));

  return {
    baseCost,
    featuresCost,
    subtotal,
    scaleMultiplier,
    complexityMultiplier,
    totalBeforeRange: Math.round(totalBeforeRange),
    costMin,
    costMax,
    totalDays,
    agencyCost: { min: Math.round(costMin * 2.5), max: Math.round(costMax * 2.5) },
    softwareHouseCost: { min: Math.round(costMin * 4), max: Math.round(costMax * 4) },
    recommendedStack: projectType.recommendedStack,
  };
}
```

- [ ] **Step 2: Verify file compiles**

Run: `cd /c/Users/USER/projekty/portfolio_seo/voxquartz-seo && npx tsc --noEmit src/lib/calculator-data.ts 2>&1 || echo "tsc standalone check not needed for Astro - will verify in build"`

- [ ] **Step 3: Commit**

```bash
git add src/lib/calculator-data.ts
git commit -m "feat: add SaaS calculator data and calculation logic"
```

---

## Task 2: Audit data + logic

**Files:**
- Create: `src/lib/audit-data.ts`

- [ ] **Step 1: Create audit data file**

```typescript
// src/lib/audit-data.ts

export interface AuditOption {
  label: string;
  score: number;
}

export interface AuditQuestion {
  id: number;
  category: string;
  categoryKey: AuditCategory;
  question: string;
  options: AuditOption[];
}

export type AuditCategory = 'dane' | 'procesy' | 'zespol' | 'budzet' | 'kultura';

export const categoryLabels: Record<AuditCategory, string> = {
  dane: 'Dane',
  procesy: 'Procesy',
  zespol: 'Zespol',
  budzet: 'Budzet',
  kultura: 'Kultura',
};

export const categoryOrder: AuditCategory[] = ['dane', 'procesy', 'zespol', 'budzet', 'kultura'];

export const questions: AuditQuestion[] = [
  {
    id: 1, category: 'Dane', categoryKey: 'dane',
    question: 'Jak przechowujesz dane firmowe?',
    options: [
      { label: 'Excel / papier', score: 0 },
      { label: 'Rozne, niepowiazane systemy', score: 3 },
      { label: 'Centralna baza danych (czesciowo)', score: 7 },
      { label: 'Ustrukturyzowana baza z API', score: 10 },
    ],
  },
  {
    id: 2, category: 'Dane', categoryKey: 'dane',
    question: 'Ile danych historycznych posiadasz?',
    options: [
      { label: 'Mniej niz 1 rok', score: 0 },
      { label: '1-2 lata, niekompletne', score: 3 },
      { label: '2-5 lat', score: 7 },
      { label: '5+ lat, pelne i ustrukturyzowane', score: 10 },
    ],
  },
  {
    id: 3, category: 'Procesy', categoryKey: 'procesy',
    question: 'Ile powtarzalnych manualnych procesow wykonujesz tygodniowo?',
    options: [
      { label: 'Mniej niz 5', score: 0 },
      { label: '5-15', score: 3 },
      { label: '15-30', score: 7 },
      { label: '30+', score: 10 },
    ],
  },
  {
    id: 4, category: 'Procesy', categoryKey: 'procesy',
    question: 'Czy macie udokumentowane procedury?',
    options: [
      { label: 'Nie mamy', score: 0 },
      { label: 'W glowach pracownikow', score: 3 },
      { label: 'W dokumentach / wiki', score: 7 },
      { label: 'W systemach workflow', score: 10 },
    ],
  },
  {
    id: 5, category: 'Zespol', categoryKey: 'zespol',
    question: 'Czy macie osobe techniczna w firmie?',
    options: [
      { label: 'Nie', score: 0 },
      { label: 'Zewnetrzny konsultant', score: 3 },
      { label: 'Wewnetrzny IT', score: 7 },
      { label: 'Zespol IT / CTO', score: 10 },
    ],
  },
  {
    id: 6, category: 'Zespol', categoryKey: 'zespol',
    question: 'Jak zespol reaguje na nowe narzedzia?',
    options: [
      { label: 'Opor i niechec', score: 0 },
      { label: 'Sceptycyzm, ale probuja', score: 3 },
      { label: 'Otwartosc na zmiany', score: 7 },
      { label: 'Entuzjazm i proaktywnosc', score: 10 },
    ],
  },
  {
    id: 7, category: 'Budzet', categoryKey: 'budzet',
    question: 'Jaki jest roczny budzet na IT?',
    options: [
      { label: 'Ponizej 5 000 zl', score: 0 },
      { label: '5 000 - 20 000 zl', score: 3 },
      { label: '20 000 - 100 000 zl', score: 7 },
      { label: 'Powyzej 100 000 zl', score: 10 },
    ],
  },
  {
    id: 8, category: 'Budzet', categoryKey: 'budzet',
    question: 'Czy masz budzet na pilotaz AI (3-6 miesiecy)?',
    options: [
      { label: 'Nie mamy budzetu', score: 0 },
      { label: 'Musze przekonac zarzad', score: 3 },
      { label: 'Do 15 000 zl', score: 7 },
      { label: 'Bez ograniczen', score: 10 },
    ],
  },
  {
    id: 9, category: 'Kultura', categoryKey: 'kultura',
    question: 'Jakie jest podejscie firmy do innowacji?',
    options: [
      { label: 'Unikamy zmian', score: 0 },
      { label: 'Reagujemy na rynek', score: 3 },
      { label: 'Aktywnie testujemy nowosci', score: 7 },
      { label: 'Innowacja jest w DNA firmy', score: 10 },
    ],
  },
  {
    id: 10, category: 'Kultura', categoryKey: 'kultura',
    question: 'Czy firma korzysta juz z AI?',
    options: [
      { label: 'Nie, w ogole', score: 0 },
      { label: 'ChatGPT do prostych zadan', score: 3 },
      { label: 'Kilka narzedzi AI w uzyciu', score: 7 },
      { label: 'Wlasne wdrozenia AI', score: 10 },
    ],
  },
];

export interface CategoryScore {
  key: AuditCategory;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AuditResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: string;
  levelDescription: string;
  categories: CategoryScore[];
  recommendations: string[];
}

export function calculateAuditResult(answers: (number | null)[]): AuditResult {
  const categoryScores: Record<AuditCategory, number> = {
    dane: 0, procesy: 0, zespol: 0, budzet: 0, kultura: 0,
  };

  let totalScore = 0;
  for (let i = 0; i < questions.length; i++) {
    const score = answers[i] ?? 0;
    categoryScores[questions[i].categoryKey] += score;
    totalScore += score;
  }

  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const categories: CategoryScore[] = categoryOrder.map((key) => ({
    key,
    label: categoryLabels[key],
    score: categoryScores[key],
    maxScore: 20,
    percentage: Math.round((categoryScores[key] / 20) * 100),
  }));

  let level: string;
  let levelDescription: string;
  if (percentage <= 30) {
    level = 'Poczatkujacy';
    levelDescription = 'Twoja firma jest na wczesnym etapie cyfryzacji. Zacznij od uporządkowania danych i procesow, zanim wdrozysz AI.';
  } else if (percentage <= 60) {
    level = 'Rozwijajacy sie';
    levelDescription = 'Masz solidne podstawy. Mozesz zaczac od pilotazowych wdrozen AI w obszarach, gdzie juz masz dane i procesy.';
  } else if (percentage <= 85) {
    level = 'Gotowy na AI';
    levelDescription = 'Twoja firma jest dobrze przygotowana na wdrozenie AI. Mozesz przejsc do zaawansowanych implementacji.';
  } else {
    level = 'Lider AI';
    levelDescription = 'Jestes w czolowce firm pod wzgledem gotowosci na AI. Czas na skalowanie i optymalizacje istniejacych wdrozen.';
  }

  // Recommendations based on weakest categories (sorted ascending by score)
  const weakest = [...categories].sort((a, b) => a.percentage - b.percentage);
  const recommendations: string[] = [];

  const recommendationMap: Record<AuditCategory, string[]> = {
    dane: [
      'Przeprowadz audyt danych — zidentyfikuj, gdzie sa rozproszone i jak je skonsolidowac w jednym systemie.',
      'Wdroz centralna baze danych z API, aby AI mialo dostepu do ustrukturyzowanych danych.',
    ],
    procesy: [
      'Zmapuj i udokumentuj kluczowe procesy biznesowe — to fundament automatyzacji AI.',
      'Zacznij od automatyzacji najbardziej powtarzalnych zadan przy uzyciu prostych regul, zanim wdrozysz AI.',
    ],
    zespol: [
      'Zainwestuj w szkolenia techniczne dla zespolu — nawet podstawowa znajomosc narzedzi AI znaczaco zwieksza efektywnosc wdrozenia.',
      'Rozważ zatrudnienie lub zlecenie konsultantowi IT roli „championów AI" wewnatrz firmy.',
    ],
    budzet: [
      'Zaplanuj budzet na 3-6 miesiecy pilotazu AI — nawet niewielka inwestycja (5-15 tys. zl) pozwoli przetestowac wartosc.',
      'Przygotuj business case z konkretnymi oszczednosciami, aby uzyskac akceptacje zarzadu na inwestycje w AI.',
    ],
    kultura: [
      'Zacznij od malych, widocznych sukcesow AI (np. ChatGPT w obsludze klienta) — buduj entuzjazm stopniowo.',
      'Zorganizuj warsztaty AI dla zarzadu i zespolu, aby zbudowac swiadomosc mozliwosci i zmniejszyc opor.',
    ],
  };

  // Take top 3 recommendations from weakest categories
  for (const cat of weakest) {
    if (recommendations.length >= 3) break;
    const recs = recommendationMap[cat.key];
    for (const rec of recs) {
      if (recommendations.length >= 3) break;
      recommendations.push(rec);
    }
  }

  return { totalScore, maxScore, percentage, level, levelDescription, categories, recommendations };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/audit-data.ts
git commit -m "feat: add AI readiness audit questions and scoring logic"
```

---

## Task 3: SVG Radar Chart component

**Files:**
- Create: `src/components/react/RadarChart.tsx`

- [ ] **Step 1: Create RadarChart component**

This is a pure SVG radar/spider chart. 5 axes (one per audit category), filled polygon for scores.

```tsx
// src/components/react/RadarChart.tsx
import type { CategoryScore } from '../../lib/audit-data';

interface RadarChartProps {
  categories: CategoryScore[];
  size?: number;
}

export default function RadarChart({ categories, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 4;
  const angleStep = (2 * Math.PI) / categories.length;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  function polarToCartesian(angle: number, r: number): [number, number] {
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
  }

  // Grid lines (concentric polygons)
  const gridPolygons = Array.from({ length: levels }, (_, level) => {
    const r = (radius / levels) * (level + 1);
    const points = categories
      .map((_, i) => polarToCartesian(startAngle + i * angleStep, r))
      .map(([x, y]) => `${x},${y}`)
      .join(' ');
    return <polygon key={level} points={points} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
  });

  // Axis lines
  const axisLines = categories.map((_, i) => {
    const [x, y] = polarToCartesian(startAngle + i * angleStep, radius);
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
  });

  // Data polygon
  const dataPoints = categories.map((cat, i) => {
    const r = (cat.percentage / 100) * radius;
    return polarToCartesian(startAngle + i * angleStep, r);
  });
  const dataPolygon = dataPoints.map(([x, y]) => `${x},${y}`).join(' ');

  // Labels
  const labels = categories.map((cat, i) => {
    const labelRadius = radius + 24;
    const [x, y] = polarToCartesian(startAngle + i * angleStep, labelRadius);
    return (
      <text
        key={cat.key}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#8a8a96"
        fontSize="12"
        fontFamily="'Manrope', sans-serif"
        fontWeight="600"
      >
        {cat.label}
      </text>
    );
  });

  // Score dots
  const dots = dataPoints.map(([x, y], i) => (
    <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" stroke="#818cf8" strokeWidth="2" />
  ));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="mx-auto">
      {gridPolygons}
      {axisLines}
      <polygon points={dataPolygon} fill="rgba(99,102,241,0.2)" stroke="#6366f1" strokeWidth="2" />
      {dots}
      {labels}
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/RadarChart.tsx
git commit -m "feat: add SVG radar chart component for audit results"
```

---

## Task 4: SaaS Calculator React component

**Files:**
- Create: `src/components/react/SaaSCalculator.tsx`

- [ ] **Step 1: Create SaaSCalculator component**

Full multi-step wizard. Uses Tailwind CSS 4 utility classes from `@theme` variables (e.g. `bg-bg-card`, `text-accent`, `border-border`).

```tsx
// src/components/react/SaaSCalculator.tsx
import { useState } from 'react';
import {
  projectTypes,
  features,
  scaleOptions,
  complexityOptions,
  calculateCost,
  type ProjectType,
  type Feature,
  type CalculationResult,
} from '../../lib/calculator-data';

const WEB3FORMS_KEY = '177c045b-3001-4911-ac1d-27cb026478e3';

function formatPLN(amount: number): string {
  return amount.toLocaleString('pl-PL') + ' zl';
}

// Step indicator
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-label font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : isDone
                    ? 'bg-accent/20 text-accent-light'
                    : 'bg-bg-surface text-text-dim border border-border'
              }`}
            >
              {isDone ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {i < total - 1 && (
              <div className={`w-8 h-0.5 ${isDone ? 'bg-accent/40' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Project type selection
function StepProjectType({
  selected,
  onSelect,
}: {
  selected: ProjectType | null;
  onSelect: (pt: ProjectType) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Wybierz typ projektu</h2>
      <p className="text-text-muted mb-6">Jaki typ aplikacji chcesz zbudowac?</p>
      <div className="grid gap-3">
        {projectTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => onSelect(pt)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              selected?.id === pt.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">{pt.label}</span>
              <span className="text-sm text-text-muted">od {formatPLN(pt.baseCost)}</span>
            </div>
            <div className="text-xs text-text-dim mt-1">ok. {pt.baseDays} dni roboczych</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2: Feature selection
function StepFeatures({
  selected,
  sliderValues,
  onToggle,
  onSliderChange,
}: {
  selected: Set<string>;
  sliderValues: Record<string, number>;
  onToggle: (f: Feature) => void;
  onSliderChange: (id: string, value: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Wybierz funkcjonalnosci</h2>
      <p className="text-text-muted mb-6">Zaznacz wszystko, czego potrzebujesz.</p>
      <div className="grid gap-3">
        {features.map((f) => {
          const isSelected = selected.has(f.id);
          return (
            <div key={f.id}>
              <button
                onClick={() => onToggle(f)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-accent border-accent' : 'border-text-dim'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-text-primary">{f.label}</span>
                  </div>
                  <span className="text-sm text-text-muted">
                    {f.hasSlider ? `${formatPLN(f.sliderMin!)} - ${formatPLN(f.sliderMax!)}` : `+${formatPLN(f.cost)}`}
                  </span>
                </div>
              </button>
              {isSelected && f.hasSlider && (
                <div className="px-4 py-3 bg-bg-surface rounded-b-xl border-x border-b border-border -mt-1">
                  <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                    <span>{formatPLN(f.sliderMin!)}</span>
                    <span className="font-semibold text-accent-light">{formatPLN(sliderValues[f.id] ?? f.sliderMin!)}</span>
                    <span>{formatPLN(f.sliderMax!)}</span>
                  </div>
                  <input
                    type="range"
                    min={f.sliderMin!}
                    max={f.sliderMax!}
                    step={500}
                    value={sliderValues[f.id] ?? f.sliderMin!}
                    onChange={(e) => onSliderChange(f.id, Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Step 3: Scale
function StepScale({
  scaleIndex,
  complexityIndex,
  onScaleChange,
  onComplexityChange,
}: {
  scaleIndex: number;
  complexityIndex: number;
  onScaleChange: (i: number) => void;
  onComplexityChange: (i: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Skala projektu</h2>
      <p className="text-text-muted mb-8">Okresl wielkosc i zlozonosc.</p>

      <div className="mb-8">
        <label className="block text-text-primary font-medium mb-3">Oczekiwana liczba uzytkownikow</label>
        <div className="flex items-center justify-between text-sm text-text-muted mb-2">
          <span>10</span>
          <span className="font-semibold text-accent-light text-base">{scaleOptions[scaleIndex].label}</span>
          <span>100 000+</span>
        </div>
        <input
          type="range"
          min={0}
          max={scaleOptions.length - 1}
          value={scaleIndex}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="text-xs text-text-dim mt-1">
          Mnoznik kosztow: x{scaleOptions[scaleIndex].multiplier.toFixed(1)}
        </div>
      </div>

      <div>
        <label className="block text-text-primary font-medium mb-3">Zlozonosc interfejsu</label>
        <div className="grid grid-cols-3 gap-3">
          {complexityOptions.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => onComplexityChange(i)}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                i === complexityIndex
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border bg-bg-card hover:border-border-hover text-text-muted'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs mt-1">x{opt.multiplier.toFixed(1)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 4: Results + Lead form
function StepResult({ result, onBack }: { result: CalculationResult; onBack: () => void }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Kalkulator SaaS — wycena ${formatPLN(result.costMin)}-${formatPLN(result.costMax)}`,
          name,
          email,
          message: `Szacunkowy koszt: ${formatPLN(result.costMin)} - ${formatPLN(result.costMax)}\nCzas realizacji: ok. ${result.totalDays} dni\nStack: ${result.recommendedStack}\n\nOpis projektu:\n${description}`,
        }),
      });
      if (res.ok) {
        setFormState('sent');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-6">Szacunkowa wycena</h2>

      {/* Cost range */}
      <div className="bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border border-accent/20 rounded-2xl p-6 mb-6 text-center">
        <div className="text-text-muted text-sm mb-1">Szacowany koszt</div>
        <div className="text-3xl md:text-4xl font-display font-bold text-text-primary">
          {formatPLN(result.costMin)} – {formatPLN(result.costMax)}
        </div>
        <div className="text-text-muted text-sm mt-2">
          Czas realizacji: ok. <span className="text-accent-light font-semibold">{result.totalDays} dni roboczych</span>
        </div>
      </div>

      {/* Recommended stack */}
      <div className="bg-bg-card border border-border rounded-xl p-4 mb-6">
        <div className="text-xs text-text-dim uppercase font-label tracking-wider mb-2">Rekomendowany stack</div>
        <div className="text-text-primary font-medium">{result.recommendedStack}</div>
      </div>

      {/* Comparison table */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-text-dim font-label font-medium">Dostawca</th>
              <th className="text-right p-4 text-text-dim font-label font-medium">Koszt</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-accent/5">
              <td className="p-4 text-accent-light font-semibold">VoxquartzSystems</td>
              <td className="p-4 text-right text-accent-light font-semibold">
                {formatPLN(result.costMin)} – {formatPLN(result.costMax)}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-4 text-text-muted">Agencja (x2.5)</td>
              <td className="p-4 text-right text-text-muted">
                {formatPLN(result.agencyCost.min)} – {formatPLN(result.agencyCost.max)}
              </td>
            </tr>
            <tr>
              <td className="p-4 text-text-muted">Software house (x4)</td>
              <td className="p-4 text-right text-text-muted">
                {formatPLN(result.softwareHouseCost.min)} – {formatPLN(result.softwareHouseCost.max)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Lead capture form */}
      {formState === 'sent' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <div className="text-emerald-400 font-semibold text-lg mb-2">Wiadomosc wyslana!</div>
          <p className="text-text-muted">Odezwe sie w ciagu 24 godzin z indywidualna wycena.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Otrzymaj dokladna wycene</h3>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Imie"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Krotki opis projektu (opcjonalnie)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={formState === 'sending'}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-accent/25"
            >
              {formState === 'sending' ? 'Wysylanie...' : 'Wyslij i otrzymaj wycene'}
            </button>
            {formState === 'error' && (
              <p className="text-red-400 text-sm text-center">Blad wysylania. Sprobuj ponownie lub napisz na kontakt@voxquartzsystems.pl</p>
            )}
          </div>
        </form>
      )}

      <button
        onClick={onBack}
        className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors"
      >
        ← Wróc i zmien parametry
      </button>
    </div>
  );
}

// Main Calculator component
export default function SaaSCalculator() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [scaleIndex, setScaleIndex] = useState(1);
  const [complexityIndex, setComplexityIndex] = useState(1);

  function toggleFeature(f: Feature) {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev);
      if (next.has(f.id)) {
        next.delete(f.id);
      } else {
        next.add(f.id);
        if (f.hasSlider && !sliderValues[f.id]) {
          setSliderValues((sv) => ({ ...sv, [f.id]: f.sliderMin! }));
        }
      }
      return next;
    });
  }

  function handleSliderChange(id: string, value: number) {
    setSliderValues((sv) => ({ ...sv, [id]: value }));
  }

  const selectedFeatures = features.filter((f) => selectedFeatureIds.has(f.id));

  const result: CalculationResult | null =
    selectedProject
      ? calculateCost(
          selectedProject,
          selectedFeatures,
          sliderValues,
          scaleOptions[scaleIndex].multiplier,
          complexityOptions[complexityIndex].multiplier
        )
      : null;

  const canProceed = step === 1 ? selectedProject !== null : true;

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} total={4} />

      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
        {step === 1 && (
          <StepProjectType selected={selectedProject} onSelect={(pt) => setSelectedProject(pt)} />
        )}
        {step === 2 && (
          <StepFeatures
            selected={selectedFeatureIds}
            sliderValues={sliderValues}
            onToggle={toggleFeature}
            onSliderChange={handleSliderChange}
          />
        )}
        {step === 3 && (
          <StepScale
            scaleIndex={scaleIndex}
            complexityIndex={complexityIndex}
            onScaleChange={setScaleIndex}
            onComplexityChange={setComplexityIndex}
          />
        )}
        {step === 4 && result && (
          <StepResult result={result} onBack={() => setStep(1)} />
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Wstecz
            </button>
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed}
              className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/25"
            >
              {step === 3 ? 'Zobacz wycene' : 'Dalej'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/SaaSCalculator.tsx
git commit -m "feat: add SaaS cost calculator React component (multi-step wizard)"
```

---

## Task 5: AI Readiness Audit React component

**Files:**
- Create: `src/components/react/AIReadinessAudit.tsx`

- [ ] **Step 1: Create AIReadinessAudit component**

```tsx
// src/components/react/AIReadinessAudit.tsx
import { useState } from 'react';
import { questions, calculateAuditResult, type AuditResult } from '../../lib/audit-data';
import RadarChart from './RadarChart';

const WEB3FORMS_KEY = '177c045b-3001-4911-ac1d-27cb026478e3';

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-text-muted mb-2">
        <span>Pytanie {current + 1} z {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionView({
  questionIndex,
  selectedAnswer,
  onAnswer,
  onPrev,
  isFirst,
}: {
  questionIndex: number;
  selectedAnswer: number | null;
  onAnswer: (score: number) => void;
  onPrev: () => void;
  isFirst: boolean;
}) {
  const q = questions[questionIndex];
  return (
    <div>
      <div className="text-xs text-accent font-label font-semibold uppercase tracking-wider mb-3">
        {q.category}
      </div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-6">
        {q.question}
      </h2>
      <div className="grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(opt.score)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              selectedAnswer === opt.score
                ? 'border-accent bg-accent/10'
                : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
            }`}
          >
            <span className="text-text-primary">{opt.label}</span>
          </button>
        ))}
      </div>
      {!isFirst && (
        <button
          onClick={onPrev}
          className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors"
        >
          ← Poprzednie pytanie
        </button>
      )}
    </div>
  );
}

function ResultView({ result }: { result: AuditResult }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('sending');
    try {
      const breakdown = result.categories.map((c) => `${c.label}: ${c.score}/${c.maxScore}`).join(', ');
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Audyt AI — ${result.level} (${result.percentage}%)`,
          email,
          message: `Wynik audytu: ${result.totalScore}/${result.maxScore} (${result.percentage}%)\nPoziom: ${result.level}\nKategorie: ${breakdown}\nRekomendacje:\n${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
        }),
      });
      setFormState(res.ok ? 'sent' : 'error');
    } catch {
      setFormState('error');
    }
  }

  const levelColor =
    result.percentage <= 30
      ? 'text-red-400'
      : result.percentage <= 60
        ? 'text-amber-400'
        : result.percentage <= 85
          ? 'text-emerald-400'
          : 'text-accent-light';

  return (
    <div>
      {/* Score header */}
      <div className="text-center mb-8">
        <div className="text-text-muted text-sm mb-2">Twoj wynik</div>
        <div className={`text-5xl font-display font-bold ${levelColor}`}>
          {result.totalScore}<span className="text-2xl text-text-dim">/{result.maxScore}</span>
        </div>
        <div className={`text-lg font-semibold mt-2 ${levelColor}`}>{result.level}</div>
        <p className="text-text-muted mt-2 max-w-lg mx-auto">{result.levelDescription}</p>
      </div>

      {/* Radar chart */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Profil gotowosci</h3>
        <RadarChart categories={result.categories} size={300} />
        {/* Category breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {result.categories.map((cat) => (
            <div key={cat.key} className="text-center">
              <div className="text-xs text-text-dim font-label uppercase tracking-wider">{cat.label}</div>
              <div className="text-lg font-bold text-text-primary">{cat.score}<span className="text-sm text-text-dim">/{cat.maxScore}</span></div>
              <div className="h-1.5 bg-bg-surface rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Rekomendacje dla Twojej firmy</h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 text-accent-light flex items-center justify-center shrink-0 text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-text-muted leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA: consultation + email */}
      <div className="bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border border-accent/20 rounded-2xl p-6 text-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Umow bezplatna konsultacje AI</h3>
        <p className="text-text-muted text-sm mb-4">
          Przeanalizujemy Twoje wyniki i zaproponujemy konkretny plan wdrozenia AI w Twojej firmie.
        </p>
        <a
          href="/#contact"
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
        >
          Umow konsultacje
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {/* Email form for results */}
      {formState === 'sent' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-emerald-400 font-semibold">Wyniki wyslane na Twoj email!</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-xl p-4">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Twoj email — wysle Ci wyniki"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={formState === 'sending'}
              className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {formState === 'sending' ? 'Wysylanie...' : 'Wyslij wyniki'}
            </button>
          </div>
          {formState === 'error' && (
            <p className="text-red-400 text-xs mt-2">Blad wysylania. Sprobuj ponownie.</p>
          )}
        </form>
      )}
    </div>
  );
}

// Main Audit component
export default function AIReadinessAudit() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  function handleAnswer(score: number) {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  }

  function handlePrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
    }
  }

  function handleRestart() {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
  }

  const result = showResult ? calculateAuditResult(answers) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
        {showResult && result ? (
          <>
            <ResultView result={result} />
            <button
              onClick={handleRestart}
              className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors block mx-auto"
            >
              ← Wypelnij ponownie
            </button>
          </>
        ) : (
          <>
            <ProgressBar current={currentQuestion} total={questions.length} />
            <QuestionView
              questionIndex={currentQuestion}
              selectedAnswer={answers[currentQuestion]}
              onAnswer={handleAnswer}
              onPrev={handlePrev}
              isFirst={currentQuestion === 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/AIReadinessAudit.tsx
git commit -m "feat: add AI readiness audit React component (quiz + radar chart)"
```

---

## Task 6: Astro wrapper pages

**Files:**
- Create: `src/pages/narzedzia/kalkulator-kosztow-saas.astro`
- Create: `src/pages/narzedzia/audyt-gotowosci-ai.astro`
- Create: `src/pages/narzedzia/index.astro`

- [ ] **Step 1: Create calculator page**

```astro
---
// src/pages/narzedzia/kalkulator-kosztow-saas.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import CTASection from '../../components/CTASection.astro';
import SaaSCalculator from '../../components/react/SaaSCalculator';

const title = 'Kalkulator kosztow aplikacji SaaS | VoxquartzSystems';
const description = 'Oblicz szacunkowy koszt budowy aplikacji webowej, sklepu, SaaS lub panelu administracyjnego. Porownaj ceny freelancera, agencji i software house.';

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Kalkulator kosztow aplikacji SaaS',
    description,
    url: 'https://voxquartzsystems.pl/narzedzia/kalkulator-kosztow-saas/',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
    },
    author: {
      '@type': 'Organization',
      name: 'VoxquartzSystems',
      url: 'https://voxquartzsystems.pl',
    },
  },
];
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/narzedzia/kalkulator-kosztow-saas/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona glowna', href: '/' },
    { label: 'Narzedzia', href: '/narzedzia/' },
    { label: 'Kalkulator kosztow SaaS', href: '/narzedzia/kalkulator-kosztow-saas/' },
  ]} />

  <SectionHeader
    label="Narzedzie"
    title="Kalkulator kosztow aplikacji"
    description="Wybierz typ projektu, funkcjonalnosci i skale — otrzymasz szacunkowa wycene w kilka sekund. Bez zobowiazan, bez rejestracji."
  />

  <SaaSCalculator client:load />

  <CTASection
    title="Potrzebujesz dokladniejszej wyceny?"
    description="Kalkulator pokazuje szacunki. Napisz do mnie, a przygotuje indywidualna oferte dopasowana do Twojego projektu."
  />
</BaseLayout>
```

- [ ] **Step 2: Create audit page**

```astro
---
// src/pages/narzedzia/audyt-gotowosci-ai.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import CTASection from '../../components/CTASection.astro';
import AIReadinessAudit from '../../components/react/AIReadinessAudit';

const title = 'Audyt gotowosci na AI — sprawdz swoja firme | VoxquartzSystems';
const description = 'Bezplatny test gotowosci Twojej firmy na wdrozenie sztucznej inteligencji. 10 pytan, wynik z rekomendacjami i wykresem radarowym. Sprawdz teraz.';

const schema = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Audyt gotowosci firmy na AI',
    description,
    url: 'https://voxquartzsystems.pl/narzedzia/audyt-gotowosci-ai/',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
    },
    author: {
      '@type': 'Organization',
      name: 'VoxquartzSystems',
      url: 'https://voxquartzsystems.pl',
    },
  },
];
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/narzedzia/audyt-gotowosci-ai/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona glowna', href: '/' },
    { label: 'Narzedzia', href: '/narzedzia/' },
    { label: 'Audyt gotowosci na AI', href: '/narzedzia/audyt-gotowosci-ai/' },
  ]} />

  <SectionHeader
    label="Narzedzie"
    title="Audyt gotowosci na AI"
    description="Odpowiedz na 10 pytan i sprawdz, czy Twoja firma jest gotowa na wdrozenie sztucznej inteligencji. Otrzymasz spersonalizowane rekomendacje."
  />

  <AIReadinessAudit client:load />

  <CTASection
    title="Chcesz omowic wyniki?"
    description="Umow sie na bezplatna konsultacje — przeanalizujemy Twoje wyniki i zaproponujemy plan wdrozenia AI."
  />
</BaseLayout>
```

- [ ] **Step 3: Create hub/index page**

```astro
---
// src/pages/narzedzia/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import Breadcrumbs from '../../components/Breadcrumbs.astro';
import SectionHeader from '../../components/SectionHeader.astro';
import CTASection from '../../components/CTASection.astro';
const title = 'Bezplatne narzedzia IT — kalkulator kosztow i audyt AI | VoxquartzSystems';
const description = 'Kalkulator kosztow aplikacji SaaS i audyt gotowosci na AI. Bezplatne narzedzia online do szacowania budzetow IT i oceny potencjalu AI w firmie.';

const tools = [
  {
    title: 'Kalkulator kosztow aplikacji SaaS',
    description: 'Oblicz szacunkowy koszt budowy aplikacji webowej, sklepu internetowego, panelu administracyjnego lub platformy SaaS. Porownaj ceny freelancera, agencji i software house.',
    href: '/narzedzia/kalkulator-kosztow-saas/',
    icon: 'calculator',
  },
  {
    title: 'Audyt gotowosci na AI',
    description: 'Sprawdz, czy Twoja firma jest gotowa na wdrozenie sztucznej inteligencji. 10 pytan, wykres radarowy i spersonalizowane rekomendacje.',
    href: '/narzedzia/audyt-gotowosci-ai/',
    icon: 'chart',
  },
];

const schema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: title,
  description,
  url: 'https://voxquartzsystems.pl/narzedzia/',
  mainEntity: tools.map((tool) => ({
    '@type': 'WebApplication',
    name: tool.title,
    description: tool.description,
    url: `https://voxquartzsystems.pl${tool.href}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
  })),
};
---

<BaseLayout
  title={title}
  description={description}
  canonical="https://voxquartzsystems.pl/narzedzia/"
  schema={schema}
>
  <Breadcrumbs items={[
    { label: 'Strona glowna', href: '/' },
    { label: 'Narzedzia', href: '/narzedzia/' },
  ]} />

  <SectionHeader
    label="Bezplatne narzedzia"
    title="Narzedzia dla Twojego biznesu"
    description="Skorzystaj z bezplatnych narzedzi do szacowania kosztow projektow IT i oceny gotowosci na AI."
  />

  <div class="grid md:grid-cols-2 gap-6 mt-8">
    {tools.map((tool) => (
      <a
        href={tool.href}
        class="group block bg-bg-card border border-border rounded-2xl p-8 transition-all duration-300 hover:bg-bg-card-hover hover:border-border-hover hover:shadow-xl hover:shadow-accent/5"
      >
        <div class="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
          {tool.icon === 'calculator' ? (
            <svg class="w-6 h-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008v-.008zM6.75 7.5h10.5a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 17.25v-7.5A2.25 2.25 0 016.75 7.5zM6 4.5h12" />
            </svg>
          ) : (
            <svg class="w-6 h-6 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
            </svg>
          )}
        </div>
        <h2 class="text-xl font-display font-bold text-text-primary mb-3 group-hover:text-accent-light transition-colors">
          {tool.title}
        </h2>
        <p class="text-text-muted leading-relaxed mb-4">
          {tool.description}
        </p>
        <span class="inline-flex items-center gap-1 text-accent-light text-sm font-label font-semibold group-hover:gap-2 transition-all">
          Wyprobuj za darmo
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </a>
    ))}
  </div>

  <CTASection />
</BaseLayout>
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/narzedzia/
git commit -m "feat: add narzedzia pages (calculator, audit, hub)"
```

---

## Task 7: Build verification

- [ ] **Step 1: Run astro build**

```bash
cd /c/Users/USER/projekty/portfolio_seo/voxquartz-seo && npm run build
```

Expected: Build succeeds with narzedzia pages generated in `dist/narzedzia/`.

- [ ] **Step 2: Verify generated pages exist**

```bash
ls -la dist/narzedzia/
ls -la dist/narzedzia/kalkulator-kosztow-saas/
ls -la dist/narzedzia/audyt-gotowosci-ai/
```

Expected: Each directory contains `index.html`.

- [ ] **Step 3: Check JS bundle sizes**

```bash
ls -lh dist/_astro/*.js 2>/dev/null | head -20
```

Verify React island bundles are reasonable (under 100KB each ideally).

- [ ] **Step 4: Verify HTML structure of one page**

```bash
head -50 dist/narzedzia/kalkulator-kosztow-saas/index.html
```

Check: title, meta description, canonical URL, Schema.org JSON-LD present.

- [ ] **Step 5: Start dev server and test interactively (manual)**

```bash
npm run dev
```

Test in browser:
- `/narzedzia/` — hub page renders 2 tool cards
- `/narzedzia/kalkulator-kosztow-saas` — wizard steps 1→2→3→4, cost calculation, lead form
- `/narzedzia/audyt-gotowosci-ai` — 10 questions, radar chart, recommendations, email form

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: address build issues in narzedzia pages"
```

---

## Notes

- **Tailwind in React:** The `@tailwindcss/vite` plugin scans `.tsx` files, so all Tailwind utility classes (`bg-bg-card`, `text-accent`, etc.) work in React components without extra config.
- **Polish characters:** The spec uses polish diacritics in user-facing text. The data files use ASCII-safe versions for broader compatibility. Astro pages use proper polish characters in HTML content.
- **Web3Forms key:** `177c045b-3001-4911-ac1d-27cb026478e3` — used in both calculator and audit lead forms.
- **No external charting lib:** RadarChart is pure SVG, zero dependencies.
- **client:load:** Both React islands use `client:load` (hydrate immediately), not `client:visible`, because they are the main content of their pages.
