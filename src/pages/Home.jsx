import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { newsApi } from '../api/axios';
import PageTransition from '../components/PageTransition';
import { NewsCardSkeleton } from '../components/Skeleton';
import { safeStr, safeDate, safeUrl } from '../utils/safeDisplay';

function NewsCard({ item }) {
  if (!item || typeof item !== 'object') return null;
  const title = safeStr(item?.title) || safeStr(item?.headline) || 'Untitled';
  const source = safeStr(item?.source) || safeStr(item?.source_name) || safeStr(item?.author) || '—';
  const dateVal = item?.published_date ?? item?.publishedAt ?? item?.date;
  const dateStr = safeDate(dateVal);
  const linkHref = safeUrl(item?.url) || safeUrl(item?.link) || '';
  return (
    <article className="rounded-xl bg-white/90 dark:bg-surface-dark/95 border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all duration-200">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        {source}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        {dateStr}
      </p>
      {linkHref && (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          Read more →
        </a>
      )}
    </article>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    newsApi
      .getGovernmentNews()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data?.results ?? data?.articles ?? [];
        setNews(Array.isArray(list) ? list.slice(0, 6) : []);
      })
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, []);

  const btnBase =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.03] active:scale-[0.99] w-full sm:w-auto min-w-0';

  return (
    <PageTransition className="min-h-[calc(100vh-4.5rem)] flex flex-col home-page-bg">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 text-center">
        <div className="w-full max-w-2xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
          >
            Discover schemes that fit <span className="text-primary-600 dark:text-primary-400">you</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 sm:mb-10"
          >
            Vaani helps Indian citizens find eligible government schemes. Chat or speak to get personalized recommendations.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center"
          >
            <Link
              to="/chat"
              className={`${btnBase} px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700`}
            >
              Ask Vaani Now
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <Link
              to="/schemes"
              className={`${btnBase} px-6 py-3.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-primary-500`}
            >
              Browse Schemes
            </Link>
            {!isAuthenticated() && (
              <Link
                to="/login"
                className={`${btnBase} px-6 py-3.5 border-2 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20`}
              >
                Login
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="border-t border-slate-200/80 dark:border-slate-800 py-10 sm:py-12 px-4">
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center mb-10 sm:mb-12">
          <Link
            to="/chat"
            className="block p-5 rounded-xl bg-white/90 dark:bg-surface-dark/95 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer"
          >
            <div className="text-3xl mb-2">Voice & Text</div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Chat or speak</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Use voice or text in your language.</p>
          </Link>
          <Link
            to="/schemes"
            className="block p-5 rounded-xl bg-white/90 dark:bg-surface-dark/95 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer"
          >
            <div className="text-3xl mb-2">Schemes</div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Filter & search</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">By category, income, residence.</p>
          </Link>
          <Link
            to="/news"
            className="block p-5 rounded-xl bg-white/90 dark:bg-surface-dark/95 border border-slate-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 cursor-pointer"
          >
            <div className="text-3xl mb-2">News</div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Latest updates</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Government scheme news.</p>
          </Link>
        </div>

        <div className="w-full max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Latest Government Updates
          </h2>
          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </div>
          ) : news.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center">No news available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.map((item, i) => (
                <NewsCard key={i} item={item} />
              ))}
            </div>
          )}
          {news.length > 0 && (
            <div className="mt-6 text-center">
              <Link
                to="/news"
                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200"
              >
                View all news →
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
