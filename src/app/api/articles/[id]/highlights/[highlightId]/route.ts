import { NextRequest, NextResponse } from 'next/server';
import { updateHighlight, deleteHighlight } from '@/lib/db/highlights';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; highlightId: string }> }
) {
  try {
    const { highlightId } = await params;
    const body = await request.json();
    const { note, color } = body as { note?: string; color?: string };
    const updated = updateHighlight(parseInt(highlightId), { note, color });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update highlight' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; highlightId: string }> }
) {
  try {
    const { highlightId } = await params;
    deleteHighlight(parseInt(highlightId));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete highlight' }, { status: 500 });
  }
}
