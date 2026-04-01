'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

export interface SelectionInfo {
  text: string;
  rect: DOMRect;
  startOffset: number;
  endOffset: number;
  startContainer: string;
  endContainer: string;
}

function getCssSelector(el: Node, container: HTMLElement): string {
  if (el.nodeType === Node.TEXT_NODE) {
    return getCssSelector(el.parentElement!, container);
  }
  const element = el as Element;
  const parts: string[] = [];
  let cur: Element | null = element;
  while (cur && cur !== container && cur !== document.body) {
    let selector = cur.tagName.toLowerCase();
    const parent = cur.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        s => s.tagName === cur!.tagName
      );
      if (siblings.length > 1) {
        selector += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
      }
    }
    parts.unshift(selector);
    cur = cur.parentElement;
  }
  return parts.join(' > ');
}

function getTextOffset(range: Range, containerEl: HTMLElement, isStart: boolean): number {
  const rangeClone = document.createRange();
  rangeClone.selectNodeContents(containerEl);
  rangeClone.setEnd(
    isStart ? range.startContainer : range.endContainer,
    isStart ? range.startOffset : range.endOffset
  );
  return rangeClone.toString().length;
}

export function useHighlightSelection(containerRef: RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const container = containerRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      setSelection(null);
      return;
    }

    const text = sel.toString().trim();
    if (!text) { setSelection(null); return; }

    const rect = range.getBoundingClientRect();
    setSelection({
      text,
      rect,
      startOffset: getTextOffset(range, container, true),
      endOffset: getTextOffset(range, container, false),
      startContainer: getCssSelector(range.startContainer, container),
      endContainer: getCssSelector(range.endContainer, container),
    });
  }, [containerRef]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleSelectionChange]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  return { selection, clearSelection };
}
