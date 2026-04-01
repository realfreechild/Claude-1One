import Link from 'next/link';
import { listTags } from '@/lib/db/tags';
import { EmptyState } from '@/components/shared/EmptyState';
import { DeleteTagButton } from '@/components/tags/DeleteTagButton';

export default function TagsPage() {
  const tags = listTags();

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>
      {tags.length === 0 ? (
        <EmptyState
          title="No tags yet"
          description="Tags are created automatically when you save articles with tags."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <Link
                href={`/?tag=${encodeURIComponent(tag.name)}`}
                className="font-medium text-gray-800 hover:text-blue-600 transition-colors flex-1 min-w-0"
              >
                <span className="block truncate">{tag.name}</span>
                <span className="text-xs text-gray-400">{tag.article_count} article{tag.article_count !== 1 ? 's' : ''}</span>
              </Link>
              <DeleteTagButton tagId={tag.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
