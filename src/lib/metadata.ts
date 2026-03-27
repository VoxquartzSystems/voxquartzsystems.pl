export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
}

export function buildMeta(title: string, description: string, path: string): PageMeta {
  return {
    title: `${title} | VoxquartzSystems`,
    description,
    canonical: `https://voxquartzsystems.pl${path}`,
    ogTitle: title,
    ogDescription: description,
  };
}
