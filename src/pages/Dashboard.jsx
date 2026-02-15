import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { schemesApi, newsApi, profileApi } from '../api/axios';
import PageTransition from '../components/PageTransition';
import { CardSkeleton } from '../components/Skeleton';
import { safeStr } from '../utils/safeDisplay';

const PROFILE_FIELDS = ['name', 'region', 'residence_type', 'income_range', 'occupation', 'category', 'age'];

function isProfileComplete(profile) {
  if (!profile || typeof profile !== 'object') return false;
  return PROFILE_FIELDS.some((key) => {
    const v = profile[key];
    const str = typeof v === 'object' && v !== null && 'name' in v ? v.name : v;
    return str != null && String(str).trim() !== '';
  });
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [schemesCount, setSchemesCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [schemesRes, newsRes] = await Promise.all([
          schemesApi.getSchemes().catch(() => ({ data: [] })),
          newsApi.getGovernmentNews().catch(() => ({ data: [] })),
        ]);
        if (!cancelled) {
          const schemes = Array.isArray(schemesRes.data) ? schemesRes.data : schemesRes.data?.results || [];
          setSchemesCount(schemes.length);
          const news = Array.isArray(newsRes.data) ? newsRes.data : newsRes.data?.results || newsRes.data?.articles || [];
          setNewsCount(Array.isArray(news) ? news.length : 0);
        }
        if (isAuthenticated() && !cancelled) {
          try {
            const saved = JSON.parse(localStorage.getItem('vaani_saved_schemes') || '[]');
            setSavedCount(saved.length);
            const profileRes = await profileApi.get();
            setProfile(profileRes.data || null);
          } catch {
            setProfile(null);
          }
        }
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const profileIncomplete = isAuthenticated() && profile && !isProfileComplete(profile);

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {isAuthenticated() ? 'Welcome back' : 'Dashboard'}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {isAuthenticated()
          ? 'Here’s a quick overview.'
          : 'Log in to store your eligibility and get personalized recommendations.'}
      </p>

      {profileIncomplete && (
        <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Complete your profile for better recommendations.
          </p>
          <Link
            to="/settings"
            className="mt-2 inline-block text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
          >
            Edit profile →
          </Link>
        </div>
      )}

      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Summary</h2>
            {isAuthenticated() && profile ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-900 dark:text-white mb-3">
                  {safeStr(profile?.name) || '—'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Region</p>
                <p className="font-medium text-slate-900 dark:text-white mb-4">
                  {safeStr(profile?.region) || '—'}
                </p>
                <Link
                  to="/settings"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                >
                  Edit Profile
                </Link>
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 mb-4">Log in to see your profile.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm text-slate-500 dark:text-slate-400">Eligible schemes</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{schemesCount}</p>
              <Link to="/schemes" className="mt-2 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View all →
              </Link>
            </div>
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm text-slate-500 dark:text-slate-400">Saved schemes</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{savedCount}</p>
              <Link to="/schemes" className="mt-2 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                View saved →
              </Link>
            </div>
            <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest news</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{newsCount}</p>
              <Link to="/news" className="mt-2 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Read news →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Open Chat
        </Link>
        <Link
          to="/schemes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
        >
          Browse Schemes
        </Link>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
        >
          Latest News
        </Link>
      </div>
    </PageTransition>
  );
}
