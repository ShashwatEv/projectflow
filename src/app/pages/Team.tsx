import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, MoreHorizontal, Mail, ExternalLink } from 'lucide-react';
import { getUsers, UserData } from '../../data/mockData';

export default function Team() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');

  // Fetch users on load (Simulate real data fetch)
  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team and view profiles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 dark:shadow-none">
            <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or role..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all"
              />
          </div>
          <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
              <Filter size={18} /> Filters
          </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                onClick={() => navigate(`/profile/${user.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                  {/* Hover decoration */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex items-start justify-between mb-4">
                      {user.avatar.startsWith('http') ? (
                          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                      ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-sm">
                              {user.avatar}
                          </div>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>

                  <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.role}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs rounded-md font-medium">
                              {user.stats.workingHours} logged
                          </span>
                          <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-md font-medium">
                              {user.stats.productivity}% eff.
                          </span>
                      </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Mail size={14} /> 
                          <span className="truncate max-w-[120px]">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                          View Profile <ExternalLink size={12} />
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}