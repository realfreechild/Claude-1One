'use client';

import { useState } from 'react';
import { Highlight } from '@/types';
import { useRouter } from 'next/navigation';

interface Props {
  highlight: Highlight;
  colorClass: string;
}

export function HighlightPageCard({ highlight: initial, colorClass }: Props) {
  const router = useRouter();
  const [highlight, setHighlight] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState(initial.note || '');

  async function saveNote() {
    const res = await fetch(`/api/articles/${highlight.article_id}/highlights/${highlight.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText }),
    });
    if (res.ok) {
      const updated = await res.json();
      setHighlight(updated);
      setEditing(false);
    }
  }

  async function deleteHighlight() {
    if (!confirm('Delete this highlight?')) return;
    await fetch(`/api/articles/${highlight.article_id}/highlights/${highlight.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className={`border-l-4 ${colorClass} pl-4 py-1`}>
      <p className="text-gray-800 text-sm leading-relaxed mb-1">&ldquo;{highlight.text}&rdquo;</p>
      {editing ? (
        <div className="mt-2">
          <textarea
            autoFocus
            className="w-full text-sm border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            rows={2}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
          />
          <div className="flex gap-2 mt-1">
            <button onClick={saveNote} className="text-xs text-blue-600 hover:underline">Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:underline">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          {highlight.note && (
            <p className="text-xs text-gray-500 italic flex-1">{highlight.note}</p>
          )}
          <button onClick={() => { setEditing(true); setNoteText(highlight.note || ''); }}
            className="text-xs text-gray-400 hover:text-gray-600">
            {highlight.note ? 'Edit note' : 'Add note'}
          </button>
          <button onClick={deleteHighlight} className="text-xs text-gray-400 hover:text-red-500">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
