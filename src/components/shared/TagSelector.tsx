'use client';

import { useState, useEffect, useRef } from 'react';
import { Tag } from '@/types';
import { TagBadge } from './TagBadge';

interface Props {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tags').then(r => r.json()).then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = allTags.filter(
    t => t.name.includes(input.toLowerCase()) && !selectedTags.includes(t.name)
  );

  function addTag(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setInput('');
    setOpen(false);
  }

  function removeTag(name: string) {
    onChange(selectedTags.filter(t => t !== name));
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap gap-1 min-h-9 p-1.5 border border-gray-300 rounded-lg bg-white cursor-text"
        onClick={() => setOpen(true)}>
        {selectedTags.map(name => (
          <TagBadge
            key={name}
            tag={{ id: 0, name }}
            onRemove={() => removeTag(name)}
          />
        ))}
        <input
          className="flex-1 min-w-20 outline-none text-sm px-1 bg-transparent"
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
              e.preventDefault();
              addTag(input);
            }
            if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
              removeTag(selectedTags[selectedTags.length - 1]);
            }
          }}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (filtered.length > 0 || input.trim()) && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filtered.map(tag => (
            <button
              key={tag.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              onMouseDown={e => { e.preventDefault(); addTag(tag.name); }}
            >
              {tag.name}
              <span className="text-gray-400 text-xs">{tag.article_count}</span>
            </button>
          ))}
          {input.trim() && !allTags.some(t => t.name === input.trim().toLowerCase()) && (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-blue-600"
              onMouseDown={e => { e.preventDefault(); addTag(input); }}
            >
              Create &ldquo;{input.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
