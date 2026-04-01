'use client';

import { useState } from 'react';
import { Highlight } from '@/types';

const COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-100 border-yellow-300',
  green:  'bg-green-100 border-green-300',
  blue:   'bg-blue-100 border-blue-300',
  pink:   'bg-pink-100 border-pink-300',
};

interface Props {
  highlights: Highlight[];
  articleId: number;
}

export function HighlightsSidebar({ highlights: initial, articleId }: Props) {
  const [highlights, setHighlights] = useState(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');

  async function saveNote(id: number) {
    await fetch(`/api/articles/${articleId}/highlights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText }),
    });
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note: noteText } : h));
    setEditingId(null);
  }

  async function deleteHighlight(id: number) {
    if (!confirm('Delete this highlight?')) return;
    await fetch(`/api/articles/${articleId}/highlights/${id}`, { method: 'DELETE' });
    setHighlights(prev => prev.filter(h => h.id !== id));
  }

  if (highlights.length === 0) {
    return (
      <aside className="w-64 shrink-0 pl-6 hidden xl:block">
        <div className="sticky top-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Highlights</h3>
          <p className="text-sm text-gray-400">Select text to highlight it.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 pl-6 hidden xl:block">
      <div className="sticky top-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Highlights ({highlights.length})
        </h3>
        <div className="space-y-3">
          {highlights.map(h => (
            <div
              key={h.id}
              className={`rounded-lg border p-3 text-sm ${COLOR_MAP[h.color] || COLOR_MAP.yellow}`}
            >
              <p className="text-gray-800 leading-snug mb-2">&ldquo;{h.text}&rdquo;</p>

              {editingId === h.id ? (
                <div>
                  <textarea
                    autoFocus
                    className="w-full text-xs outline-none resize-none bg-white/60 rounded p-1"
                    rows={2}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => saveNote(h.id)} className="text-xs text-blue-600 hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {h.note && <p className="text-xs text-gray-600 italic mb-1">{h.note}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingId(h.id); setNoteText(h.note || ''); }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {h.note ? 'Edit note' : 'Add note'}
                    </button>
                    <button
                      onClick={() => deleteHighlight(h.id)}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
