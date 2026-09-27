import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="relative w-40 h-24">
          <Image
            src="/brand/project_buillders_logo.PNG"
            alt="Project Builders"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary tracking-tight">
            Project Builders
          </h1>
          <p className="text-sm font-sans text-muted-foreground uppercase tracking-wider font-medium">
            Build Real Experience
          </p>
        </div>
        <div className="w-full pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-secondary px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Phase 0 Initialized
          </span>
          <span className="font-mono">Next.js 15 • Tailwind v4</span>
        </div>
      </div>
    </main>
  );
}
