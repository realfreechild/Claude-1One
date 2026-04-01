'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tag } from '@/types';

interface Props {
  tags: Tag[];
  total: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
  { value: 'favorite', label: 'Favorites' },
];

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Date added (newest)' },
  { value: 'created_at-asc', label: 'Date added (oldest)' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'word_count-desc', label: 'Longest first' },
];

export function FilterBar({ tags, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  const activeStatus = sp.get('status') || '';
  const activeTag = sp.get('tag') || '';
  const sortOrder = `${sp.get('sort') || 'created_at'}-${sp.get('order') || 'desc'}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-gray-500 mr-1">{total} articles</span>

      {/* Status filter */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => updateParam('status', opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors
              ${activeStatus === opt.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tag filter */}
      {tags.length > 0 && (
        <select
          value={activeTag}
          onChange={e => updateParam('tag', e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        >
          <option value="">All tags</option>
          {tags.map(t => (
            <option key={t.id} value={t.name}>{t.name} ({t.article_count})</option>
          ))}
        </select>
      )}

      {/* Sort */}
      <select
        value={sortOrder}
        onChange={e => {
          const [sort, order] = e.target.value.split('-');
          const params = new URLSearchParams(sp.toString());
          params.set('sort', sort);
          params.set('order', order);
          params.delete('page');
          router.replace(`${pathname}?${params.toString()}`);
        }}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 ml-auto"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
