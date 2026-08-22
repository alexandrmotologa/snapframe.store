export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border/50 bg-card/60 h-16 w-full animate-pulse" />
      <div className="max-w-7xl mx-auto w-full px-6 py-8 space-y-8 flex-1">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted/60 rounded-xl animate-pulse" />
            <div className="h-4 w-72 bg-muted/30 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-muted/50 rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/50 bg-card/50 p-4 space-y-4 animate-pulse"
            >
              <div className="w-full h-44 bg-muted/40 rounded-xl" />
              <div className="h-5 w-2/3 bg-muted/60 rounded-md" />
              <div className="h-3 w-1/3 bg-muted/30 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
