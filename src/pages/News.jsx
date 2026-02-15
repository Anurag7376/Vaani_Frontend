import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { newsApi } from '../api/axios';
import PageTransition from '../components/PageTransition';
import { NewsCardSkeleton } from '../components/Skeleton';
import { safeStr, safeDate, safeUrl } from '../utils/safeDisplay';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi
      .getGovernmentNews()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data?.results ?? data?.articles ?? [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        toast.error('Failed to load news');
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Government News</h1>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No news available at the moment.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => {
            if (!item || typeof item !== 'object') return null;
            const title = safeStr(item?.title) || safeStr(item?.headline) || 'Untitled';
            const source = safeStr(item?.source) || safeStr(item?.source_name) || safeStr(item?.author) || '—';
            const dateVal = item?.published_date ?? item?.publishedAt ?? item?.date;
            const dateStr = safeDate(dateVal);
            const linkHref = safeUrl(item?.url) || safeUrl(item?.link) || '';
            return (
              <article
                key={i}
                className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all duration-200"
              >
                <h2 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                  {title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Source: {source}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
                  {dateStr}
                </p>
                {linkHref ? (
                  <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Read more →
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
