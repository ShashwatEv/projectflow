import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings, MessageSquare, CheckSquare, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export function Sidebar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
    { icon: Users, label: 'Team', path: '/team' },
    { icon: MessageSquare, label: 'Chat', path: '/messages/room_1' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const projects = [
    { name: 'Website Redesign', color: 'bg-blue-500' },
    { name: 'Mobile App', color: 'bg-green-500' },
    { name: 'Marketing Campaign', color: 'bg-purple-500' },
  ];

  // Fetch the real profile on mount
  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data } = await supabase
          .from('users')
          .select('name, avatar')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      getProfile();
    }
  }, [user]);

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">T</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">TaskFlow</span>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto pt-4">
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          ))}

          {/* Projects Section */}
          <div className="pt-8 mt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="px-3 pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Active Projects
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.name}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${project.color}`}></div>
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Snippet (Bottom) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
         <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {profile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
            )}
            
            <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                 {profile?.name || 'Loading...'}
               </p>
               <p className="text-xs text-gray-500 truncate">View Settings</p>
            </div>
         </Link>
      </div>
    </aside>
  );
}