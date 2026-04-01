import { getDb } from './index';
import { Highlight } from '@/types';

export function getHighlightsByArticle(articleId: number): Highlight[] {
  return getDb()
    .prepare('SELECT * FROM highlights WHERE article_id = ? ORDER BY start_offset ASC')
    .all(articleId) as Highlight[];
}

export function getAllHighlights(): Highlight[] {
  return getDb()
    .prepare(`
      SELECT h.*, a.title as article_title, a.url as article_url
      FROM highlights h
      JOIN articles a ON a.id = h.article_id
      ORDER BY h.created_at DESC
    `)
    .all() as Highlight[];
}

export function insertHighlight(data: {
  article_id: number;
  text: string;
  note?: string;
  color?: string;
  start_offset: number;
  end_offset: number;
  start_container?: string | null;
  end_container?: string | null;
}): Highlight {
  const db = getDb();
  const result = db
    .prepare(`
      INSERT INTO highlights (article_id, text, note, color, start_offset, end_offset, start_container, end_container)
      VALUES (@article_id, @text, @note, @color, @start_offset, @end_offset, @start_container, @end_container)
    `)
    .run({
      article_id: data.article_id,
      text: data.text,
      note: data.note ?? '',
      color: data.color ?? 'yellow',
      start_offset: data.start_offset,
      end_offset: data.end_offset,
      start_container: data.start_container ?? null,
      end_container: data.end_container ?? null,
    });
  return db
    .prepare('SELECT * FROM highlights WHERE id = ?')
    .get(result.lastInsertRowid) as Highlight;
}

export function updateHighlight(
  id: number,
  data: Partial<{ note: string; color: string }>
): Highlight | null {
  const db = getDb();
  const fields = Object.entries(data)
    .map(([k]) => `${k} = @${k}`)
    .join(', ');
  db.prepare(
    `UPDATE highlights SET ${fields}, updated_at = datetime('now') WHERE id = @id`
  ).run({ ...data, id });
  return db.prepare('SELECT * FROM highlights WHERE id = ?').get(id) as Highlight | null;
}

export function deleteHighlight(id: number): void {
  getDb().prepare('DELETE FROM highlights WHERE id = ?').run(id);
}
