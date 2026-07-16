export default function ProductLoading() {
  return (
    <div className="pb-24 md:pb-8">
      <div className="container-omega py-5">
        <div className="h-4 w-64 animate-pulse rounded-full bg-[var(--color-border)]" />
      </div>

      <div className="container-omega grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        <div className="aspect-square animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-background-alt)]" />

        <div className="flex flex-col gap-5">
          <div className="h-4 w-20 animate-pulse rounded-full bg-[var(--color-border)]" />
          <div className="h-9 w-4/5 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="h-5 w-32 animate-pulse rounded-full bg-[var(--color-border)]" />
          <div className="h-11 w-56 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-11 w-16 animate-pulse rounded-[var(--radius-full)] bg-[var(--color-border)]" />
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-14 flex-1 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
            <div className="h-14 flex-1 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-border)]" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-background-alt)]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
