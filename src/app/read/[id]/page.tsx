import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleById } from '@/lib/db/articles';
import { getHighlightsByArticle } from '@/lib/db/highlights';
import { ReaderContent } from '@/components/reader/ReaderContent';
import { HighlightsSidebar } from '@/components/reader/HighlightsSidebar';
import { TagBadge } from '@/components/shared/TagBadge';
import { estimateReadTime, formatDate } from '@/lib/utils';
import { MarkReadButton } from '@/components/reader/MarkReadButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReaderPage({ params }: PageProps) {
  const { id } = await params;
  const article = getArticleById(parseInt(id));
  if (!article) notFound();

  const highlights = getHighlightsByArticle(article.id);

  return (
    <div className="min-h-full bg-white">
      {/* Topbar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{article.domain}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Original
          </a>
          <MarkReadButton articleId={article.id} isRead={!!article.is_read} />
        </div>
      </div>

      {/* Content area */}
      <div className="flex max-w-5xl mx-auto px-6 py-10 gap-8">
        <article className="flex-1 min-w-0 max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
              {article.title || article.domain}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-3">
              {article.author && <span className="font-medium text-gray-700">{article.author}</span>}
              {article.author && <span>·</span>}
              <span>{article.domain}</span>
              <span>·</span>
              <span>{formatDate(article.created_at)}</span>
              {article.word_count > 0 && (
                <>
                  <span>·</span>
                  <span>{estimateReadTime(article.word_count)}</span>
                </>
              )}
            </div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {article.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
              </div>
            )}
            {article.description && (
              <p className="mt-4 text-gray-600 text-base italic border-l-4 border-gray-200 pl-4">
                {article.description}
              </p>
            )}
          </header>

          {/* Article content or fallback */}
          {article.content ? (
            <ReaderContent
              content={article.content}
              articleId={article.id}
              initialHighlights={highlights}
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">Reader view not available for this article.</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Read on original site
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </article>

        {/* Highlights sidebar */}
        {article.content && (
          <HighlightsSidebar highlights={highlights} articleId={article.id} />
        )}
      </div>
    </div>
  );
}
