import { getDb } from './index';
import { Article, ArticleFilters, Tag } from '@/types';

export function insertArticle(data: {
  url: string;
  title?: string | null;
  description?: string | null;
  author?: string | null;
  domain: string;
  favicon_url?: string | null;
  image_url?: string | null;
  content?: string | null;
  text_content?: string | null;
  word_count?: number;
}): Article {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO articles (url, title, description, author, domain, favicon_url, image_url, content, text_content, word_count)
    VALUES (@url, @title, @description, @author, @domain, @favicon_url, @image_url, @content, @text_content, @word_count)
  `);
  const result = stmt.run({
    url: data.url,
    title: data.title ?? null,
    description: data.description ?? null,
    author: data.author ?? null,
    domain: data.domain,
    favicon_url: data.favicon_url ?? null,
    image_url: data.image_url ?? null,
    content: data.content ?? null,
    text_content: data.text_content ?? null,
    word_count: data.word_count ?? 0,
  });
  return getArticleById(result.lastInsertRowid as number)!;
}

export function getArticleById(id: number): Article | null {
  const db = getDb();
  const article = db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as Article | undefined;
  if (!article) return null;
  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN article_tags at ON at.tag_id = t.id
    WHERE at.article_id = ?
    ORDER BY t.name
  `).all(id) as Tag[];
  return { ...article, tags };
}

export function getArticleByUrl(url: string): Article | null {
  const db = getDb();
  return db.prepare('SELECT * FROM articles WHERE url = ?').get(url) as Article | null;
}

export function listArticles(filters: ArticleFilters): { articles: Article[]; total: number } {
  const db = getDb();
  const {
    q,
    tag,
    status,
    sort = 'created_at',
    order = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;
  const params: (string | number)[] = [];
  const conditions: string[] = [];

  let baseQuery = 'SELECT DISTINCT a.* FROM articles a';
  let countQuery = 'SELECT COUNT(DISTINCT a.id) as total FROM articles a';

  // FTS join
  if (q && q.trim()) {
    baseQuery += ' JOIN articles_fts fts ON a.id = fts.rowid';
    countQuery += ' JOIN articles_fts fts ON a.id = fts.rowid';
    conditions.push('articles_fts MATCH ?');
    params.push(q.trim().replace(/[^a-zA-Z0-9\s]/g, '') + '*');
  }

  // Tag join
  if (tag) {
    baseQuery += ' JOIN article_tags at2 ON at2.article_id = a.id JOIN tags t ON t.id = at2.tag_id';
    countQuery += ' JOIN article_tags at2 ON at2.article_id = a.id JOIN tags t ON t.id = at2.tag_id';
    conditions.push('t.name = ?');
    params.push(tag);
  }

  // Status filter
  if (status === 'read') {
    conditions.push('a.is_read = 1');
  } else if (status === 'unread') {
    conditions.push('a.is_read = 0');
  } else if (status === 'favorite') {
    conditions.push('a.is_favorite = 1');
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ');
    baseQuery += whereClause;
    countQuery += whereClause;
  }

  // Validate sort/order to prevent injection
  const validSorts = ['created_at', 'title', 'word_count'];
  const validOrders = ['asc', 'desc'];
  const safeSort = validSorts.includes(sort) ? sort : 'created_at';
  const safeOrder = validOrders.includes(order) ? order : 'desc';

  if (q && q.trim()) {
    baseQuery += ` ORDER BY rank, a.${safeSort} ${safeOrder}`;
  } else {
    baseQuery += ` ORDER BY a.${safeSort} ${safeOrder}`;
  }

  baseQuery += ' LIMIT ? OFFSET ?';

  const countResult = db.prepare(countQuery).get(...params) as { total: number };
  const articles = db.prepare(baseQuery).all(...params, limit, offset) as Article[];

  // Attach tags to each article
  const tagStmt = db.prepare(`
    SELECT t.* FROM tags t
    JOIN article_tags at ON at.tag_id = t.id
    WHERE at.article_id = ?
    ORDER BY t.name
  `);
  const articlesWithTags = articles.map(a => ({
    ...a,
    tags: tagStmt.all(a.id) as Tag[],
  }));

  return { articles: articlesWithTags, total: countResult?.total ?? 0 };
}

export function updateArticle(
  id: number,
  data: Partial<{
    is_read: number;
    is_favorite: number;
    read_at: string | null;
  }>
): Article | null {
  const db = getDb();
  const fields = Object.entries(data)
    .map(([k]) => `${k} = @${k}`)
    .join(', ');
  db.prepare(`UPDATE articles SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({
    ...data,
    id,
  });
  return getArticleById(id);
}

export function setArticleTags(articleId: number, tagNames: string[]): void {
  const db = getDb();
  const transaction = db.transaction((names: string[]) => {
    // Remove existing tags
    db.prepare('DELETE FROM article_tags WHERE article_id = ?').run(articleId);
    for (const name of names) {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) continue;
      db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(trimmed);
      const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(trimmed) as { id: number };
      db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(
        articleId,
        tag.id
      );
    }
  });
  transaction(tagNames);
}

export function deleteArticle(id: number): void {
  getDb().prepare('DELETE FROM articles WHERE id = ?').run(id);
}
