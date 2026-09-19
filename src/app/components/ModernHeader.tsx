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
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';

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

export function ModernHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [projects, setProjects] = useState<SearchProject[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status');

      if (!projectsError && projectsData) {
        setProjects(projectsData);
      }

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, avatar, role');

      if (!usersError && usersData) {
        setUsers(usersData);
      }
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
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchablePages: SearchPage[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid size={14} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={14} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={14} /> },
    { name: 'Team', path: '/team', icon: <Users size={14} /> },
    { name: 'Calendar', path: '/calendar', icon: <Sun size={14} /> },
    { name: 'Analytics', path: '/analytics', icon: <Sun size={14} /> },
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
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 text-gray-900 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center text-sm text-gray-500 dark:text-gray-400 md:flex">
          <span className="font-medium text-gray-900 dark:text-white">Workspace</span>
          <ChevronRight size={14} className="mx-2 opacity-50" />
          <Link
            to={location.pathname}
            className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {getPageTitle()}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
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
              onChange={(event) => {
                setQuery(event.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-60 rounded-xl border border-transparent bg-gray-100/80 py-2 pl-9 pr-14 text-xs text-gray-700 outline-none transition-all hover:border-indigo-500/30 focus:border-indigo-500 focus:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:bg-gray-900 lg:w-72"
            />
            {query && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setQuery('');
                  setShowResults(false);
                }}
                aria-label="Clear search"
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
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Pages
                      </h4>
                      {filteredPages.map((page) => (
                        <button
                          type="button"
                          key={page.path}
                          onClick={() => handleSearchResultClick(page.path)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                        >
                          <div className="rounded-md bg-gray-100 p-1.5 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            {page.icon}
                          </div>
                          {page.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Projects
                      </h4>
                      {filteredProjects.map((project) => (
                        <button
                          type="button"
                          key={project.id}
                          onClick={() => handleSearchResultClick(`/projects/${project.id}`)}
                          className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                              <FileText size={14} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {project.name}
                            </span>
                          </div>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-700">
                            {project.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredUsers.length > 0 && (
                    <div>
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Team
                      </h4>
                      {filteredUsers.map((searchUser) => (
                        <button
                          type="button"
                          key={searchUser.id}
                          onClick={() => handleSearchResultClick(`/profile/${searchUser.id}`)}
                          className="flex w-full items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          {searchUser.avatar && searchUser.avatar.startsWith('http') ? (
                            <img
                              src={searchUser.avatar}
                              className="h-7 w-7 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                              {searchUser.name ? searchUser.name.charAt(0) : 'U'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {searchUser.name}
                            </p>
                            <p className="text-xs text-gray-400">{searchUser.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle Theme"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link
          to="/notifications"
          aria-label="Notifications"
          title="Notifications"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900" />
        </Link>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
            className="flex items-center gap-3 rounded-xl border border-transparent p-1.5 transition-all hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none">{user?.name || 'Guest'}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Viewer'}</p>
            </div>
            {user?.avatar?.startsWith('http') ? (
              <img
                src={user.avatar}
                alt={user.name || 'User avatar'}
                className="h-9 w-9 rounded-lg object-cover bg-gray-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 p-4 dark:border-gray-700 md:hidden">
                <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
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