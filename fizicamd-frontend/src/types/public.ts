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
