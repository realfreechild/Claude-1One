'use client';

import { useRouter } from 'next/navigation';

export function DeleteTagButton({ tagId }: { tagId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Delete this tag? It will be removed from all articles.')) return;
    await fetch(`/api/tags/${tagId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="ml-2 text-gray-300 hover:text-red-500 transition-colors"
      title="Delete tag"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}
