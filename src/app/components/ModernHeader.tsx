import { useState, useRef, useEffect } from 'react';
import { 
  Bell, Search, Menu, LogOut, User, Settings, Moon, Sun, 
  X, LayoutGrid, CheckSquare, FolderKanban, Users, Calendar, 
  BarChart2, FileText, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getUsers, getProjects } from '../../data/mockData'; // Add getProjects here

export function ModernHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- Profile Dropdown State ---
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Search State ---
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Mock Data for Search ---
  const searchablePages = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid size={14} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={14} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={14} /> },
    { name: 'Team', path: '/team', icon: <Users size={14} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={14} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={14} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={14} /> },
  ];

  const activeProjects = getProjects();
  
  // --- Search Logic ---
  const filteredPages = searchablePages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredProjects = activeProjects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
  const filteredUsers = getUsers().filter(u => u.name.toLowerCase().includes(query.toLowerCase()));

  const hasResults = filteredPages.length > 0 || filteredProjects.length > 0 || filteredUsers.length > 0;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  };

  // Helper to format breadcrumb text
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-30 relative transition-colors duration-200">
      
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
  onClick={onMenuClick} // <--- ADD THIS LINE
  className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
>
  <Menu size={20} />
</button>
        <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">Workspace</span>
          <ChevronRight size={14} className="mx-2 opacity-50" />
          <Link to={location.pathname} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {getPageTitle()}
          </Link>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* --- GLOBAL SEARCH BAR --- */}
        <div className="relative hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            <input 
              type="text" 
              placeholder="Search pages, projects, people..." 
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              className="pl-9 pr-8 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 rounded-lg text-sm w-64 lg:w-80 transition-all outline-none dark:text-white"
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && query && (
            <div className="absolute top-full left-0 mt-2 w-full lg:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {hasResults ? (
                <div className="max-h-[70vh] overflow-y-auto py-2">
                  
                  {/* Pages Section */}
                  {filteredPages.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Pages</h4>
                      {filteredPages.map((page) => (
                        <button key={page.path} onClick={() => handleSearchResultClick(page.path)} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-300">{page.icon}</div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{page.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Projects Section */}
                  {filteredProjects.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Projects</h4>
                      {filteredProjects.map((proj) => (
                        <button key={proj.name} onClick={() => handleSearchResultClick(proj.path)} className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md"><FileText size={14} /></div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{proj.name}</span>
                          </div>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">{proj.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* People Section */}
                  {filteredUsers.length > 0 && (
                    <div>
                      <h4 className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</h4>
                      {filteredUsers.map((u) => (
                        <button key={u.id} onClick={() => handleSearchResultClick(`/profile/${u.id}`)} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          {u.avatar.startsWith('http') ? (
                             <img src={u.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                          ) : (
                             <div className="w-7 h-7 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center text-xs font-bold">{u.avatar}</div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.role}</p>
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

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications - NOW WORKING LINK */}
        <Link 
          to="/notifications"
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </Link>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.role || 'Viewer'}</p>
            </div>
            {user?.avatar?.startsWith('http') ? (
               <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-lg object-cover bg-gray-200" />
            ) : (
               <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.avatar || 'G'}
               </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 md:hidden">
                    <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                    <button onClick={() => { navigate(`/profile/${user?.id}`); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <User size={16} /> My Profile
                    </button>
                    <button onClick={() => { navigate('/settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <Settings size={16} /> Settings
                    </button>
                </div>
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}