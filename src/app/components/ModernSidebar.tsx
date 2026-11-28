import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  CheckSquare,
  FolderKanban,
  Users,
  Calendar,
  BarChart2,
  Settings,
  MessageSquare,
  Zap,
  Clock,
  X,
  Code2,
  Sparkles,
  Terminal,
  BookOpen,
  MessageSquareCode,
  Layers,
  Film,
  Camera,
  Video,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme, type AccentThemeClasses } from '../../lib/useAccentTheme';
import GettingStartedWidget from './GettingStartedWidget';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ModernSidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const theme = useAccentTheme();
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const activeUserId = user?.id;
    if (!activeUserId) {
      setPendingTaskCount(0);
      return;
    }

    async function fetchTaskBadge() {
      try {
        const { count, error } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', activeUserId!)
          .neq('status', 'done');

        if (!error && count !== null) {
          setPendingTaskCount(count);
        }
      } catch (err) {
        console.error('Error fetching task count badge:', err);
      }
    }

    void fetchTaskBadge();

    const scheduleBadgeRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void fetchTaskBadge();
      }, 200);
    };

    const channel = supabase
      .channel(`sidebar_tasks_${activeUserId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${activeUserId}` },
        scheduleBadgeRefresh
      )
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 flex flex-col overflow-hidden shrink-0
    bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-xl
    border-r border-gray-200/80 dark:border-gray-800/90
    shadow-xl lg:shadow-none
    transition-all duration-300 ease-in-out lg:static lg:h-full
    ${
      isOpen
        ? 'w-64 translate-x-0 opacity-100'
        : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 opacity-0 pointer-events-none border-none'
    }
  `;

  return (
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${sidebarClasses}`}>
        {onClose && (
          <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200/80 px-4 dark:border-gray-800 lg:hidden">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Navigation
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className={`rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white ${theme.ringAccent}`}
            >
              <X size={18} />
            </button>
          </div>
        )}

        <nav
          aria-label="Main navigation"
          className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3.5 py-4"
        >
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Overview
          </div>
          <NavItem
            to="/dashboard"
            icon={<LayoutGrid size={17} />}
            label="Overview"
            isActive={location.pathname === '/dashboard'}
            theme={theme}
            onClick={handleNavClick}
          />
          <NavItem
            to="/analytics"
            icon={<BarChart2 size={17} />}
            label="Analytics"
            isActive={location.pathname === '/analytics'}
            theme={theme}
            onClick={handleNavClick}
          />

          {/* Mobile Actions: visible strictly on mobile drawers and hidden on desktop */}
          <div className="lg:hidden">
            <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Mobile Actions
            </div>
            <div className="space-y-0.5">
              <NavItem
                to="/triage"
                icon={<Layers size={17} />}
                label="Triage Deck"
                isActive={location.pathname === '/triage'}
                theme={theme}
                onClick={handleNavClick}
              />
              <NavItem
                to="/standup"
                icon={<Film size={17} />}
                label="Daily Standup"
                isActive={location.pathname === '/standup'}
                theme={theme}
                onClick={handleNavClick}
              />
              <NavItem
                to="/capture"
                icon={<Camera size={17} />}
                label="Quick Capture"
                isActive={location.pathname === '/capture'}
                theme={theme}
                onClick={handleNavClick}
              />
            </div>
          </div>

          <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Work
          </div>
          <div className="space-y-0.5">
            <NavItem
              to="/projects"
              icon={<FolderKanban size={17} />}
              label="Projects"
              isActive={location.pathname.startsWith('/projects')}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/meetings"
              icon={<Video size={17} />}
              label="Meetings"
              isActive={location.pathname === '/meetings'}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/tasks"
              icon={<CheckSquare size={17} />}
              label="My Tasks"
              badge={pendingTaskCount > 0 ? String(pendingTaskCount) : undefined}
              isActive={location.pathname === '/tasks'}
              theme={theme}
              onClick={handleNavClick}
            />

            {/* Desktop utilities */}
            <NavItem
              to="/sprint-planner"
              icon={<Sparkles size={17} />}
              label="Sprint Planner"
              isActive={location.pathname === '/sprint-planner'}
              theme={theme}
              onClick={handleNavClick}
              desktopOnly
            />
            <NavItem
              to="/code"
              icon={<Code2 size={17} />}
              label="Code Studio"
              isActive={location.pathname === '/code'}
              theme={theme}
              onClick={handleNavClick}
              desktopOnly
            />
            <NavItem
              to="/api-playground"
              icon={<Terminal size={17} />}
              label="API Console"
              isActive={location.pathname === '/api-playground'}
              theme={theme}
              onClick={handleNavClick}
              desktopOnly
            />
            <NavItem
              to="/docs"
              icon={<BookOpen size={17} />}
              label="API Docs"
              isActive={location.pathname === '/docs'}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/timesheets"
              icon={<Clock size={17} />}
              label="Timesheets"
              isActive={location.pathname === '/timesheets'}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/automations"
              icon={<Zap size={17} />}
              label="Automations"
              isActive={location.pathname === '/automations'}
              theme={theme}
              onClick={handleNavClick}
            />
          </div>

          <div className="mb-2 mt-5 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Team
          </div>
          <div className="space-y-0.5">
            <NavItem
              to="/messages/room_1"
              icon={<MessageSquare size={17} />}
              label="Team Chat"
              isActive={location.pathname.startsWith('/messages')}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/team"
              icon={<Users size={17} />}
              label="Team"
              isActive={location.pathname === '/team'}
              theme={theme}
              onClick={handleNavClick}
            />
            <NavItem
              to="/retrospectives"
              icon={<MessageSquareCode size={17} />}
              label="Retrospectives"
              isActive={location.pathname === '/retrospectives'}
              theme={theme}
              onClick={handleNavClick}
              desktopOnly
            />
            <NavItem
              to="/calendar"
              icon={<Calendar size={17} />}
              label="Calendar"
              isActive={location.pathname === '/calendar'}
              theme={theme}
              onClick={handleNavClick}
            />
          </div>
        </nav>

        {/* Sandbox widget only shown on desktop */}
        <div className="hidden px-3 pb-2.5 lg:block">
          <GettingStartedWidget />
        </div>

        <div className="border-t border-gray-200/80 bg-gray-50/50 p-3 dark:border-gray-800/80 dark:bg-[#0d1117]/40">
          <NavItem
            to="/settings"
            icon={<Settings size={17} />}
            label="Settings"
            isActive={location.pathname.startsWith('/settings')}
            theme={theme}
            onClick={handleNavClick}
          />
        </div>
      </aside>
    </>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive: boolean;
  badge?: string;
  theme: AccentThemeClasses;
  onClick?: () => void;
  desktopOnly?: boolean;
}

function NavItem({ icon, label, to, isActive, badge, theme, onClick, desktopOnly }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`app-nav-link group relative min-h-10 items-center rounded-xl px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 ${
        theme.ringAccent
      } focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900 ${
        desktopOnly ? 'hidden lg:flex' : 'flex'
      } ${
        isActive
          ? `${theme.bgSubtle} ${theme.textAccent} font-semibold shadow-2xs`
          : 'text-gray-600 hover:bg-gray-100/90 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/70 dark:hover:text-gray-100'
      }`}
    >
      {isActive && (
        <span
          aria-hidden="true"
          className={`absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full ${theme.toggleActive}`}
        />
      )}
      <span
        className={`mr-3 shrink-0 transition-colors ${
          isActive
            ? theme.textAccent
            : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
        }`}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {badge && (
        <span
          className={`ml-auto rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold leading-none ${
            isActive
              ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`
              : 'border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
