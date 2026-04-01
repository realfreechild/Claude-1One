import { NextRequest, NextResponse } from 'next/server';
import { getArticleById, updateArticle, deleteArticle, setArticleTags } from '@/lib/db/articles';
import { getHighlightsByArticle } from '@/lib/db/highlights';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = getArticleById(parseInt(id));
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const highlights = getHighlightsByArticle(article.id);
    return NextResponse.json({ ...article, highlights });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    const body = await request.json();
    const { is_read, is_favorite, tags } = body as {
      is_read?: number;
      is_favorite?: number;
      tags?: string[];
    };

    const updates: Parameters<typeof updateArticle>[1] = {};
    if (is_read !== undefined) {
      updates.is_read = is_read;
      updates.read_at = is_read ? new Date().toISOString() : null;
    }
    if (is_favorite !== undefined) updates.is_favorite = is_favorite;

    if (Object.keys(updates).length > 0) {
      updateArticle(articleId, updates);
    }

    if (tags !== undefined) {
      setArticleTags(articleId, tags);
    }

    const article = getArticleById(articleId);
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteArticle(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
