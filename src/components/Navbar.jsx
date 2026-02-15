import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chat', label: 'Chat' },
  { to: '/schemes', label: 'Schemes' },
  { to: '/news', label: 'News' },
  { to: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHome = location.pathname === '/';

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-surface-dark/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            {!isHome && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors"
            >
              Vaani
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {NAV_LINKS.filter((l) => l.to !== '/chat').map(({ to, label }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              to="/chat"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive('/chat')
                  ? 'text-white bg-primary-700 hover:bg-primary-800'
                  : 'text-white bg-primary-600 hover:bg-primary-700'
              }`}
            >
              Chat
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated() ? (
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => {
                const active = isActive(to);
                const isChat = to === '/chat';
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isChat
                        ? active
                          ? 'bg-primary-700 text-white hover:bg-primary-800'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                        : active
                          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              {isAuthenticated() ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      {sidebarOpen && (
        <div className="fixed top-[4.5rem] left-0 z-40 w-72 h-[calc(100vh-4.5rem)] lg:hidden">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </div>
      )}
    </nav>
  );
}

function SidebarContent({ onClose }) {
  return (
    <aside className="h-full bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 p-4 animate-slide-up">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Profile & eligibility in Dashboard when logged in.</p>
      <Link
        to="/dashboard"
        onClick={onClose}
        className="block w-full text-center py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg font-medium"
      >
        Go to Dashboard
      </Link>
    </aside>
  );
}
