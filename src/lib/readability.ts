import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export interface ParsedArticle {
  title: string | null;
  content: string | null;
  textContent: string | null;
  excerpt: string | null;
  byline: string | null;
  length: number;
  siteName: string | null;
}

export async function fetchAndParse(url: string): Promise<{
  html: string;
  parsed: ParsedArticle | null;
  dom: JSDOM;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html: string;
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ReadingListBot/1.0; +https://github.com/readinglist)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document.cloneNode(true) as Document);
  const parsed = reader.parse();

  return {
    html,
    parsed: parsed
      ? {
          title: parsed.title ?? null,
          content: parsed.content ?? null,
          textContent: parsed.textContent ?? null,
          excerpt: parsed.excerpt ?? null,
          byline: parsed.byline ?? null,
          length: parsed.length ?? 0,
          siteName: parsed.siteName ?? null,
        }
      : null,
    dom,
  };
}

export function extractMetadata(dom: JSDOM, url: string) {
  const doc = dom.window.document;
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace(/^www\./, '');

  const getMeta = (selectors: string[]): string | null => {
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      const val = el?.getAttribute('content') || el?.textContent;
      if (val?.trim()) return val.trim();
    }
    return null;
  };

  const title =
    getMeta([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
    ]) || null;

  const description =
    getMeta([
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]',
    ]) || null;

  const author =
    getMeta([
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[name="twitter:creator"]',
    ]) || null;

  const imageUrl =
    getMeta([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ]) || null;

  // Try to resolve favicon
  let faviconUrl: string | null = null;
  const faviconEl = doc.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  if (faviconEl) {
    const href = faviconEl.getAttribute('href');
    if (href) {
      try {
        faviconUrl = new URL(href, url).href;
      } catch {
        faviconUrl = null;
      }
    }
  }
  if (!faviconUrl) {
    faviconUrl = `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
  }

  return { title, description, author, imageUrl, faviconUrl, domain };
}
