// src/lib/related.ts

function truncate(text: string, max = 120): string {
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export interface RelatedItem {
  title: string;
  href: string;
  description: string;
}

export interface Integration {
  slug: string;
  toolA: string;
  toolB: string;
  categoryA: string;
  categoryB: string;
  description: string;
}

export interface Alternative {
  slug: string;
  systemName: string;
  category: string;
  whatItIs: string;
}

export interface AIIndustry {
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
      description: truncate(i.description),
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
      description: truncate(a.whatItIs),
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
      description: truncate(i.intro),
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
      description: truncate(i.description),
    }));
}
