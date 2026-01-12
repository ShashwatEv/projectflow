import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  CheckSquare, 
  FolderKanban, 
  Users, 
  Calendar, 
  BarChart2, 
  Settings,
  Bell,           // New
  MessageSquare,  // New
  Zap,            // New
  Clock,          // New
  X
} from 'lucide-react';

// Accept props for mobile handling
interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function ModernSidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  // CSS classes to handle mobile slide-in vs desktop static
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
        {/* Mobile Overlay Backdrop */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
        )}

        <aside className={sidebarClasses}>
          {/* Logo Section */}
          <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">ProjectFlow</span>
            </div>
            {/* Close button for mobile */}
            {onClose && (
              <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
                  <X size={20} />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Overview Section */}
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</div>
            <NavItem to="/dashboard" icon={<LayoutGrid size={20} />} label="Overview" isActive={location.pathname === '/dashboard'} onClick={onClose} />
            <NavItem to="/analytics" icon={<BarChart2 size={20} />} label="Analytics" isActive={location.pathname === '/analytics'} onClick={onClose} />

            {/* Work Section */}
            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Work</div>
            <NavItem to="/projects" icon={<FolderKanban size={20} />} label="Projects" isActive={location.pathname === '/projects'} onClick={onClose} />
            <NavItem to="/tasks" icon={<CheckSquare size={20} />} label="My Tasks" badge="12" isActive={location.pathname === '/tasks'} onClick={onClose} />
            <NavItem to="/timesheets" icon={<Clock size={20} />} label="Timesheets" isActive={location.pathname === '/timesheets'} onClick={onClose} />
            <NavItem to="/automations" icon={<Zap size={20} />} label="Automations" isActive={location.pathname === '/automations'} onClick={onClose} />

            {/* Team Section */}
            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</div>
            <NavItem to="/messages/room_1" icon={<MessageSquare size={20} />} label="Team Chat" isActive={location.pathname === '/messages/room_1'} onClick={onClose} />
            <NavItem to="/team" icon={<Users size={20} />} label="Team" isActive={location.pathname === '/team'} onClick={onClose} />
            <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendar" isActive={location.pathname === '/calendar'} onClick={onClose} />
          </nav>

          {/* Footer Section (Notifications & Settings) */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
             <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" isActive={location.pathname === '/settings'} onClick={onClose} />
          </div>
        </aside>
    </>
  );
}

// Helper Components 
function NavItem({ icon, label, to, isActive, badge, onClick }: any) {
  return (
    <Link 
        to={to} 
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive 
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
    >
      <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'} mr-3`}>{icon}</span>
      {label}
      {badge && (
        <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
}

function ProjectProgress({ title, percent, color }: any) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}