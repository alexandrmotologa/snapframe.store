import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-2xl -z-10" />
        <span className="text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          404
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
        The page you are looking for doesn&apos;t exist, may have been moved, or the link might be broken.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="default" className="gap-2 shadow-lg shadow-indigo-500/20">
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Button>
        </Link>
        <Link href="/projects">
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>My Projects</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
