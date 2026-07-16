export default function CategoryLoading() {
  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4 h-4 w-48 animate-pulse rounded-full bg-[var(--color-border)]" />

      <div className="mb-6">
        <div className="h-10 w-64 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)] md:h-12 md:w-80" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-full bg-[var(--color-border)]" />
        <div className="mt-2 h-4 w-24 animate-pulse rounded-full bg-[var(--color-border)]" />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-11 w-28 animate-pulse rounded-[var(--radius-full)] bg-[var(--color-border)]" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="aspect-[4/3] animate-pulse bg-[var(--color-background-alt)] sm:aspect-[4/5]" />
            <div className="flex flex-col gap-3 p-4 sm:p-[18px]">
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-[var(--color-border)]" />
              <div className="h-4 w-2/5 animate-pulse rounded-full bg-[var(--color-border)]" />
              <div className="h-6 w-1/2 animate-pulse rounded-full bg-[var(--color-border)]" />
              <div className="h-11 w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
