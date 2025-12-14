export interface HomepageContent {
  hero: HeroBlock | null;
  features: FeatureCard[];
  spotlights: SpotlightCard[];
}

export interface HeroBlock {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  media?: HeroMedia | null;
  primaryCta?: ActionCta | null;
  secondaryCta?: ActionCta | null;
}

export interface HeroMedia {
  image?: string | null;
  accentColor?: string | null;
}

export interface ActionCta {
  label?: string | null;
  link?: string | null;
}

export interface FeatureCard {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  icon?: string | null;
  cta?: ActionCta | null;
}

export interface SpotlightCard {
  id: string;
  title: string;
  description?: string | null;
  badge?: string | null;
  navigationSlug?: string | null;
  link?: string | null;
}

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  href?: string | null;
  type: string;
  parentId?: string | null;
}

export interface SearchResponse {
  items: SearchResult[];
}
