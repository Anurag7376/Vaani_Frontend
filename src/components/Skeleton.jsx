export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`}
      aria-hidden
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-surface-dark">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-surface-dark">
      <Skeleton className="h-5 w-full mb-3" />
      <Skeleton className="h-4 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}

export function SchemeCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-surface-dark">
      <Skeleton className="h-6 w-4/5 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}
