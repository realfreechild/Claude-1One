'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  articleId: number;
  isRead: boolean;
}

export function MarkReadButton({ articleId, isRead: initialRead }: Props) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(initialRead);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newVal = isRead ? 0 : 1;
    await fetch(`/api/articles/${articleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: newVal }),
    });
    setIsRead(!isRead);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
        ${isRead
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
        }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {isRead ? 'Read' : 'Mark read'}
    </button>
  );
}
