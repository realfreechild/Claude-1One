'use client';

import { Tag } from '@/types';

interface Props {
  tag: Tag;
  onRemove?: (tag: Tag) => void;
  onClick?: (tag: Tag) => void;
  active?: boolean;
}

export function TagBadge({ tag, onRemove, onClick, active }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors
        ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
        ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(tag)}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(tag); }}
          className="hover:text-red-500 transition-colors ml-0.5"
          aria-label={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
