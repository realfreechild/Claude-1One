import { NextRequest, NextResponse } from 'next/server';
import { deleteTag } from '@/lib/db/tags';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTag(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}
