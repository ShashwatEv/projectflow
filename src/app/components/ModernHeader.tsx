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
  Smartphone,
  Download,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import HeaderTaskTimer from './HeaderTaskTimer';

interface ModernHeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ANDROID_APK_URL =
  'https://github.com/ShashwatEv/projectflow/releases/download/Projectflow/ProjectFlow.apk';

export function ModernHeader({ onMenuClick, isSidebarOpen = true, onToggleSidebar }: ModernHeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [currentAvatar, setCurrentAvatar] = useState<string>(user?.avatar || '/pfp.jpg');
  const [currentName, setCurrentName] = useState<string>(user?.name || 'Guest');
  const [currentRole, setCurrentRole] = useState<string>(user?.role || 'Viewer');

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setCurrentAvatar(user.avatar || '/pfp.jpg');
      setCurrentName(user.name || 'Guest');
      setCurrentRole(user.role || 'Viewer');
    }
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { count, data } = await supabase
          .from('notifications')
          .select('id, title, message, type, is_read, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (data) {
          setRecentNotifs(data);
          const unread = data.filter((n) => !n.is_read).length;
          setUnreadCount(count ?? unread);
        }
      } catch {
        // notification table fallback
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('header_notifs_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const syncProfile = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('users')
        .select('name, avatar, role')
        .eq('id', user.id)
        .single();

      if (data) {
        setCurrentAvatar(data.avatar || '/pfp.jpg');
        setCurrentName(data.name || 'Guest');
        setCurrentRole(data.role || 'Viewer');
      }
    };

    window.addEventListener('user-profile-updated', syncProfile);
    return () => window.removeEventListener('user-profile-updated', syncProfile);
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
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 text-gray-900 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      {/* Left Block: Hamburger button, breadcrumb, clickable mobile logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
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
            className="flex items-center gap-1 text-gray-900 dark:text-white font-bold tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none cursor-pointer"
          >
            Workspace
          </button>
          <ChevronRight size={14} className="mx-2 opacity-50 text-gray-400" />
          <Link
            to={location.pathname}
            className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs text-gray-500 dark:text-gray-400"
          >
            {getPageTitle()}
          </Link>
        </div>
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

      {/* Right Area: Search, APK Download, Timer, Theme toggle, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          aria-label="Open search"
          className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 sm:hidden"
        >
          <Search size={18} />
        </button>

        {/* Search opens in the command palette so it never pushes into the brand. */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
          aria-label="Search projects, people, and pages"
          title="Search projects, people, and pages (Ctrl+K)"
          className="hidden h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 sm:inline-flex"
        >
          <Search size={17} />
        </button>

        {/* Desktop-only Android APK Download button */}
        <a
          href={ANDROID_APK_URL}
          download="ProjectFlow.apk"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-xs font-semibold shadow-xs transition-all"
          title="Download standalone Android APK"
        >
          <Smartphone size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>Android App</span>
          <Download size={13} className="opacity-70" />
        </a>

        {/* Task Timer: hidden on mobile to avoid overcrowding */}
        <div className="hidden sm:block">
          <HeaderTaskTimer />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Toggle color theme"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full border border-white bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center dark:border-gray-900 shadow-xs animate-pulse">
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
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="max-h-64 overflow-y-auto py-2 divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentNotifs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-400">
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
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
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

        {/* User Profile Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex items-center gap-2 rounded-xl p-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="hidden text-right md:block">
              <p className="text-xs font-bold leading-none">{currentName}</p>
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">{currentRole}</p>
            </div>

            <img
              src={currentAvatar}
              onError={(e) => { e.currentTarget.src = '/pfp.jpg'; }}
              alt={currentName}
              className="h-8 w-8 rounded-lg object-cover bg-gray-800 border border-gray-700/60"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
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