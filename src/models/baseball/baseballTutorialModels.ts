// ═══════════════════════════════════════════════
// Baseball Tutorial Models
// ═══════════════════════════════════════════════

export interface TutorialManifest {
  categories: TutorialCategory[];
  glossary: Record<string, string>;
}

export interface TutorialCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  order: number;
  leagueFilter: "MLB" | "College" | null;
  articles: TutorialArticleMeta[];
}

export interface TutorialArticleMeta {
  id: string;
  title: string;
  summary: string;
  order: number;
  tags: string[];
  leagueFilter: "MLB" | "College" | null;
  lastUpdated: string;
}

export interface TutorialArticle {
  id: string;
  categoryId: string;
  title: string;
  markdown: string;
  tags: string[];
  relatedArticles: TutorialRelatedArticle[];
  lastUpdated: string;
}

export interface TutorialRelatedArticle {
  categoryId: string;
  articleId: string;
  title: string;
}
