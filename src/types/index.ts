export interface Article {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  author: string | null;
  domain: string;
  favicon_url: string | null;
  image_url: string | null;
  content: string | null;
  text_content: string | null;
  word_count: number;
  is_read: number; // 0 or 1
  is_favorite: number; // 0 or 1
  created_at: string;
  read_at: string | null;
  updated_at: string;
  tags?: Tag[];
}

export interface ArticleWithHighlights extends Article {
  highlights: Highlight[];
}

export interface Tag {
  id: number;
  name: string;
  article_count?: number;
}

export interface Highlight {
  id: number;
  article_id: number;
  text: string;
  note: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  start_offset: number;
  end_offset: number;
  start_container: string | null;
  end_container: string | null;
  created_at: string;
  updated_at: string;
  // joined from articles table for the highlights page
  article_title?: string | null;
  article_url?: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ArticleFilters {
  q?: string;
  tag?: string;
  status?: 'all' | 'read' | 'unread' | 'favorite';
  sort?: 'created_at' | 'title' | 'word_count';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
