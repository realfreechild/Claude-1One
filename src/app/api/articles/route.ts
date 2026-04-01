import { NextRequest, NextResponse } from 'next/server';
import { insertArticle, listArticles, getArticleByUrl, setArticleTags } from '@/lib/db/articles';
import { fetchAndParse, extractMetadata } from '@/lib/readability';
import { ArticleFilters } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const filters: ArticleFilters = {
      q: sp.get('q') || undefined,
      tag: sp.get('tag') || undefined,
      status: (sp.get('status') as ArticleFilters['status']) || undefined,
      sort: (sp.get('sort') as ArticleFilters['sort']) || 'created_at',
      order: (sp.get('order') as ArticleFilters['order']) || 'desc',
      page: parseInt(sp.get('page') || '1'),
      limit: parseInt(sp.get('limit') || '20'),
    };

    const { articles, total } = listArticles(filters);
    const limit = filters.limit ?? 20;
    return NextResponse.json({
      articles,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/articles error:', err);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, tags = [] } = body as { url: string; tags?: string[] };

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are supported' }, { status: 400 });
    }

    // Check for duplicate
    const existing = getArticleByUrl(url);
    if (existing) {
      return NextResponse.json({ error: 'Article already saved', article: existing }, { status: 409 });
    }

    // Fetch and parse
    const { parsed, dom } = await fetchAndParse(url);
    const meta = extractMetadata(dom, url);

    const title = parsed?.title || meta.title || parsedUrl.hostname;
    const description = parsed?.excerpt || meta.description || null;
    const textContent = parsed?.textContent || null;
    const content = parsed?.content || null;
    const wordCount = textContent ? textContent.trim().split(/\s+/).length : 0;

    const article = insertArticle({
      url,
      title,
      description,
      author: parsed?.byline || meta.author || null,
      domain: meta.domain,
      favicon_url: meta.faviconUrl,
      image_url: meta.imageUrl,
      content,
      text_content: textContent,
      word_count: wordCount,
    });

    if (tags.length > 0) {
      setArticleTags(article.id, tags);
    }

    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error('POST /api/articles error:', err);
    const message = err instanceof Error ? err.message : 'Failed to save article';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
