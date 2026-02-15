import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/axios';
import { safeStr } from '../utils/safeDisplay';

export default function Sidebar({ open, onClose }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      setProfile(null);
      return;
    }
    profileApi
      .get()
      .then((res) => setProfile(res.data || null))
      .catch(() => setProfile(null));
  }, [isAuthenticated]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:bg-transparent lg:static lg:flex-none"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed top-0 right-0 z-50 w-72 h-full bg-white dark:bg-surface-dark border-l border-slate-200 dark:border-slate-700 shadow-xl lg:static lg:shadow-none lg:border-l-0 lg:border-r animate-slide-up lg:animate-none">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Profile</h2>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isAuthenticated() && profile ? (
            <>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-900 dark:text-white">{safeStr(profile?.name) || '—'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Region</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{safeStr(profile?.region) || '—'}</p>
              </div>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
              >
                Edit profile
              </Link>
            </>
          ) : isAuthenticated() ? (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Complete your profile in Settings.</p>
              <Link
                to="/settings"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
              >
                Edit profile
              </Link>
            </>
          ) : (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Log in to see profile and eligibility.</p>
              <Link to="/login" className="mt-3 inline-block text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Login
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
