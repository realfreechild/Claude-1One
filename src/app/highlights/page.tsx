import Link from 'next/link';
import { getAllHighlights } from '@/lib/db/highlights';
import { EmptyState } from '@/components/shared/EmptyState';
import { Highlight } from '@/types';
import { HighlightPageCard } from '@/components/highlights/HighlightPageCard';

const COLOR_MAP: Record<string, string> = {
  yellow: 'border-l-yellow-400',
  green:  'border-l-green-400',
  blue:   'border-l-blue-400',
  pink:   'border-l-pink-400',
};

function groupByArticle(highlights: Highlight[]): Map<number, { articleTitle: string | null; articleUrl: string; articleId: number; highlights: Highlight[] }> {
  const map = new Map<number, { articleTitle: string | null; articleUrl: string; articleId: number; highlights: Highlight[] }>();
  for (const h of highlights) {
    if (!map.has(h.article_id)) {
      map.set(h.article_id, {
        articleTitle: h.article_title ?? null,
        articleUrl: h.article_url ?? '',
        articleId: h.article_id,
        highlights: [],
      });
    }
    map.get(h.article_id)!.highlights.push(h);
  }
  return map;
}

export default function HighlightsPage() {
  const highlights = getAllHighlights();
  const grouped = groupByArticle(highlights);

  if (highlights.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Highlights</h1>
        <EmptyState
          title="No highlights yet"
          description="Open an article and select text to create highlights."
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Highlights</h1>
      <p className="text-sm text-gray-500 mb-6">{highlights.length} highlight{highlights.length !== 1 ? 's' : ''} across {grouped.size} article{grouped.size !== 1 ? 's' : ''}</p>

      <div className="space-y-8">
        {Array.from(grouped.values()).map(group => (
          <div key={group.articleId}>
            <div className="flex items-baseline gap-2 mb-3">
              <Link
                href={`/read/${group.articleId}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {group.articleTitle || 'Untitled'}
              </Link>
              <span className="text-xs text-gray-400">{group.highlights.length} highlight{group.highlights.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="space-y-2 ml-0">
              {group.highlights.map(h => (
                <HighlightPageCard key={h.id} highlight={h} colorClass={COLOR_MAP[h.color] || COLOR_MAP.yellow} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
