export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border/50 bg-card/60 h-16 w-full animate-pulse" />
      <div className="max-w-6xl mx-auto w-full px-6 py-8 sm:py-12 space-y-8 flex-1">
        {/* Profile Card Skeleton */}
        <div className="rounded-3xl border border-border/60 bg-card/50 p-6 sm:p-8 space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/60" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted/60 rounded-md" />
              <div className="h-4 w-56 bg-muted/30 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/40">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-muted/40 rounded" />
                <div className="h-5 w-24 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Tab & Content Skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-80 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-64 rounded-2xl border border-border/50 bg-card/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
