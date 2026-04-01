'use client';

import { useState } from 'react';
import { SelectionInfo } from '@/hooks/useHighlightSelection';
import { Highlight } from '@/types';

const COLORS = [
  { id: 'yellow', label: 'Yellow', cls: 'bg-yellow-200 hover:bg-yellow-300' },
  { id: 'green',  label: 'Green',  cls: 'bg-green-200 hover:bg-green-300' },
  { id: 'blue',   label: 'Blue',   cls: 'bg-blue-200 hover:bg-blue-300' },
  { id: 'pink',   label: 'Pink',   cls: 'bg-pink-200 hover:bg-pink-300' },
] as const;

interface Props {
  selection: SelectionInfo;
  articleId: number;
  onHighlightCreated: (h: Highlight) => void;
  onClose: () => void;
}

export function HighlightToolbar({ selection, articleId, onHighlightCreated, onClose }: Props) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [pendingColor, setPendingColor] = useState<string>('yellow');
  const [saving, setSaving] = useState(false);

  const top = selection.rect.top + window.scrollY - 52;
  const left = selection.rect.left + selection.rect.width / 2;

  async function save(color: string, noteText = '') {
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/highlights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selection.text,
          note: noteText,
          color,
          start_offset: selection.startOffset,
          end_offset: selection.endOffset,
          start_container: selection.startContainer,
          end_container: selection.endContainer,
        }),
      });
      if (res.ok) {
        const h = await res.json() as Highlight;
        onHighlightCreated(h);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed z-40 flex flex-col items-center"
      style={{ top, left, transform: 'translateX(-50%)' }}
    >
      <div className="bg-gray-900 text-white rounded-xl shadow-xl px-2 py-1.5 flex items-center gap-1">
        {COLORS.map(c => (
          <button
            key={c.id}
            title={`Highlight ${c.label}`}
            onClick={() => {
              if (showNoteInput) { setPendingColor(c.id); } else { save(c.id); }
            }}
            className={`w-6 h-6 rounded-full ${c.cls} transition-colors border-2 ${pendingColor === c.id && showNoteInput ? 'border-white' : 'border-transparent'}`}
          />
        ))}
        <div className="w-px h-5 bg-gray-600 mx-1" />
        <button
          onClick={() => setShowNoteInput(v => !v)}
          title="Add note"
          className="px-2 py-0.5 text-xs hover:bg-gray-700 rounded-lg transition-colors"
        >
          Note
        </button>
        <button onClick={onClose} className="px-1 text-gray-400 hover:text-white transition-colors">
          ×
        </button>
      </div>

      {showNoteInput && (
        <div className="mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-64">
          <textarea
            autoFocus
            className="w-full text-sm outline-none resize-none text-gray-800 placeholder-gray-400"
            placeholder="Add a note..."
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setShowNoteInput(false); setNote(''); }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => save(pendingColor, note)}
              disabled={saving}
              className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
