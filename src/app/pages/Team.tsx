import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Filter, MoreHorizontal, Mail, MessageSquare, 
  Loader2, Briefcase, Clock, Zap, X, MapPin, Globe, Check, Copy, 
  ExternalLink, BadgeCheck, Shield, Users as UsersIcon, Sparkles 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import AddMemberModal from '../components/AddMemberModal';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  location?: string;
  bio?: string;
  website?: string;
  is_verified?: boolean;
  stats?: {
    workingHours: string;
    productivity: number;
  };
}

export default function Team() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const theme = useAccentTheme();
  const onlineUserIds = useOnlineUsers();
  
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) {
        const formattedUsers: UserData[] = data.map((u: any) => ({
          ...u,
          name: u.name || 'Member',
          role: u.email?.toLowerCase() === SUPER_ADMIN_EMAIL ? 'Admin' : (u.role || 'Member'),
          avatar: u.avatar || '/pfp.jpg',
          is_verified: Boolean(u.is_verified || (u.email?.toLowerCase() === SUPER_ADMIN_EMAIL)),
          stats: { 
            workingHours: `${Math.floor(Math.random() * 25) + 20}h`, 
            productivity: Math.floor(Math.random() * 20) + 80 
          }
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Failed to load team directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 

    // Subscribe to realtime user updates
    const channel = supabase
      .channel('team_page_users_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const startDM = (otherUserId: string) => {
    if (!currentUser) return;
    const ids = [currentUser.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setActiveMenuId(null);
    toast.success("Email copied to clipboard!");
  };

  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`;
  };

  const getRoleBadge = (role: string, email?: string) => {
    const isRoot = email?.toLowerCase() === SUPER_ADMIN_EMAIL;
    if (isRoot || role.toLowerCase() === 'admin') {
      return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    }
    const r = role.toLowerCase();
    if (r.includes('developer') || r.includes('engineer')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
    if (r.includes('designer') || r.includes('creative')) {
      return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
    }
    if (r.includes('manager') || r.includes('lead')) {
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  };

  const uniqueRoles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const verifiedCount = users.filter(u => u.is_verified).length;
  const onlineCount = users.filter(u => onlineUserIds.has(u.id)).length;

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto animate-in fade-in duration-300 relative max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <UsersIcon size={24} />
            </div>
            <span>Team Directory</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Collaborate with verified members, view performance metrics, and manage permissions.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className={`flex items-center gap-2 px-5 py-3 ${theme.btnPrimary} font-bold text-xs rounded-xl transition-all shadow-md active:scale-95`}
        >
          <UserPlus size={16} /> 
          <span>Add Member</span>
        </button>
      </div>

      {/* KPI STATS RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Members</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{users.length}</h3>
          </div>
          <div className={`p-2.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
            <UsersIcon size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Online</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{onlineCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200 dark:border-emerald-800/40">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verified Identities</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{verifiedCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 border border-blue-200 dark:border-blue-800/40">
            <BadgeCheck size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-[#161b22] p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 z-20 relative">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, role, or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-transparent border-none outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        
        <div className="w-px bg-gray-200 dark:border-gray-800 hidden sm:block"></div>
        
        {/* Role Filter Menu */}
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-5 py-2.5 text-xs text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl flex items-center gap-2 transition-colors ${
              isFilterOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <Filter size={15} /> 
            <span>{selectedRole === 'All' ? 'Filter Role' : selectedRole}</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-30 animate-in zoom-in-95 duration-200">
              <div className="p-2 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase px-2 py-1">Select Role</p>
                {uniqueRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => { setSelectedRole(role); setIsFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedRole === role 
                        ? `${theme.bgSubtle}${theme.textAccent} font-bold` 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>{role}</span>
                    {selectedRole === role && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRID OF TEAM CARDS */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 space-y-3">
          <Loader2 className={`animate-spin ${theme.textAccent}`} size={32} />
          <p className="text-xs text-gray-400">Loading verified team registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => {
            const isRootAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
            const isOnline = onlineUserIds.has(user.id);

            return (
              <div 
                key={user.id} 
                onClick={() => setSelectedUser(user)}
                className="group relative bg-white dark:bg-[#161b22] rounded-3xl p-6 border border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                {/* Top Action Options */}
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuId === user.id && (
                      <div ref={menuRef} className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#0d1117] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden py-1 text-xs animate-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => { setActiveMenuId(null); startDM(user.id); }} 
                          className="w-full text-left px-3.5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 font-medium"
                        >
                          <MessageSquare size={13} className={theme.textAccent} /> Send Message
                        </button>
                        <button 
                          onClick={() => { setActiveMenuId(null); navigate(`/profile/${user.id}`); }} 
                          className="w-full text-left px-3.5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 font-medium"
                        >
                          <ExternalLink size={13} /> View Profile
                        </button>
                        <button 
                          onClick={() => copyEmail(user.email)} 
                          className="w-full text-left px-3.5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 font-medium"
                        >
                          <Copy size={13} /> Copy Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Identity Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative shrink-0">
                    <img 
                      src={user.avatar} 
                      onError={handleImageError} 
                      alt={user.name} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-gray-800"
                    />
                    {isOnline && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full" title="Online" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-400 transition-colors">
                        {user.name}
                      </h3>
                      {user.is_verified && (
                        <span title="Verified Member" className="shrink-0 text-blue-500">
                          <BadgeCheck size={17} className="fill-blue-500/20" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleBadge(user.role, user.email)}`}>
                        {user.role}
                      </span>
                      {isRootAdmin && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          Root Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Metric Tiles */}
                <div className="grid grid-cols-2 gap-2.5 mb-5 text-xs">
                  <div className="bg-gray-50 dark:bg-[#0d1117] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <Clock size={12} />
                      <span className="text-[10px] font-semibold uppercase">Weekly</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-200 font-mono">
                      {user.stats?.workingHours}
                    </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#0d1117] rounded-2xl p-2.5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
                      <Zap size={12} />
                      <span className="text-[10px] font-semibold uppercase">Velocity</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 font-mono">
                      {user.stats?.productivity}%
                    </span>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-gray-400" />
                    <span className="truncate max-w-[130px] font-medium">ProjectFlow Core</span>
                  </div>
                  
                  <span className={`font-semibold ${theme.textAccent} group-hover:translate-x-0.5 transition-transform flex items-center gap-1`}>
                    Inspect Profile →
                  </span>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b22] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center space-y-2">
              <Search className="text-gray-400 mb-2" size={32} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">No members found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                Try adjusting your search criteria or resetting the role filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* DETAILED PROFILE POPUP MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedUser(null)}
          />

          <div className="relative w-full max-w-md bg-white dark:bg-[#161b22] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full z-10 transition-colors backdrop-blur-md"
            >
              <X size={16} />
            </button>

            {/* Gradient Header Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="px-6 pb-6 -mt-14 text-center relative space-y-3">
              {/* Profile Image with Online Pin */}
              <div className="relative inline-block">
                <img 
                  src={selectedUser.avatar} 
                  onError={handleImageError} 
                  alt={selectedUser.name} 
                  className="w-28 h-28 rounded-full border-4 border-white dark:border-[#161b22] shadow-xl object-cover bg-white dark:bg-[#0d1117]" 
                />
                {onlineUserIds.has(selectedUser.id) && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-[#161b22] rounded-full" title="Online" />
                )}
              </div>

              {/* Identity & Badges */}
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h2>
                  {selectedUser.is_verified && (
                    <span title="Verified Member" className="text-blue-500">
                      <BadgeCheck size={20} className="fill-blue-500/20" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getRoleBadge(selectedUser.role, selectedUser.email)}`}>
                    {selectedUser.role}
                  </span>
                  {selectedUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL && (
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                      Root Admin
                    </span>
                  )}
                </div>
              </div>

              {selectedUser.bio && (
                <p className="text-gray-500 dark:text-gray-400 text-xs italic px-4 leading-relaxed">
                  "{selectedUser.bio}"
                </p>
              )}

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => { setSelectedUser(null); startDM(selectedUser.id); }}
                  className={`py-2.5 px-4 ${theme.btnPrimary} font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95`}
                >
                  <MessageSquare size={15} /> 
                  <span>Direct Message</span>
                </button>
                <button 
                  onClick={() => { setSelectedUser(null); navigate(`/profile/${selectedUser.id}`); }}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <span>Full Profile</span>
                </button>
              </div>

              {/* Contact Info List */}
              <div className="pt-3 space-y-2 text-left text-xs">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300">
                  <Mail className="text-gray-400" size={16} />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
                {selectedUser.location && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300">
                    <MapPin className="text-gray-400" size={16} />
                    <span>{selectedUser.location}</span>
                  </div>
                )}
                {selectedUser.website && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0d1117] border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-600 dark:text-gray-300">
                    <Globe className="text-gray-400" size={16} />
                    <a href={selectedUser.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">
                      {selectedUser.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMemberAdded={fetchUsers} 
      />

    </div>
  );
}