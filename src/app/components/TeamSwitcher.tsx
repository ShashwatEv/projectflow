import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Plus, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import { ALL_TEAMS_SCOPE, useWorkspace, type TeamScopeId } from '../../context/WorkspaceContext';

interface TeamSwitcherProps {
  className?: string;
  compact?: boolean;
}

export default function TeamSwitcher({ className = '', compact = false }: TeamSwitcherProps) {
  const {
    loading,
    activeOrganization,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    activeTeam,
    isOrgAdmin,
    canViewAllTeams,
    refreshWorkspace,
  } = useWorkspace();

  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';

  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    if (!open) {
      setShowCreateForm(false);
      setNewTeamName('');
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCreateForm) {
          setShowCreateForm(false);
        } else {
          setOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, showCreateForm]);

  const handleSelectScope = (scopeId: TeamScopeId, label: string) => {
    setSelectedTeamId(scopeId);
    setAnnouncement(`Switched workspace view to ${label}.`);
    setOpen(false);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newTeamName.trim();
    if (!cleanName || !activeOrganization?.id || creatingTeam) return;

    setCreatingTeam(true);
    try {
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const client = supabase as unknown as {
        from: (relation: string) => {
          insert: (values: Record<string, unknown>) => {
            select: () => {
              single: () => Promise<{ data: { id?: string } | null; error: { message?: string } | null }>;
            };
          };
        };
      };

      const { data, error } = await client
        .from('teams')
        .insert({
          organization_id: activeOrganization.id,
          name: cleanName,
          slug: slug || `team-${Date.now()}`,
          description: null,
        })
        .select()
        .single();

      if (error) throw new Error(error.message || 'Failed to create team');

      await refreshWorkspace();
      if (data?.id) {
        setSelectedTeamId(data.id);
      }
      setAnnouncement(`Created and switched to team ${cleanName}.`);
      toast.success(`Team "${cleanName}" created`);
      setNewTeamName('');
      setShowCreateForm(false);
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium ${
          isDarkTheme
            ? 'border-zinc-800 bg-zinc-900 text-zinc-400'
            : 'border-slate-200 bg-slate-100 text-slate-500'
        } ${className}`}
      >
        <Users size={14} aria-hidden="true" />
        <span>Loading teams...</span>
      </div>
    );
  }

  if (!activeOrganization && teams.length === 0) {
    return null;
  }

  const currentLabel =
    selectedTeamId === ALL_TEAMS_SCOPE && canViewAllTeams
      ? 'All Teams'
      : activeTeam?.name || teams[0]?.name || 'Workspace';

  const currentRoleBadge =
    selectedTeamId === ALL_TEAMS_SCOPE && isOrgAdmin
      ? 'Admin · All'
      : activeTeam?.role === 'team_manager'
      ? 'Manager'
      : isOrgAdmin
      ? 'Admin'
      : 'Member';

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Select active team. Current view: ${currentLabel}`}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isDarkTheme
            ? 'border-zinc-700/90 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800'
            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {selectedTeamId === ALL_TEAMS_SCOPE && canViewAllTeams ? (
          <Globe size={14} className="shrink-0 text-indigo-500" aria-hidden="true" />
        ) : (
          <Users size={14} className="shrink-0 text-indigo-500" aria-hidden="true" />
        )}

        <span className="max-w-[140px] truncate">{currentLabel}</span>

        {!compact && (
          <span
            className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              isDarkTheme
                ? 'bg-indigo-500/15 text-indigo-300'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {currentRoleBadge}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Teams and workspace scope"
          className={`animate-in fade-in zoom-in-95 absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl duration-150 ${
            isDarkTheme
              ? 'border-zinc-700/90 bg-zinc-900/95 text-zinc-100'
              : 'border-slate-200 bg-white/95 text-slate-900'
          }`}
        >
          {activeOrganization && (
            <div
              className={`flex items-center justify-between border-b px-3.5 py-2.5 text-[11px] ${
                isDarkTheme
                  ? 'border-zinc-800 bg-zinc-800/50 text-zinc-400'
                  : 'border-slate-100 bg-slate-50 text-slate-500'
              }`}
            >
              <span className="truncate font-semibold">{activeOrganization.name}</span>
              {isOrgAdmin && (
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-500">
                  <ShieldCheck size={12} aria-hidden="true" />
                  Org Admin
                </span>
              )}
            </div>
          )}

          <div className="max-h-64 overflow-y-auto p-1.5">
            {canViewAllTeams && (
              <button
                type="button"
                role="option"
                aria-selected={selectedTeamId === ALL_TEAMS_SCOPE}
                onClick={() => handleSelectScope(ALL_TEAMS_SCOPE, 'All Teams')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                  selectedTeamId === ALL_TEAMS_SCOPE
                    ? isDarkTheme
                      ? 'bg-indigo-600/20 font-semibold text-indigo-300'
                      : 'bg-indigo-50 font-semibold text-indigo-700'
                    : isDarkTheme
                    ? 'text-zinc-200 hover:bg-zinc-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Globe size={15} className="shrink-0 text-indigo-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">All Teams</p>
                    <p className="truncate text-[10px] text-slate-400">
                      Cross-team admin overview
                    </p>
                  </div>
                </div>
                {selectedTeamId === ALL_TEAMS_SCOPE && (
                  <Check size={14} className="shrink-0 text-indigo-500" aria-hidden="true" />
                )}
              </button>
            )}

            {teams.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-400">
                No teams assigned yet.
              </p>
            ) : (
              teams.map((team) => {
                const isSelected = selectedTeamId === team.id;
                return (
                  <button
                    key={team.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectScope(team.id, team.name)}
                    className={`mt-0.5 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                      isSelected
                        ? isDarkTheme
                          ? 'bg-indigo-600/20 font-semibold text-indigo-300'
                          : 'bg-indigo-50 font-semibold text-indigo-700'
                        : isDarkTheme
                        ? 'text-zinc-200 hover:bg-zinc-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Users size={15} className="shrink-0 text-indigo-500" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{team.name}</p>
                        <p className="truncate text-[10px] capitalize text-slate-400">
                          {team.role === 'team_manager' ? 'Team Manager' : 'Team Member'}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="shrink-0 text-indigo-500" aria-hidden="true" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {isOrgAdmin && activeOrganization && (
            <div
              className={`border-t p-2 ${
                isDarkTheme ? 'border-zinc-800 bg-zinc-900' : 'border-slate-100 bg-slate-50/70'
              }`}
            >
              {showCreateForm ? (
                <form onSubmit={(e) => void handleCreateTeam(e)} className="space-y-2">
                  <input
                    type="text"
                    autoFocus
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="New team name..."
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDarkTheme
                        ? 'border-zinc-700 bg-zinc-950 text-white'
                        : 'border-slate-200 bg-white text-slate-900'
                    }`}
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTeamName('');
                      }}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newTeamName.trim() || creatingTeam}
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {creatingTeam ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                    isDarkTheme
                      ? 'text-indigo-300 hover:bg-zinc-800'
                      : 'text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span>Create new team</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}