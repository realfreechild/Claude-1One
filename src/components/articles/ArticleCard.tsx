'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Article } from '@/types';
import { TagBadge } from '@/components/shared/TagBadge';
import { formatDate, estimateReadTime, truncate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  article: Article;
}

export function ArticleCard({ article }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleRead(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_read: article.is_read ? 0 : 1,
        ...(article.is_read ? {} : { read_at: new Date().toISOString() }),
      }),
    });
    router.refresh();
    setLoading(false);
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    await fetch(`/api/articles/${article.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: article.is_favorite ? 0 : 1 }),
    });
    router.refresh();
  }

  async function deleteArticle(e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm('Delete this article?')) return;
    await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <article className={`group relative flex gap-4 p-4 rounded-xl border transition-all hover:border-gray-300 hover:shadow-sm bg-white
      ${article.is_read ? 'border-gray-100' : 'border-gray-200'}`}>

      {/* Unread indicator */}
      {!article.is_read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
      )}

      {/* Favicon / thumbnail */}
      <div className="shrink-0">
        {article.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image_url}
            alt=""
            className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {article.favicon_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.favicon_url}
                alt=""
                className="w-8 h-8"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <Link
            href={`/read/${article.id}`}
            className="flex-1 min-w-0"
          >
            <h3 className={`font-semibold text-gray-900 leading-snug hover:text-blue-600 transition-colors
              ${article.is_read ? 'text-gray-600' : ''}`}>
              {truncate(article.title, 100) || article.domain}
            </h3>
          </Link>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {truncate(article.description, 160)}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">{article.domain}</span>
          <span className="text-gray-200">·</span>
          <span className="text-xs text-gray-400">{formatDate(article.created_at)}</span>
          {article.word_count > 0 && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-400">{estimateReadTime(article.word_count)}</span>
            </>
          )}
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {article.tags.map(tag => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions — show on hover */}
      <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={toggleFavorite}
          title={article.is_favorite ? 'Unfavorite' : 'Favorite'}
          className={`p-1.5 rounded-lg transition-colors ${article.is_favorite ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
        >
          <svg className="w-4 h-4" fill={article.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button
          onClick={toggleRead}
          disabled={loading}
          title={article.is_read ? 'Mark unread' : 'Mark read'}
          className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={article.is_read ? 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' : 'M5 13l4 4L19 7'} />
          </svg>
        </button>
        <button
          onClick={deleteArticle}
          title="Delete"
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </article>
  );
}
