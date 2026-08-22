import { Loader2 } from "lucide-react";

export default function EditorLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top toolbar skeleton */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 px-4 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800" />
          <div className="w-32 h-4 rounded bg-slate-800" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 rounded-lg bg-slate-800" />
          <div className="w-24 h-8 rounded-lg bg-slate-800" />
        </div>
      </div>

      {/* Main editor area skeleton */}
      <div className="flex-1 flex">
        {/* Left tool panel */}
        <div className="w-16 border-r border-slate-800 bg-slate-900/60 p-2 space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-10 h-10 rounded-xl bg-slate-800 mx-auto" />
          ))}
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-slate-950">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">
            Opening Canvas Editor...
          </p>
        </div>

        {/* Right properties panel */}
        <div className="w-72 border-l border-slate-800 bg-slate-900/60 p-4 space-y-4 animate-pulse">
          <div className="w-32 h-4 rounded bg-slate-800" />
          <div className="w-full h-24 rounded-xl bg-slate-800/60" />
          <div className="w-full h-36 rounded-xl bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
