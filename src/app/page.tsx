import { Suspense } from 'react';
import { listArticles } from '@/lib/db/articles';
import { listTags } from '@/lib/db/tags';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { FilterBar } from '@/components/articles/FilterBar';
import { Pagination } from '@/components/articles/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { ArticleFilters } from '@/types';

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const filters: ArticleFilters = {
    q: sp.q || undefined,
    tag: sp.tag || undefined,
    status: (sp.status as ArticleFilters['status']) || undefined,
    sort: (sp.sort as ArticleFilters['sort']) || 'created_at',
    order: (sp.order as ArticleFilters['order']) || 'desc',
    page: parseInt(sp.page || '1'),
    limit: 20,
  };

  const [result, tags] = await Promise.all([
    Promise.resolve(listArticles(filters)),
    listTags(),
  ]);

  const totalPages = Math.ceil(result.total / 20);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Suspense>
        <FilterBar tags={tags} total={result.total} />
      </Suspense>

      <div className="mt-5 space-y-3">
        {result.articles.length === 0 ? (
          <EmptyState
            title={filters.q ? 'No results found' : 'Your reading list is empty'}
            description={
              filters.q
                ? `No articles match "${filters.q}". Try a different search.`
                : 'Save articles by clicking the "Save article" button in the sidebar.'
            }
          />
        ) : (
          result.articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>

      <Suspense>
        <Pagination page={filters.page ?? 1} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
