import { getDb } from './index';
import { Tag } from '@/types';

export function listTags(): Tag[] {
  return getDb()
    .prepare(`
      SELECT t.*, COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON at.tag_id = t.id
      GROUP BY t.id
      ORDER BY t.name ASC
    `)
    .all() as Tag[];
}

export function deleteTag(id: number): void {
  getDb().prepare('DELETE FROM tags WHERE id = ?').run(id);
}

export function createTag(name: string): Tag {
  const db = getDb();
  db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').run(name.trim().toLowerCase());
  return db.prepare('SELECT * FROM tags WHERE name = ?').get(name.trim().toLowerCase()) as Tag;
}
