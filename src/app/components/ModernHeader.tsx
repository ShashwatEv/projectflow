import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckSquare,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Users,
  X,
  Code2,
  Sparkles,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useOnboardingSandbox } from '../../context/OnboardingSandboxContext';
import { supabase } from '../../lib/supabaseClient';
import HeaderTaskTimer from './HeaderTaskTimer';

interface SearchProject {
  id: string;
  name: string;
  status: string;
}

interface SearchUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface SearchPage {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface ModernHeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ModernHeader({ onMenuClick, isSidebarOpen = true, onToggleSidebar }: ModernHeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { startTour } = useOnboardingSandbox();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [projects, setProjects] = useState<SearchProject[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);

  const [currentAvatar, setCurrentAvatar] = useState<string>(user?.avatar || '/pfp.jpg');
  const [currentName, setCurrentName] = useState<string>(user?.name || 'Guest');
  const [currentRole, setCurrentRole] = useState<string>(user?.role || 'Viewer');

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
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
        // Table may not exist in minimal installations
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
    const fetchData = async () => {
      const { data: projectsData } = await supabase.from('projects').select('id, name, status');
      if (projectsData) setProjects(projectsData);

      const { data: usersData } = await supabase.from('users').select('id, name, avatar, role');
      if (usersData) setUsers(usersData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchablePages: SearchPage[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid size={14} /> },
    { name: 'Code Studio', path: '/code', icon: <Code2 size={14} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={14} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={14} /> },
    { name: 'Team', path: '/team', icon: <Users size={14} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={14} /> },
  ];

  const filteredPages = searchablePages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredUsers = users.filter((searchUser) =>
    searchUser.name?.toLowerCase().includes(query.toLowerCase()),
  );
  const hasResults =
    filteredPages.length > 0 || filteredProjects.length > 0 || filteredUsers.length > 0;

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    if (path === 'code') return 'Code Studio';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 text-gray-900 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      {/* Left Area: Mobile Menu + Workspace Toggle */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

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

      {/* Centered Brand Block */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center pointer-events-none select-none">
        <div className="w-7 h-7 rounded-lg bg-white p-0.5 shadow-sm border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mr-2.5 shrink-0 overflow-hidden">
          <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
          ProjectFlow
        </span>
      </div>

      {/* Right Area: Search, Timer, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <div
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="group relative flex cursor-pointer items-center"
            title="Press Ctrl+K to search"
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-2.5 text-gray-400 transition-colors group-hover:text-indigo-500"
              size={15}
            />
            <input
              type="text"
              placeholder="Search or jump to... (Ctrl + K)"
              value={query}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-60 rounded-xl border border-transparent bg-gray-100/80 py-2 pl-9 pr-14 text-xs text-gray-700 outline-none transition-all hover:border-indigo-500/30 focus:border-indigo-500 focus:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:bg-gray-900 lg:w-72"
            />
            {query && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuery('');
                  setShowResults(false);
                }}
                className="absolute right-2.5 top-2.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
            <div className="pointer-events-none absolute right-2.5 top-2 flex items-center gap-0.5">
              <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-400 shadow-2xs dark:border-gray-600 dark:bg-gray-700">
                Ctrl K
              </span>
            </div>
          </div>

          {showResults && query && (
            <div className="absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:w-96">
              {hasResults ? (
                <div className="max-h-[70vh] overflow-y-auto py-2">
                  {filteredPages.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Pages</h4>
                      {filteredPages.map((page) => (
                        <button
                          type="button"
                          key={page.path}
                          onClick={() => handleSearchResultClick(page.path)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                        >
                          <div className="rounded-md bg-gray-100 p-1.5 text-gray-500 dark:bg-gray-700 dark:text-gray-300">{page.icon}</div>
                          {page.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Projects</h4>
                      {filteredProjects.map((project) => (
                        <button
                          type="button"
                          key={project.id}
                          onClick={() => handleSearchResultClick(`/projects/${project.id}`)}
                          className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{project.name}</span>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-700">{project.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">No results for "{query}"</div>
              )}
            </div>
          )}
        </div>

        {/* Task Timer */}
        <HeaderTaskTimer />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Interactive Notification Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full border-2 border-white bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center dark:border-gray-900 shadow-xs animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-800 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700/60 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto py-2 divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">
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
                      className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/40 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-500">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="block text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 py-1"
                >
                  Open Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-gray-700" />

        {/* User Profile Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            className="flex items-center gap-3 rounded-xl border border-transparent p-1.5 transition-all hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none">{currentName}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{currentRole}</p>
            </div>

            <img
              src={currentAvatar}
              onError={(e) => { e.currentTarget.src = '/pfp.jpg'; }}
              alt={currentName}
              className="h-9 w-9 rounded-lg object-cover bg-gray-800 border border-gray-700/60"
            />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 p-4 dark:border-gray-700 md:hidden">
                <p className="font-bold text-gray-900 dark:text-white">{currentName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/profile/${user?.id}`);
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                {/* Re-trigger Guided Tour from Header */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    startTour();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  <Sparkles size={16} />
                  Restart Onboarding Tour
                </button>
              </div>

              <div className="border-t border-gray-100 p-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}