import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Download,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { supabase } from '../../lib/supabaseClient';
import AvatarWithFrame, {
  AVATAR_FRAMES,
  type AvatarFrameId,
} from './AvatarWithFrame';
import HeaderTaskTimer from './HeaderTaskTimer';
import TeamSwitcher from './TeamSwitcher';

interface ModernHeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
}

interface RoomUnreadRow {
  unread_count?: number | string | null;
}

const FRAME_STORAGE_KEY = 'pf_user_avatar_frame';

function normalizeFrameId(value: unknown): AvatarFrameId | null {
  if (typeof value !== 'string') return null;
  return AVATAR_FRAMES.some((item) => item.id === value) ? (value as AvatarFrameId) : null;
}

function readSavedFrame(): AvatarFrameId {
  if (typeof window === 'undefined') return 'blue-sparkles';
  return normalizeFrameId(localStorage.getItem(FRAME_STORAGE_KEY)) ?? 'blue-sparkles';
}

export function ModernHeader({ onMenuClick, isSidebarOpen = true, onToggleSidebar }: ModernHeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const accentTheme = useAccentTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [currentAvatar, setCurrentAvatar] = useState<string>(user?.avatar || '/pfp.jpg');
  const [currentFrame, setCurrentFrame] = useState<AvatarFrameId>(() => readSavedFrame());
  const [currentName, setCurrentName] = useState<string>(user?.name || 'Guest');
  const [currentRole, setCurrentRole] = useState<string>(user?.role || 'Viewer');

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<HeaderNotification[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const accentHoverClasses =
    'hover:border-[var(--app-accent)]/40 hover:bg-[var(--app-accent-light)] hover:text-[var(--app-accent)]';
  const accentTextHoverClasses = 'hover:text-[var(--app-accent)]';

  useEffect(() => {
    if (user) {
      setCurrentAvatar(user.avatar || '/pfp.jpg');
      setCurrentName(user.name || 'Guest');
      setCurrentRole(user.role || 'Viewer');
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setRecentNotifs([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const [{ data }, { count: notifCount }, { data: roomUnreads }] = await Promise.all([
          supabase
            .from('notifications')
            .select('id, title, message, type, is_read, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false),
          supabase.rpc('workspace_unread_counts'),
        ]);

        if (data) {
          setRecentNotifs(data as HeaderNotification[]);
        }

        const unreadNotifications = typeof notifCount === 'number' ? notifCount : 0;
        const unreadMessages = Array.isArray(roomUnreads)
          ? (roomUnreads as RoomUnreadRow[]).reduce(
            (sum, row) => sum + (Number(row.unread_count) || 0),
            0
          )
          : 0;

        setUnreadCount(unreadNotifications + unreadMessages);
      } catch {
        // notification / unread RPC fallback
      }
    };

    void fetchNotifications();

    const channel = supabase
      .channel(`header_notifs_count_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => {
          void fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          void fetchNotifications();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workspace_channel_reads', filter: `user_id=eq.${user.id}` },
        () => {
          void fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    const syncProfile = async () => {
      const localFrame = readSavedFrame();
      setCurrentFrame(localFrame);
      const cachedAvatar = localStorage.getItem('pf_user_avatar');
      if (cachedAvatar) {
        setCurrentAvatar(cachedAvatar);
      }

      if (!user?.id) return;
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const userRow = data as Record<string, unknown>;
        setCurrentAvatar((userRow.avatar as string) || '/pfp.jpg');
        setCurrentName((userRow.name as string) || 'Guest');
        setCurrentRole((userRow.role as string) || 'Viewer');
        const dbFrame = normalizeFrameId(userRow.avatar_frame);
        if (dbFrame) {
          setCurrentFrame(dbFrame);
          localStorage.setItem(FRAME_STORAGE_KEY, dbFrame);
        }
      }
    };

    const handleFrameUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<AvatarFrameId>;
      const nextFrame = normalizeFrameId(customEvent.detail) ?? readSavedFrame();
      setCurrentFrame(nextFrame);
    };

    void syncProfile();
    window.addEventListener('storage', syncProfile);
    window.addEventListener('user-profile-updated', syncProfile);
    window.addEventListener('avatar-frame-updated', handleFrameUpdated);
    return () => {
      window.removeEventListener('storage', syncProfile);
      window.removeEventListener('user-profile-updated', syncProfile);
      window.removeEventListener('avatar-frame-updated', handleFrameUpdated);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    if (path === 'code') return 'Code Studio';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="app-header relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 text-gray-900 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      {/* Left Block: Hamburger button, breadcrumb, team switcher, clickable mobile logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={`rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent} dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden`}
        >
          <Menu size={20} />
        </button>

        {/* Clickable Mobile Brand Logo */}
        <Link
          to="/about"
          aria-label="About ProjectFlow"
          className="flex items-center select-none md:hidden hover:opacity-85 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            ProjectFlow
          </span>
        </Link>

        {/* Desktop breadcrumb trail */}
        <div className="hidden items-center text-sm md:flex">
          <button
            type="button"
            onClick={onToggleSidebar}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={`flex items-center gap-1 text-gray-900 dark:text-white font-bold tracking-tight ${accentTextHoverClasses} transition-colors select-none cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent}`}
          >
            Workspace
          </button>
          <ChevronRight size={14} className="mx-2 opacity-50 text-gray-400" />
          <Link
            to={location.pathname}
            className={`transition-colors ${accentTextHoverClasses} font-medium text-xs text-gray-500 dark:text-gray-400`}
          >
            {getPageTitle()}
          </Link>
        </div>

        <TeamSwitcher compact className="hidden xl:inline-block" />
      </div>

      {/* Clickable Desktop Centered Brand Logo */}
      <Link
        to="/about"
        aria-label="About ProjectFlow"
        className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center select-none hover:opacity-85 transition-opacity cursor-pointer"
      >
        <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mr-2.5 shrink-0 overflow-hidden">
          <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          ProjectFlow
        </span>
      </Link>

      {/* Right Area: Search, Downloads, Timer, Theme toggle, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <TeamSwitcher compact className="xl:hidden" />

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          aria-label="Open search"
          className={`rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent} dark:text-gray-400 dark:hover:bg-gray-800 sm:hidden`}
        >
          <Search size={18} />
        </button>

        {/* Search opens in the command palette so it never pushes into the brand. */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          aria-label="Search projects, people, and pages"
          title="Search projects, people, and pages (Ctrl+K)"
          className={`hidden h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-colors ${accentHoverClasses} focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent} dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:inline-flex`}
        >
          <Search size={17} />
        </button>

        <Link
          to="/downloads"
          aria-label="Download ProjectFlow apps"
          className={`hidden h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50  text-gray-500 transition-colors ${accentHoverClasses} focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent} dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 sm:inline-flex`}
          title="Download ProjectFlow apps"
        >
          <Download size={17} aria-hidden="true" />
        </Link>

        {/* Task Timer: hidden on mobile to avoid overcrowding */}
        <div className="hidden sm:block">
          <HeaderTaskTimer />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${accentHoverClasses} focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent}`}
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={isNotifOpen}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ${accentHoverClasses} focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent}`}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                data-testid="header-unread-badge"
                className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-white ${accentTheme.toggleActive} text-[10px] font-bold text-white flex items-center justify-center dark:border-gray-900 shadow-sm`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-800 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-gray-700/60 px-1">
                <span className="font-bold text-xs text-gray-900 dark:text-white">Notifications</span>
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className={`text-xs ${accentTheme.textAccent} hover:underline font-medium`}
                >
                  View All
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto py-2 divide-y divide-gray-100 dark:divide-gray-700/50 custom-scrollbar">
                {recentNotifs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    No new notifications right now.
                  </div>
                ) : (
                  recentNotifs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/notifications');
                      }}
                      className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mx-0.5 h-6 w-px bg-gray-200 dark:bg-gray-800" />

        {/* User Profile Avatar (Square Frame in Top Nav) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            aria-label="Open account menu"
            aria-expanded={isProfileOpen}
            className={`flex items-center gap-2 rounded-xl p-1 transition-all hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 ${accentTheme.ringAccent} dark:hover:bg-gray-800`}
          >
            <div className="hidden text-right md:block">
              <p className="text-xs font-bold leading-none text-gray-900 dark:text-white">{currentName}</p>
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{currentRole}</p>
            </div>

            <AvatarWithFrame
              src={currentAvatar}
              alt={currentName}
              shape="square"
              frame={currentFrame}
              size={32}
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-gray-100 p-3 dark:border-gray-700 md:hidden">
                <p className="font-bold text-xs text-gray-900 dark:text-white">{currentName}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="space-y-1 p-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/profile/${user?.id}`);
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <User size={15} />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
                
              </div>

              <div className="border-t border-gray-100 p-1.5 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}