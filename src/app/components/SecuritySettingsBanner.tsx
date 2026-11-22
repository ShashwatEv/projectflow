const BASE = import.meta.env.BASE_URL || '/';

interface SecuritySettingsBannerProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function SecuritySettingsBanner({
  badge = 'Security & Identity',
  title = 'Account & Security Controls',
  subtitle = 'Manage your profile details, two-factor verification, and workspace access permissions.',
}: SecuritySettingsBannerProps) {
  return (
    <section
      aria-label={title}
      className="mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#4B74FF] via-indigo-500 to-violet-500" />
      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:justify-between sm:p-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <span className="inline-flex items-center rounded-full border border-indigo-200/70 bg-[#4B74FF]/10 px-3 py-0.5 text-xs font-semibold text-[#4B74FF] dark:border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-300">
            {badge}
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded-xl border border-indigo-100/80 bg-[#ECEEFF] dark:border-slate-700/80 sm:h-32 sm:w-52">
          <img
            src={`${BASE}illustrations/5.svg`}
            alt={title}
            className="h-full w-full object-contain p-2"
          />
        </div>
      </div>
    </section>
  );
}

export default SecuritySettingsBanner;