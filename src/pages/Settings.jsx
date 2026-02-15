import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { profileApi } from '../api/axios';
import PageTransition from '../components/PageTransition';
import { INDIAN_STATES, RESIDENCE_TYPES, INCOME_RANGES, CATEGORIES } from '../constants/states';
import { safeStr } from '../utils/safeDisplay';

const TABS = [
  { id: 'profile', label: 'Profile Information' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'account', label: 'Account' },
];

const INITIAL_PROFILE = {
  name: '',
  region: '',
  residence_type: '',
  income_range: '',
  occupation: '',
  category: '',
  age: '',
};

export default function Settings() {
  const { isAuthenticated, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    profileApi
      .get()
      .then((res) => {
        const data = res.data || {};
        setProfile({
          name: safeStr(data?.name) ?? '',
          region: safeStr(data?.region) ?? '',
          residence_type: safeStr(data?.residence_type) ?? '',
          income_range: safeStr(data?.income_range) ?? '',
          occupation: safeStr(data?.occupation) ?? '',
          category: safeStr(data?.category) ?? '',
          age: safeStr(data?.age) ?? (data?.age != null ? String(data.age) : ''),
        });
      })
      .catch(() => setProfile(INITIAL_PROFILE))
      .finally(() => setProfileLoading(false));
  }, [isAuthenticated, navigate]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await profileApi.put(profile);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) return;
    toast.error('Delete account is not implemented. Contact support.');
  };

  if (!isAuthenticated()) return null;

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Profile Information</h2>
          {profileLoading ? (
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Region (State)
                </label>
                <select
                  id="region"
                  name="region"
                  value={profile.region}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="residence_type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Residence Type
                </label>
                <select
                  id="residence_type"
                  name="residence_type"
                  value={profile.residence_type}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {RESIDENCE_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="income_range" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Income Range
                </label>
                <select
                  id="income_range"
                  name="income_range"
                  value={profile.income_range}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {INCOME_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Occupation
                </label>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  value={profile.occupation}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={profile.category}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={profile.age}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors duration-200"
              >
                {profileSaving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preferences</h2>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-700 dark:text-slate-300">Dark mode</span>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  darkMode ? 'translate-x-5' : 'translate-x-0.5'
                }`}
                style={{ marginTop: 2 }}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-700 dark:text-slate-300">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-700 dark:text-slate-300">Notifications</span>
            <button
              type="button"
              role="switch"
              aria-checked={notifications}
              onClick={() => setNotifications((n) => !n)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                notifications ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  notifications ? 'translate-x-5' : 'translate-x-0.5'
                }`}
                style={{ marginTop: 2 }}
              />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Account</h2>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="ml-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg transition-colors duration-200"
          >
            Delete Account
          </button>
        </div>
      )}
    </PageTransition>
  );
}
