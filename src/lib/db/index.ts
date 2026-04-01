import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// In packaged Electron, DATA_DIR is set to app.getPath('userData') by the main process.
// In dev / plain Next.js, fall back to ./data/
const DB_PATH = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'readinglist.db')
  : path.join(process.cwd(), 'data', 'readinglist.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  initSchema(db);
  return db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      url          TEXT    NOT NULL UNIQUE,
      title        TEXT,
      description  TEXT,
      author       TEXT,
      domain       TEXT    NOT NULL,
      favicon_url  TEXT,
      image_url    TEXT,
      content      TEXT,
      text_content TEXT,
      word_count   INTEGER DEFAULT 0,
      is_read      INTEGER DEFAULT 0,
      is_favorite  INTEGER DEFAULT 0,
      created_at   TEXT    DEFAULT (datetime('now')),
      read_at      TEXT,
      updated_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_articles_domain     ON articles(domain);
    CREATE INDEX IF NOT EXISTS idx_articles_is_read    ON articles(is_read);
    CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
    CREATE INDEX IF NOT EXISTS idx_articles_is_favorite ON articles(is_favorite);

    CREATE TABLE IF NOT EXISTS tags (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id     INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_article_tags_tag_id ON article_tags(tag_id);

    CREATE TABLE IF NOT EXISTS highlights (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id      INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      text            TEXT    NOT NULL,
      note            TEXT    DEFAULT '',
      color           TEXT    DEFAULT 'yellow',
      start_offset    INTEGER NOT NULL DEFAULT 0,
      end_offset      INTEGER NOT NULL DEFAULT 0,
      start_container TEXT,
      end_container   TEXT,
      created_at      TEXT    DEFAULT (datetime('now')),
      updated_at      TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_highlights_article_id ON highlights(article_id);

    CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
      title,
      description,
      text_content,
      content='articles',
      content_rowid='id'
    );

    CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
      INSERT INTO articles_fts(rowid, title, description, text_content)
      VALUES (new.id, new.title, new.description, new.text_content);
    END;

    CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, description, text_content)
      VALUES ('delete', old.id, old.title, old.description, old.text_content);
    END;

    CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
      INSERT INTO articles_fts(articles_fts, rowid, title, description, text_content)
      VALUES ('delete', old.id, old.title, old.description, old.text_content);
      INSERT INTO articles_fts(rowid, title, description, text_content)
      VALUES (new.id, new.title, new.description, new.text_content);
    END;
  `);
}
