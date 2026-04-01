'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Highlight } from '@/types';
import { useHighlightSelection } from '@/hooks/useHighlightSelection';
import { HighlightToolbar } from './HighlightToolbar';

interface Props {
  content: string;
  articleId: number;
  initialHighlights: Highlight[];
}

function applyHighlightsToDOM(container: HTMLElement, highlights: Highlight[]) {
  // Remove existing marks
  container.querySelectorAll('mark.rl-highlight').forEach(mark => {
    const parent = mark.parentNode!;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
  });
  container.normalize();

  const fullText = container.textContent || '';

  for (const h of highlights) {
    try {
      // Find text range using character offsets
      let charCount = 0;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let startNode: Text | null = null;
      let endNode: Text | null = null;
      let startOff = 0;
      let endOff = 0;

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const len = node.length;
        if (!startNode && charCount + len >= h.start_offset) {
          startNode = node;
          startOff = h.start_offset - charCount;
        }
        if (!endNode && charCount + len >= h.end_offset) {
          endNode = node;
          endOff = h.end_offset - charCount;
          break;
        }
        charCount += len;
      }

      if (!startNode || !endNode) continue;

      // Fallback: search by text content
      if (startOff < 0 || endOff < 0) {
        const idx = fullText.indexOf(h.text);
        if (idx < 0) continue;
      }

      const range = document.createRange();
      range.setStart(startNode, Math.max(0, startOff));
      range.setEnd(endNode, Math.min(endNode.length, endOff));

      if (range.collapsed) continue;

      const mark = document.createElement('mark');
      mark.className = `rl-highlight highlight-${h.color}`;
      mark.dataset.highlightId = String(h.id);
      mark.title = h.note || '';
      range.surroundContents(mark);
    } catch {
      // Ignore range errors from complex DOM structures
    }
  }
}

export function ReaderContent({ content, articleId, initialHighlights }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const { selection, clearSelection } = useHighlightSelection(containerRef);

  // Apply highlights after render
  useEffect(() => {
    if (containerRef.current) {
      applyHighlightsToDOM(containerRef.current, highlights);
    }
  }, [highlights]);

  const handleHighlightCreated = useCallback((h: Highlight) => {
    setHighlights(prev => [...prev, h]);
    clearSelection();
  }, [clearSelection]);

  const handleDeleteHighlight = useCallback(async (highlightId: number) => {
    await fetch(`/api/articles/${articleId}/highlights/${highlightId}`, { method: 'DELETE' });
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  }, [articleId]);

  // Click on highlight to show info / delete option
  const handleClickHighlight = useCallback((e: React.MouseEvent) => {
    const mark = (e.target as HTMLElement).closest('mark.rl-highlight') as HTMLElement | null;
    if (!mark) return;
    const id = parseInt(mark.dataset.highlightId || '0');
    if (!id) return;
    const h = highlights.find(x => x.id === id);
    if (!h) return;
    const action = h.note
      ? `Note: "${h.note}"\n\nDelete this highlight?`
      : 'Delete this highlight?';
    if (confirm(action)) handleDeleteHighlight(id);
  }, [highlights, handleDeleteHighlight]);

  return (
    <div className="relative">
      {selection && (
        <HighlightToolbar
          selection={selection}
          articleId={articleId}
          onHighlightCreated={handleHighlightCreated}
          onClose={clearSelection}
        />
      )}
      <div
        ref={containerRef}
        className="reader-content"
        dangerouslySetInnerHTML={{ __html: content }}
        onClick={handleClickHighlight}
      />
    </div>
  );
}
