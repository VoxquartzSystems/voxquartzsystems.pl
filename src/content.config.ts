import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const integrations = defineCollection({
  loader: file('src/data/integrations.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    toolA: z.string(),
    toolB: z.string(),
    categoryA: z.string(),
    categoryB: z.string(),
    description: z.string(),
    problem: z.string(),
    solution: z.string(),
    benefits: z.array(z.string()),
    useCases: z.array(z.string()),
    techStack: z.array(z.string()),
    estimatedDays: z.number(),
    difficulty: z.enum(['basic', 'medium', 'advanced']),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

const alternatives = defineCollection({
  loader: file('src/data/alternatives.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    systemName: z.string(),
    category: z.string(),
    whatItIs: z.string(),
    limitations: z.array(z.object({ title: z.string(), description: z.string() })),
    comparison: z.array(z.object({ feature: z.string(), boxed: z.string(), custom: z.string() })),
    tco: z.array(z.object({ label: z.string(), boxed: z.number(), custom: z.number() })),
    targetAudience: z.string(),
    whenCustom: z.array(z.string()),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

const aiIndustries = defineCollection({
  loader: file('src/data/ai-industries.json'),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    industry: z.string(),
    intro: z.string(),
    useCases: z.array(z.object({ title: z.string(), description: z.string(), savings: z.string() })),
    stack: z.array(z.string()),
    roi: z.object({ hoursPerWeek: z.number(), hourlyRate: z.number(), annualSavings: z.number() }),
    challenges: z.array(z.string()),
    faq: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
});

export const collections = {
  integrations,
  alternatives,
  'ai-industries': aiIndustries,
};
