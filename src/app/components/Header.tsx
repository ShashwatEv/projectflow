import { Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import the Auth Context

export function Header() {
  const { user } = useAuth(); // Get dynamic user data

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Logo & Search Section */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600"></div>
            <span className="font-semibold text-gray-900">TaskFlow</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, projects..."
              className="w-96 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5 text-gray-600" />
          </button>
          
          {/* Dynamic User Profile */}
          <div className="ml-2 flex items-center gap-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="h-9 w-9 rounded-full object-cover border border-gray-200" 
              />
            ) : (
              // Fallback if no avatar exists
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            
            <div>
              <div className="text-sm font-medium text-gray-900">
                {user?.name || 'Guest User'}
              </div>
              <div className="text-xs text-gray-500">
                {user?.role || 'Team Member'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}