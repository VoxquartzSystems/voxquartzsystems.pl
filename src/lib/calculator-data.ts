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
  { id: 'landing', label: 'Landing page / Strona firmowa', baseCost: 1200, baseDays: 3, recommendedStack: 'Astro + Tailwind CSS + Cloudflare Pages' },
  { id: 'ecommerce', label: 'Sklep internetowy', baseCost: 3500, baseDays: 7, recommendedStack: 'Next.js + Stripe + Supabase + Vercel' },
  { id: 'dashboard', label: 'Panel administracyjny / Dashboard', baseCost: 4000, baseDays: 7, recommendedStack: 'Next.js + React + PostgreSQL + Prisma' },
  { id: 'saas', label: 'Aplikacja SaaS multi-tenant', baseCost: 8000, baseDays: 14, recommendedStack: 'Next.js + Supabase + Stripe + Multi-tenant architecture' },
  { id: 'marketplace', label: 'Marketplace / Platforma', baseCost: 10000, baseDays: 18, recommendedStack: 'Next.js + PostgreSQL + Stripe Connect + Elasticsearch' },
  { id: 'mobile', label: 'Aplikacja mobilna iOS + Android', baseCost: 6000, baseDays: 14, recommendedStack: 'React Native + Expo + Firebase + REST API' },
];

export const features: Feature[] = [
  { id: 'auth', label: 'Autentykacja (logowanie, rejestracja, OAuth)', cost: 800, days: 2 },
  { id: 'user-panel', label: 'Panel użytkownika', cost: 800, days: 2 },
  { id: 'admin-panel', label: 'Panel administratora', cost: 1500, days: 3 },
  { id: 'payments', label: 'Płatności online (Stripe / P24)', cost: 1200, days: 3 },
  { id: 'api-integrations', label: 'Integracje z API zewnętrznymi', cost: 1200, days: 2, hasSlider: true, sliderMin: 1200, sliderMax: 3500, sliderMinDays: 2, sliderMaxDays: 5 },
  { id: 'notifications', label: 'System powiadomień (email + push)', cost: 1000, days: 2 },
  { id: 'chat', label: 'Chat / messaging real-time', cost: 2000, days: 4 },
  { id: 'search', label: 'Zaawansowana wyszukiwarka', cost: 1000, days: 2 },
  { id: 'reporting', label: 'Raportowanie i analytics', cost: 1500, days: 3 },
  { id: 'ai', label: 'Integracja AI (OpenAI / Claude)', cost: 1500, days: 3, hasSlider: true, sliderMin: 1500, sliderMax: 4000, sliderMinDays: 3, sliderMaxDays: 7 },
  { id: 'pwa', label: 'Wersja mobilna (PWA lub native)', cost: 3000, days: 5, hasSlider: true, sliderMin: 3000, sliderMax: 6000, sliderMinDays: 5, sliderMaxDays: 10 },
  { id: 'i18n', label: 'Multi-language (i18n)', cost: 800, days: 2 },
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
  { label: 'Średnia', multiplier: 1.3 },
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
