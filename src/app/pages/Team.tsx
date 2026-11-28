import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  UserPlus,
  Filter,
  MoreHorizontal,
  Mail,
  MessageSquare,
  Loader2,
  Users,
  X,
  MapPin,
  Globe,
  Check,
  Copy,
  ExternalLink,
  BadgeCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { ALL_TEAMS_SCOPE, useWorkspace } from '../../context/WorkspaceContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import AvatarWithFrame, {
  AVATAR_FRAMES,
  type AvatarFrameId,
} from '../components/AvatarWithFrame';
import ProjectInviteModal from '../components/ProjectInviteModal';
import { toast } from 'sonner';

import { SUPER_ADMIN_EMAIL, isSuperAdmin } from '../../lib/constants';

const FRAME_STORAGE_KEY = 'pf_user_avatar_frame';

function normalizeFrameId(value: unknown): AvatarFrameId | null {
  if (typeof value !== 'string') return null;
  return AVATAR_FRAMES.some((frame) => frame.id === value) ? (value as AvatarFrameId) : null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  avatar_frame?: AvatarFrameId;
  location?: string;
  bio?: string;
  website?: string;
  is_verified?: boolean;
}

interface TeamMemberRow {
  team_id: string;
  user_id: string;
  role: 'team_manager' | 'member';
}

