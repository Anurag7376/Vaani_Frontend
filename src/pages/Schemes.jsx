import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { schemesApi } from '../api/axios';
import PageTransition from '../components/PageTransition';
import { SchemeCardSkeleton } from '../components/Skeleton';
import { safeStr, safeUrl } from '../utils/safeDisplay';
import { INCOME_RANGES, RESIDENCE_TYPES } from '../constants/states';

const SAVED_KEY = 'vaani_saved_schemes';

function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function toggleSaved(id) {
  const set = getSavedIds();
  if (set.has(id)) {
    set.delete(id);
  } else {
    set.add(id);
  }
  localStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
  return set;
}

function getSchemeDisplayCategory(scheme) {
  const c = scheme?.category ?? scheme?.scheme_category;
  return typeof c === 'object' && c !== null && 'name' in c ? (c.name ?? '') : (safeStr(c) || '');
}

function getSchemeDisplayIncome(scheme) {
  const i = scheme?.income_range ?? scheme?.income;
  return typeof i === 'object' && i !== null && 'name' in i ? (i.name ?? '') : (safeStr(i) || '');
}

function getSchemeDisplayResidence(scheme) {
  const r = scheme?.residence_type ?? scheme?.residence;
  return typeof r === 'object' && r !== null && 'name' in r ? (r.name ?? '') : (safeStr(r) || '');
}

function matchesIncome(scheme, selectedIncome) {
  if (!selectedIncome) return true;
  const schemeIncome = getSchemeDisplayIncome(scheme)?.trim() || '';
  return schemeIncome && schemeIncome.toLowerCase() === selectedIncome.toLowerCase();
}

function matchesResidence(scheme, selectedResidence) {
  if (!selectedResidence) return true;
  const schemeResidence = getSchemeDisplayResidence(scheme)?.trim() || '';
  return schemeResidence && schemeResidence.toLowerCase() === selectedResidence.toLowerCase();
}

function getSchemeId(scheme, index) {
  const id = scheme?.id ?? scheme?.scheme_id;
  if (typeof id === 'object' && id !== null && id !== undefined) {
    return id?.id ?? id?.name ?? index;
  }
  return id ?? safeStr(scheme?.title) ?? scheme?.name ?? scheme?.scheme_name ?? index;
}

export default function Schemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(getSavedIds);
  const [category, setCategory] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [residenceType, setResidenceType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    schemesApi
      .getSchemes()
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data?.results ?? [];
        setSchemes(list);
      })
      .catch(() => {
        toast.error('Failed to load schemes');
        setSchemes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    schemes.forEach((s) => {
      const val = getSchemeDisplayCategory(s);
      if (val) set.add(val);
    });
    return ['', ...Array.from(set).filter(Boolean).sort()];
  }, [schemes]);

  const filtered = useMemo(() => {
    return schemes.filter((s) => {
      if (category) {
        const schemeCategory = getSchemeDisplayCategory(s);
        if (schemeCategory && schemeCategory !== category) return false;
      }
      if (incomeRange && !matchesIncome(s, incomeRange)) return false;
      if (residenceType && !matchesResidence(s, residenceType)) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const title = (safeStr(s?.title) || safeStr(s?.name) || safeStr(s?.scheme_name) || '').toLowerCase();
        const desc = (safeStr(s?.description) || safeStr(s?.desc) || safeStr(s?.summary) || '').toLowerCase();
        if (!title.includes(q) && !desc.includes(q)) return false;
      }
      return true;
    });
  }, [schemes, category, incomeRange, residenceType, search]);

  const handleSave = (scheme, index) => {
    const id = getSchemeId(scheme, index);
    const next = toggleSaved(id);
    setSavedIds(new Set(next));
    toast.success(next.has(id) ? 'Saved' : 'Removed from saved');
  };

  return (
    <PageTransition className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Schemes</h1>

      <div className="mb-6 space-y-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search schemes..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="flex flex-wrap gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All categories</option>
            {categories.slice(1).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={incomeRange}
            onChange={(e) => setIncomeRange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Income range</option>
            {INCOME_RANGES.map((range) => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          <select
            value={residenceType}
            onChange={(e) => setResidenceType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Type of residence</option>
            {RESIDENCE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SchemeCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">No schemes match your filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((scheme, i) => {
            const id = getSchemeId(scheme, i);
            const isSaved = savedIds.has(id);
            const title = safeStr(scheme?.title) || safeStr(scheme?.name) || safeStr(scheme?.scheme_name) || 'Untitled';
            const description = safeStr(scheme?.description) || safeStr(scheme?.desc) || safeStr(scheme?.summary) || '—';
            const eligibility = safeStr(scheme?.eligibility) || safeStr(scheme?.eligibility_summary) || 'See link for details';
            const linkHref = safeUrl(scheme?.official_link) || safeUrl(scheme?.link) || safeUrl(scheme?.url) || '';
            return (
              <div
                key={id}
                className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:border-primary-500/50 transition-all duration-200"
              >
                <h2 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-3">
                  {description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                  Eligibility: {eligibility}
                </p>
                <div className="flex flex-wrap gap-2">
                  {linkHref ? (
                    <a
                      href={linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      Official link
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleSave(scheme, i)}
                    className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isSaved
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
