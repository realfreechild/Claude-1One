import { NextRequest, NextResponse } from 'next/server';
import { getHighlightsByArticle, insertHighlight } from '@/lib/db/highlights';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const highlights = getHighlightsByArticle(parseInt(id));
    return NextResponse.json(highlights);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch highlights' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, note, color, start_offset, end_offset, start_container, end_container } = body;

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const highlight = insertHighlight({
      article_id: parseInt(id),
      text,
      note,
      color,
      start_offset: start_offset ?? 0,
      end_offset: end_offset ?? 0,
      start_container,
      end_container,
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}
