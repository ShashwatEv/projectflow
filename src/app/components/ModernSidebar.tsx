import { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function ModernSidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const theme = useAccentTheme();
  const [pendingTaskCount, setPendingTaskCount] = useState<number>(0);

  // Fetch true count of active tasks assigned to the current user
  useEffect(() => {
    async function fetchTaskBadge() {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', user.id)
          .neq('status', 'done');

        if (!error && count !== null) {
          setPendingTaskCount(count);
        }
      } catch (err) {
        console.error('Error fetching task count badge:', err);
      }
    }

    fetchTaskBadge();

    const channel = supabase
      .channel(`sidebar_tasks_${user?.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `assigned_to=eq.${user?.id}` },
        () => fetchTaskBadge()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#161b22] border-r border-gray-200 dark:border-gray-800 
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section */}
        <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-sm border border-gray-200 dark:border-gray-700/60 flex items-center justify-center mr-3 shrink-0">
              <img 
                src="/favicon.ico" 
                alt="ProjectFlow Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">ProjectFlow</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</div>
          <NavItem to="/dashboard" icon={<LayoutGrid size={18} />} label="Overview" isActive={location.pathname === '/dashboard'} theme={theme} onClick={onClose} />
          <NavItem to="/analytics" icon={<BarChart2 size={18} />} label="Analytics" isActive={location.pathname === '/analytics'} theme={theme} onClick={onClose} />

          <div className="px-3 mt-5 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Work</div>
          <NavItem to="/projects" icon={<FolderKanban size={18} />} label="Projects" isActive={location.pathname.startsWith('/projects')} theme={theme} onClick={onClose} />
          
          <NavItem 
            to="/tasks" 
            icon={<CheckSquare size={18} />} 
            label="My Tasks" 
            badge={pendingTaskCount > 0 ? String(pendingTaskCount) : undefined} 
            isActive={location.pathname === '/tasks'} 
            theme={theme}
            onClick={onClose} 
          />

          <NavItem 
            to="/sprint-planner" 
            icon={<Sparkles size={18} />} 
            label="Sprint Planner" 
            isActive={location.pathname === '/sprint-planner'} 
            theme={theme}
            onClick={onClose} 
          />
          
          <NavItem 
            to="/code" 
            icon={<Code2 size={18} />} 
            label="Code Studio" 
            isActive={location.pathname === '/code'} 
            theme={theme}
            onClick={onClose} 
          />

          <NavItem 
            to="/api-playground" 
            icon={<Terminal size={18} />} 
            label="API Console" 
            isActive={location.pathname === '/api-playground'} 
            theme={theme}
            onClick={onClose} 
          />

          <NavItem to="/timesheets" icon={<Clock size={18} />} label="Timesheets" isActive={location.pathname === '/timesheets'} theme={theme} onClick={onClose} />
          <NavItem to="/automations" icon={<Zap size={18} />} label="Automations" isActive={location.pathname === '/automations'} theme={theme} onClick={onClose} />

          <div className="px-3 mt-5 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</div>
          <NavItem to="/messages/room_1" icon={<MessageSquare size={18} />} label="Team Chat" isActive={location.pathname.startsWith('/messages')} theme={theme} onClick={onClose} />
          <NavItem to="/team" icon={<Users size={18} />} label="Team" isActive={location.pathname === '/team'} theme={theme} onClick={onClose} />
          <NavItem to="/calendar" icon={<Calendar size={18} />} label="Calendar" isActive={location.pathname === '/calendar'} theme={theme} onClick={onClose} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" isActive={location.pathname.startsWith('/settings')} theme={theme} onClick={onClose} />
        </div>
      </aside>
    </>
  );
}

function NavItem({ icon, label, to, isActive, badge, theme, onClick }: any) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive 
          ? `${theme.bgSubtle} ${theme.textAccent} font-bold shadow-sm border${theme.borderAccent}/30` 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <span className={`${isActive ? theme.textAccent : 'text-gray-400 dark:text-gray-500'} mr-3 shrink-0`}>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {badge && (
        <span className={`ml-auto ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 py-0.5 px-2 rounded-full text-[10px] font-bold`}>
          {badge}
        </span>
      )}
    </Link>
  );
}