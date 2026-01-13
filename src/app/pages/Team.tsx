import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, MoreHorizontal, Mail, MessageSquare, Loader2, Briefcase, Clock, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import UserAvatar from '../components/UserAvatar';
import AddMemberModal from '../components/AddMemberModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  stats?: {
    workingHours: string;
    productivity: number;
  };
}

export default function Team() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const onlineUserIds = useOnlineUsers();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper: Get Badge Color based on Role
  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('developer') || r.includes('engineer')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (r.includes('designer') || r.includes('creative')) return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20';
    if (r.includes('manager') || r.includes('lead')) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      if (data) {
        const formattedUsers: UserData[] = data.map((u: any) => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || '',
          role: u.role || 'Member',
          avatar: u.avatar || '',
          stats: { 
            workingHours: `${Math.floor(Math.random() * 40) + 10}h`, // Mock data for visuals
            productivity: Math.floor(Math.random() * 30) + 70 
          }
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const startDM = (otherUserId: string) => {
    if (!currentUser) return;
    const ids = [currentUser.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your team and track performance.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="group flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0"
        >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> 
            <span>Add Member</span>
        </button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, role, or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          <button className="px-6 py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl flex items-center gap-2 transition-colors">
              <Filter size={18} /> 
              <span>Filters</span>
          </button>
      </div>

      {/* --- GRID CONTENT --- */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => startDM(user.id)}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                >
                    {/* Top Decor */}
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.id}`); }}
                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    {/* Identity */}
                    <div className="flex items-start gap-5 mb-6">
                        <UserAvatar 
                            name={user.name} 
                            avatarUrl={user.avatar} 
                            isOnline={onlineUserIds.has(user.id)} 
                            size="lg" 
                        />
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {user.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Clock size={14} />
                                <span className="text-xs font-medium">Hours</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                {user.stats?.workingHours}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Zap size={14} />
                                <span className="text-xs font-medium">Efficiency</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {user.stats?.productivity}%
                            </span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            <Briefcase size={16} /> 
                            <span className="truncate max-w-[120px]">ProjectFlow Team</span>
                        </div>
                        
                        <button className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Chat <MessageSquare size={16} />
                        </button>
                    </div>
                </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No members found</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                    We couldn't find anyone matching "{search}". Try adjusting your filters.
                </p>
              </div>
            )}
        </div>
      )}

      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMemberAdded={fetchUsers} 
      />

    </div>
  );
}