export default function Team() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { selectedTeamId, canViewAllTeams, activeTeam, teams } = useWorkspace();
  const theme = useAccentTheme();
  const onlineUserIds = useOnlineUsers();

  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [teamMemberUserIdsByTeam, setTeamMemberUserIdsByTeam] = useState<
    Map<string, Set<string>>
  >(() => new Map());
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
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const [{ data, error }, teamMembersRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('name', { ascending: true }),
        (
          supabase as unknown as {
            from: (relation: string) => {
              select: (
                columns: string
              ) => Promise<{ data: unknown[] | null; error: { message?: string } | null }>;
            };
          }
        )
          .from('team_members')
          .select('team_id, user_id, role'),
      ]);

      if (error) throw error;
      if (data) {
        const localFrame = normalizeFrameId(
          typeof window !== 'undefined' ? localStorage.getItem(FRAME_STORAGE_KEY) : null
        );
        const formattedUsers: UserData[] = data.map((u: unknown) => {
          const row = u as Record<string, unknown>;
          const id = String(row.id || '');
          const email = String(row.email || '');
          const rawRole = typeof row.role === 'string' ? row.role : null;
          const dbFrame = normalizeFrameId(row.avatar_frame);
          const resolvedFrame: AvatarFrameId =
            dbFrame ??
            (id && currentUser?.id && id === currentUser.id && localFrame
              ? localFrame
              : 'blue-sparkles');

          return {
            ...(row as unknown as UserData),
            id,
            name: typeof row.name === 'string' && row.name ? row.name : 'Member',
            email,
            role: isSuperAdmin(email, rawRole) ? 'Admin' : rawRole || 'Member',
            avatar: typeof row.avatar === 'string' && row.avatar ? row.avatar : '/pfp.jpg',
            avatar_frame: resolvedFrame,
            is_verified: Boolean(row.is_verified || isSuperAdmin(email, rawRole)),
          };
        });
        setUsers(formattedUsers);
      }

      if (!teamMembersRes.error && Array.isArray(teamMembersRes.data)) {
        const nextMap = new Map<string, Set<string>>();
        for (const rawRow of teamMembersRes.data) {
          const row = rawRow as TeamMemberRow;
          if (!row.team_id || !row.user_id) continue;
          const existing = nextMap.get(row.team_id) || new Set<string>();
          existing.add(row.user_id);
          nextMap.set(row.team_id, existing);
        }
        setTeamMemberUserIdsByTeam(nextMap);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      toast.error('Failed to load team directory');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    void fetchUsers();

    const scheduleSync = () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
      syncDebounceRef.current = setTimeout(() => {
        void fetchUsers();
      }, 200);
    };

    const channel = supabase
      .channel('team_page_users_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, scheduleSync)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_members' },
        scheduleSync
      )
      .subscribe();

    window.addEventListener('avatar-frame-updated', scheduleSync);
    window.addEventListener('user-profile-updated', scheduleSync);

    return () => {
      if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
      void supabase.removeChannel(channel);
      window.removeEventListener('avatar-frame-updated', scheduleSync);
      window.removeEventListener('user-profile-updated', scheduleSync);
    };
  }, [fetchUsers]);

  // Close menus when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
        setActiveMenuId(null);
        setSelectedUser(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const startDM = (otherUserId: string) => {
    if (!currentUser) return;
    const ids = [currentUser.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  const copyEmail = (email: string) => {
    void navigator.clipboard.writeText(email);
    setActiveMenuId(null);
    toast.success('Email copied to clipboard!');
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

  const teamScopedUsers = users.filter((u) => {
    if (selectedTeamId === ALL_TEAMS_SCOPE) {
      return true;
    }
    const membersInTeam = teamMemberUserIdsByTeam.get(selectedTeamId);
    if (!membersInTeam || membersInTeam.size === 0) {
      return true;
    }
    return membersInTeam.has(u.id);
  });

  const uniqueRoles = ['All', ...Array.from(new Set(teamScopedUsers.map((u) => u.role)))];

  const filteredUsers = teamScopedUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const verifiedCount = teamScopedUsers.filter((u) => u.is_verified).length;
  const onlineCount = teamScopedUsers.filter((u) => onlineUserIds.has(u.id)).length;

  return (
    <div className="relative mx-auto h-full max-w-7xl space-y-8 overflow-y-auto p-6 animate-in fade-in duration-300 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col items-start justify-between gap-6 border-b border-gray-200 pb-6 dark:border-gray-800 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              <div
                className={`rounded-2xl border p-2.5 shadow-sm ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
              >
                <UsersIcon size={24} />
              </div>
              <span>Team Directory</span>
            </h1>
            {(activeTeam || (canViewAllTeams && selectedTeamId === ALL_TEAMS_SCOPE)) && (
              <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {selectedTeamId === ALL_TEAMS_SCOPE && canViewAllTeams
                  ? `All Teams (${teams.length})`
                  : activeTeam?.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {activeTeam
              ? `Find ${activeTeam.name} teammates, see who is online, and start conversations.`
              : 'Find teammates, see who is online, and start conversations.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold shadow-md transition-all active:scale-95 ${theme.btnPrimary}`}
        >
          <UserPlus size={16} />
          <span>Invite to Project</span>
        </button>
      </div>

      {/* KPI STATS RIBBON */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#161b22]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Total Members
            </span>
            <h3 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
              {teamScopedUsers.length}
            </h3>
          </div>
          <div
            className={`rounded-xl border p-2.5 ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <UsersIcon size={18} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#161b22]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Active Online
            </span>
            <h3 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
              {onlineCount}
            </h3>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-500 dark:border-emerald-800/40 dark:bg-emerald-950/40">
            <span className="block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#161b22]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Verified Identities
            </span>
            <h3 className="mt-1 text-2xl font-black text-gray-900 dark:text-white">
              {verifiedCount}
            </h3>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-blue-500 dark:border-blue-800/40 dark:bg-blue-950/40">
            <BadgeCheck size={20} />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="relative z-20 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-[#161b22] sm:flex-row">
        <div className="group relative flex-1">
          <Search
            className="absolute left-4 top-3.5 text-gray-400 transition-colors group-focus-within:text-indigo-500"
            size={18}
          />
          <input
            type="text"
            aria-label="Search team members"
            placeholder="Search by name, role, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-none bg-transparent py-2.5 pl-11 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none dark:text-white"
          />
        </div>

        <div className="hidden w-px bg-gray-200 dark:border-gray-800 sm:block" />

        {/* Role Filter Menu */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            aria-expanded={isFilterOpen}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60 ${
              isFilterOpen ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <Filter size={15} />
            <span>{selectedRole === 'All' ? 'Filter Role' : selectedRole}</span>
          </button>

          {isFilterOpen && (
            <div className="animate-in zoom-in-95 absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl duration-200 dark:border-gray-800 dark:bg-[#0d1117]">
              <div className="space-y-1 p-2">
                <p className="px-2 py-1 text-[10px] font-bold uppercase text-gray-400">
                  Select Role
                </p>
                {uniqueRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                      selectedRole === role
                        ? `${theme.bgSubtle}${theme.textAccent} font-bold`
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
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
        <div className="flex flex-col items-center justify-center space-y-3 py-24">
          <Loader2 className={`animate-spin ${theme.textAccent}`} size={32} />
          <p className="text-xs text-gray-400">Loading verified team registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => {
              const isRootAdmin = isSuperAdmin(user.email, user.role);
              const isOnline = onlineUserIds.has(user.id);

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl dark:border-gray-800/80 dark:bg-[#161b22] dark:hover:border-gray-700"
                >
                  {/* Top Action Options */}
                  <div
                    className="absolute right-4 top-4 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === user.id ? null : user.id)}
                        aria-label={`Member options for ${user.name}`}
                        aria-expanded={activeMenuId === user.id}
                        className="rounded-xl p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {activeMenuId === user.id && (
                        <div
                          ref={menuRef}
                          className="animate-in zoom-in-95 absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 text-xs shadow-2xl duration-200 dark:border-gray-800 dark:bg-[#0d1117]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              startDM(user.id);
                            }}
                            className="flex w-full items-center gap-2 px-3.5 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <MessageSquare size={13} className={theme.textAccent} /> Send Message
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/profile/${user.id}`);
                            }}
                            className="flex w-full items-center gap-2 px-3.5 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <ExternalLink size={13} /> View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => copyEmail(user.email)}
                            className="flex w-full items-center gap-2 border-t border-gray-100 px-3.5 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Copy size={13} /> Copy Email
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Identity Header */}
                  <div className="mb-5 flex items-start gap-4">
                    <div className="relative shrink-0">
                      <AvatarWithFrame
                        src={user.avatar}
                        alt={user.name}
                        shape="square"
                        frame={user.avatar_frame || 'blue-sparkles'}
                        size={56}
                      />
                      {isOnline && (
                        <span
                          className="absolute -bottom-1 -right-1 z-10 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#161b22]"
                          title="Online"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-indigo-400 dark:text-white">
                          {user.name}
                        </h3>
                        {user.is_verified && (
                          <span title="Verified Member" className="shrink-0 text-blue-500">
                            <BadgeCheck size={17} className="fill-blue-500/20" />
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getRoleBadge(
                            user.role,
                            user.email
                          )}`}
                        >
                          {user.role}
                        </span>
                        {isRootAdmin && (
                          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                            Root Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 min-h-14 space-y-2 text-xs">
                    {user.bio ? (
                      <p className="line-clamp-2 leading-relaxed text-gray-600 dark:text-gray-400">
                        {user.bio}
                      </p>
                    ) : (
                      <p className="text-gray-400 dark:text-gray-500">No bio added yet.</p>
                    )}
                    {user.location && (
                      <p className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <MapPin size={13} className="shrink-0" />
                        <span className="truncate">{user.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Footer Strip */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-gray-400" />
                      <span className="max-w-[130px] truncate font-medium">
                        {activeTeam?.name || 'Workspace member'}
                      </span>
                    </div>

                    <span
                      className={`flex items-center gap-1 font-semibold transition-transform group-hover:translate-x-0.5 ${theme.textAccent}`}
                    >
                      Inspect Profile →
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center space-y-2 rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center dark:border-gray-800 dark:bg-[#161b22]">
              <Search className="mb-2 text-gray-400" size={32} />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                No members found
              </h3>
              <p className="max-w-sm text-xs text-gray-500 dark:text-gray-400">
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
            className="animate-in fade-in fixed inset-0 bg-black/60 backdrop-blur-sm duration-200"
            onClick={() => setSelectedUser(null)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedUser.name} profile details`}
            className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl duration-200 dark:border-gray-800 dark:bg-[#161b22]"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              aria-label="Close member profile modal"
              className="absolute right-4 top-4 z-10 rounded-full bg-black/30 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/50"
            >
              <X size={16} />
            </button>

            {/* Gradient Header Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

            <div className="relative -mt-14 space-y-3 px-6 pb-6 text-center">
              {/* Profile Image with Online Pin */}
              <div className="relative inline-flex items-center justify-center">
                <AvatarWithFrame
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  shape="circle"
                  frame={selectedUser.avatar_frame || 'blue-sparkles'}
                  size={112}
                />
                {onlineUserIds.has(selectedUser.id) && (
                  <div
                    className="absolute bottom-1 right-1 z-10 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#161b22]"
                    title="Online"
                  />
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

                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span
                    className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${getRoleBadge(
                      selectedUser.role,
                      selectedUser.email
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                  {isSuperAdmin(selectedUser.email, selectedUser.role) && (
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-500">
                      Root Admin
                    </span>
                  )}
                </div>
              </div>

              {selectedUser.bio && (
                <p className="px-4 text-xs italic leading-relaxed text-gray-500 dark:text-gray-400">
                  &ldquo;{selectedUser.bio}&rdquo;
                </p>
              )}

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    startDM(selectedUser.id);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 ${theme.btnPrimary}`}
                >
                  <MessageSquare size={15} />
                  <span>Direct Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    navigate(`/profile/${selectedUser.id}`);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-900 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <span>Full Profile</span>
                </button>
              </div>

              {/* Contact Info List */}
              <div className="space-y-2 pt-3 text-left text-xs">
                <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-gray-600 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
                  <Mail className="text-gray-400" size={16} />
                  <span className="truncate">{selectedUser.email}</span>
                </div>
                {selectedUser.location && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-gray-600 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
                    <MapPin className="text-gray-400" size={16} />
                    <span>{selectedUser.location}</span>
                  </div>
                )}
                {selectedUser.website && (
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-gray-600 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
                    <Globe className="text-gray-400" size={16} />
                    <a
                      href={selectedUser.website}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-blue-500 hover:underline"
                    >
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
      <ProjectInviteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAccessGranted={() => void fetchUsers()}
      />
    </div>
  );
}