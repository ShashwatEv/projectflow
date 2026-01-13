import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, UserPlus, Filter, MoreHorizontal, Mail, MessageSquare, 
    Loader2, Briefcase, Clock, Zap, X, MapPin, Globe, Check, Copy, ExternalLink 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import AddMemberModal from '../components/AddMemberModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  location?: string;
  bio?: string;
  website?: string;
  stats?: {
    workingHours: string;
    productivity: number;
  };
}

export default function Team() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const onlineUserIds = useOnlineUsers();
  
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For 3-dots menu
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null); // For Profile Popup

  // Refs for clicking outside
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- HELPER FUNCTIONS ---

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('developer') || r.includes('engineer')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (r.includes('designer') || r.includes('creative')) return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20';
    if (r.includes('manager') || r.includes('lead')) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  };

  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`;
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      if (data) {
        const formattedUsers: UserData[] = data.map((u: any) => ({
          ...u,
          name: u.name || 'Unknown',
          role: u.role || 'Member',
          avatar: u.avatar || '',
          stats: { 
            workingHours: `${Math.floor(Math.random() * 40) + 10}h`, 
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

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ACTIONS ---

  const startDM = (otherUserId: string) => {
    if (!currentUser) return;
    const ids = [currentUser.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setActiveMenuId(null);
    alert("Email copied to clipboard!");
  };

  // --- FILTER LOGIC ---

  const uniqueRoles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.role?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your team and track performance.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="group flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
        >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> 
            <span>Add Member</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 z-20 relative">
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
          
          {/* Working Filter Button */}
          <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-6 h-full py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                  <Filter size={18} /> 
                  <span>{selectedRole === 'All' ? 'Filters' : selectedRole}</span>
              </button>

              {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in zoom-in-95 duration-200">
                      <div className="p-2">
                          <p className="text-xs font-bold text-gray-400 uppercase px-2 py-1.5">Filter by Role</p>
                          {uniqueRoles.map(role => (
                              <button
                                key={role}
                                onClick={() => { setSelectedRole(role); setIsFilterOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selectedRole === role ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                              >
                                  {role}
                                  {selectedRole === role && <Check size={14} />}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* GRID CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)} // 3. Open Popup on Click
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-visible"
                >
                    {/* Top Decor & 3-Dots Menu */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className="relative">
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setActiveMenuId(activeMenuId === user.id ? null : user.id); 
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* 2. Enhanced 3-Dots Dropdown */}
                            {activeMenuId === user.id && (
                                <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                    <button onClick={(e) => { e.stopPropagation(); startDM(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <MessageSquare size={14} /> Send Message
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <ExternalLink size={14} /> View Full Page
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); copyEmail(user.email); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <Copy size={14} /> Copy Email
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="flex items-start gap-5 mb-6">
                        <div className="relative">
                             <img 
                                src={user.avatar} 
                                onError={handleImageError} 
                                alt={user.name} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                             />
                             {onlineUserIds.has(user.id) && (
                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                             )}
                        </div>
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
                            Quick View
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
                    Try adjusting your filters or search terms.
                </p>
              </div>
            )}
        </div>
      )}

      {/* --- 4. PROFILE POPUP MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setSelectedUser(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-gray-700">
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10 transition-colors backdrop-blur-md"
                >
                    <X size={18} />
                </button>

                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="px-8 pb-8 -mt-16 text-center relative">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        <img 
                             src={selectedUser.avatar} 
                             onError={handleImageError} 
                             alt={selectedUser.name} 
                             className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover bg-white" 
                        />
                        {onlineUserIds.has(selectedUser.id) && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full" title="Online"></div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{selectedUser.name}</h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedUser.role}</p>

                    {selectedUser.bio && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 italic">"{selectedUser.bio}"</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button 
                            onClick={() => { setSelectedUser(null); startDM(selectedUser.id); }}
                            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all"
                        >
                            <MessageSquare size={18} /> Message
                        </button>
                        <button 
                            onClick={() => { setSelectedUser(null); navigate(`/profile/${selectedUser.id}`); }}
                            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                        >
                             View Profile
                        </button>
                    </div>

                    <div className="mt-8 space-y-4 text-left">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <Mail className="text-gray-400" size={18} />
                            <span className="truncate">{selectedUser.email}</span>
                        </div>
                        {selectedUser.location && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <MapPin className="text-gray-400" size={18} />
                                <span>{selectedUser.location}</span>
                            </div>
                        )}
                        {selectedUser.website && (
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <Globe className="text-gray-400" size={18} />
                                <a href={selectedUser.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">{selectedUser.website}</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Add Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMemberAdded={fetchUsers} 
      />

    </div>
  );
}