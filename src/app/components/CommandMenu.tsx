import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  LayoutGrid, FolderKanban, CheckSquare, Users, Calendar, 
  BarChart2, MessageSquare, Clock, Zap, Settings, Sun, Moon, 
  Plus, Search, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [projects, setProjects] = useState<{ id: string; name: string; status: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; role: string; avatar: string }[]>([]);

  // Toggle on Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    // Listen for custom trigger event
    const handleOpenTrigger = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpenTrigger);
    document.addEventListener('keydown', down);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleOpenTrigger);
    };
  }, []);

  // Fetch quick search data when opened
  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      const { data: projData } = await supabase.from('projects').select('id, name, status').limit(8);
      if (projData) setProjects(projData);

      const { data: userData } = await supabase.from('users').select('id, name, role, avatar').limit(8);
      if (userData) setUsers(userData);
    }

    fetchData();
  }, [open]);

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="text-gray-400 shrink-0" size={18} />
            <Command.Input 
              autoFocus 
              placeholder="Type a command or search (projects, people, pages)..."
              className="w-full py-4 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
            <Command.Empty className="py-8 text-center text-xs text-gray-400">
              No matching commands or results found.
            </Command.Empty>

            {/* Actions Group */}
            <Command.Group heading="Quick Actions" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/tasks'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                <Plus size={16} />
                <span>Create New Task</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
              {[
                { name: 'Dashboard Overview', path: '/dashboard', icon: <LayoutGrid size={16} /> },
                { name: 'Projects', path: '/projects', icon: <FolderKanban size={16} /> },
                { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={16} /> },
                { name: 'Team Chat', path: '/messages/room_1', icon: <MessageSquare size={16} /> },
                { name: 'Team Directory', path: '/team', icon: <Users size={16} /> },
                { name: 'Calendar & Schedule', path: '/calendar', icon: <Calendar size={16} /> },
                { name: 'Analytics Dashboard', path: '/analytics', icon: <BarChart2 size={16} /> },
                { name: 'Timesheets', path: '/timesheets', icon: <Clock size={16} /> },
                { name: 'Automations', path: '/automations', icon: <Zap size={16} /> },
                { name: 'Workspace Settings', path: '/settings', icon: <Settings size={16} /> },
              ].map(item => (
                <Command.Item
                  key={item.path}
                  onSelect={() => runCommand(() => navigate(item.path))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <ArrowRight size={12} className="opacity-40" />
                </Command.Item>
              ))}
            </Command.Group>

            {/* Projects Group */}
            {projects.length > 0 && (
              <Command.Group heading="Projects" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
                {projects.map(proj => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => runCommand(() => navigate(`/projects/${proj.id}`))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FolderKanban size={16} className="text-indigo-500 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {proj.status}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* People Group */}
            {users.length > 0 && (
              <Command.Group heading="Team Members" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
                {users.map(u => (
                  <Command.Item
                    key={u.id}
                    onSelect={() => runCommand(() => navigate(`/profile/${u.id}`))}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} 
                        alt="" 
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                      />
                      <span className="truncate">{u.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{u.role}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="p-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">Enter</kbd> to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

