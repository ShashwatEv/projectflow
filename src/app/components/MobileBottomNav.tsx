import { useLocation, useNavigate } from 'react-router-dom';
import { CheckSquare, FolderKanban, Home, Inbox, Users } from 'lucide-react';
import { useAccentTheme } from '../../lib/useAccentTheme';

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: Home, matches: (path: string) => path === '/dashboard' },
  { label: 'Projects', path: '/mobile/projects', icon: FolderKanban, matches: (path: string) => path.startsWith('/mobile/projects') },
  { label: 'Inbox', path: '/mobile/inbox', icon: Inbox, matches: (path: string) => path.startsWith('/mobile/inbox') || path.startsWith('/notifications') || path.startsWith('/messages') },
  { label: 'People', path: '/mobile/people', icon: Users, matches: (path: string) => path.startsWith('/mobile/people') || path === '/team' },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare, matches: (path: string) => path === '/tasks' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const theme = useAccentTheme();

  if (['/triage', '/standup', '/capture'].includes(pathname)) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="z-30 grid shrink-0 grid-cols-5 border-t border-border bg-background/95 px-1 pt-1.5 text-muted-foreground shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map(({ label, path, icon: Icon, matches }) => {
        const active = matches(pathname);
        return (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(path)}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active ? `${theme.textAccent}` : 'hover:bg-muted'
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
