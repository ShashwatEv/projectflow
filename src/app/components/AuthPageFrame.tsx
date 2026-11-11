import type { ReactNode } from 'react';

interface AuthPageFrameProps {
  children: ReactNode;
  className?: string;
}

export default function AuthPageFrame({ children, className = '' }: AuthPageFrameProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/50 to-white px-4 py-8 transition-colors dark:from-[#090d17] dark:via-[#111827] dark:to-[#0d1117] sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div
        className={`auth-card relative w-full max-w-md space-y-6 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/[0.03] backdrop-blur-xl dark:border-gray-700/80 dark:bg-[#161b22]/95 dark:shadow-black/40 dark:ring-white/[0.04] sm:p-8 ${className}`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent"
        />
        {children}
      </div>
    </main>
  );
}
