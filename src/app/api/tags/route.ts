import { NextRequest, NextResponse } from 'next/server';
import { listTags, createTag } from '@/lib/db/tags';

export async function GET() {
  try {
    return NextResponse.json(listTags());
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const tag = createTag(name);
    return NextResponse.json(tag, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}
