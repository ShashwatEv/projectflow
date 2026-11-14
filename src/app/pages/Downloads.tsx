import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ExternalLink,
  Monitor,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ANDROID_APK_URL =
  'https://github.com/ShashwatEv/projectflow/releases/download/Projectflow/ProjectFlow.apk';
const ANDROID_RELEASE_URL = 'https://github.com/ShashwatEv/projectflow/releases/tag/Projectflow';
const ALL_RELEASES_URL = 'https://github.com/ShashwatEv/projectflow/releases';

export default function Downloads() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/login" aria-label="ProjectFlow sign in" className="flex items-center gap-2.5">
          <img src="/favicon.ico" alt="" className="h-9 w-9 rounded-xl border border-border bg-card p-1" />
          <span className="text-base font-bold tracking-tight">ProjectFlow</span>
        </Link>
        <Link
          to="/login"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Sign in
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-32 -z-10 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-48 left-1/3 -z-10 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"
          />
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100">
              <ArrowDownToLine size={14} aria-hidden="true" />
              ProjectFlow apps
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Your workspace, wherever work happens.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Choose the ProjectFlow app for your device. Sign in with your existing account and pick
              up your projects with the same workspace permissions.
            </p>
            <a
              href="#downloads"
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Choose your platform
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-slate-300 sm:text-sm">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-300" aria-hidden="true" />
              Your existing account and access controls
            </span>
            <span className="inline-flex items-center gap-2">
              <Check size={15} className="text-emerald-300" aria-hidden="true" />
              One connected project workspace
            </span>
          </div>
        </section>

        <section id="downloads" className="scroll-mt-6 pt-10 sm:pt-14" aria-labelledby="downloads-heading">
          <div className="mb-6 flex flex-col gap-2 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
              Find your app
            </p>
            <h2 id="downloads-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Choose a platform
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Start with Android today. The desktop app is being prepared for its first public release.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            <article className="flex flex-col rounded-3xl border border-indigo-200 bg-card p-5 shadow-sm dark:border-indigo-900/70 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <Smartphone size={23} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Android</h3>
                    <p className="text-sm text-muted-foreground">Standalone APK</p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Available
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                Get the native Android experience with offline support and haptics.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-card-foreground sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  Direct APK download
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  ProjectFlow account sign-in
                </li>
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={ANDROID_APK_URL}
                  download="ProjectFlow.apk"
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                >
                  <ArrowDownToLine size={16} aria-hidden="true" />
                  Download Android APK
                </a>
                <a
                  href={ANDROID_RELEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Release notes
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Android may ask you to allow installation from your browser. Only continue if you trust
                the source.
              </p>
            </article>

            <article className="flex flex-col rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                    <Monitor size={23} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Desktop</h3>
                    <p className="text-sm text-muted-foreground">Windows installer</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  Coming soon
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                A dedicated desktop experience with native screen sharing for project meetings and the
                full ProjectFlow workspace.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-card-foreground sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                  Native display picker
                </li>
                <li className="flex items-center gap-2">
                  <Check size={15} className="shrink-0 text-violet-600 dark:text-violet-400" aria-hidden="true" />
                  Existing account and projects
                </li>
              </ul>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted px-4 text-sm font-semibold text-muted-foreground"
                >
                  <Monitor size={16} aria-hidden="true" />
                  Windows installer coming soon
                </button>
                <a
                  href={ALL_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Browse releases
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                The Windows installer will be linked here once a configured desktop build is published.
              </p>
            </article>
          </div>

          <p className="mt-6 flex items-start gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Your account and project membership continue to control what you can access on every platform.
          </p>
        </section>
      </div>
    </main>
  );
}
