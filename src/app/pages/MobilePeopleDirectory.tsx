import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, MessageCircle, RefreshCw, Search, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import { toast } from 'sonner';

interface Teammate {
  id: string;
  name: string | null;
  role: string | null;
  avatar: string | null;
  is_verified: boolean | null;
}

export default function MobilePeopleDirectory() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const onlineUserIds = useOnlineUsers();
  const [people, setPeople] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const loadPeople = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, name, role, avatar, is_verified')
      .order('name', { ascending: true });

    if (error) {
      console.error('Could not load mobile team directory:', error);
      setLoadError('Your team directory could not be loaded. Please try again.');
      toast.error('Could not load team members');
    } else {
      setPeople((data || []) as Teammate[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPeople();
    const channel = supabase
      .channel('mobile_people_directory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, loadPeople)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPeople]);

  const roles = useMemo(
    () => ['All', ...Array.from(new Set(people.map((person) => person.role || 'Member'))).sort()],
    [people]
  );
  const filteredPeople = people.filter((person) => {
    const role = person.role || 'Member';
    const searchText = `${person.name || ''} ${role}`.toLowerCase();
    return searchText.includes(search.trim().toLowerCase()) && (roleFilter === 'All' || role === roleFilter);
  });

  const startMessage = async (otherUserId: string) => {
    const { data: authData, error } = await supabase.auth.getUser();
    if (error || !authData.user) {
      toast.error('Sign in again to message a teammate');
      return;
    }
    const ids = [authData.user.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-start justify-between gap-3">
          <div>
            <div className={`mb-2 inline-flex items-center gap-1.5 text-xs font-semibold ${theme.textAccent}`}>
              <Users size={15} />
              The people behind the work
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">People</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? 'Meet and connect with your teammates.' : `${people.length} team ${people.length === 1 ? 'member' : 'members'} · ${onlineUserIds.size} online`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/team')}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Full directory
            <ArrowUpRight size={14} />
          </button>
        </header>

        <label className="relative block">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find a teammate"
            aria-label="Search teammates"
            className="min-h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2" role="group" aria-label="Filter teammates by role">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                aria-pressed={roleFilter === role}
                onClick={() => setRoleFilter(role)}
                className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  roleFilter === role
                    ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/40`
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading teammates">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center">
            <p className="text-sm font-semibold text-foreground">{loadError}</p>
            <button type="button" onClick={loadPeople} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
            <Users size={28} className={`mx-auto ${theme.textAccent}`} />
            <h2 className="mt-3 font-semibold text-card-foreground">No teammates found</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try a different name or role.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPeople.map((person) => {
              const isOnline = onlineUserIds.has(person.id);
              const name = person.name?.trim() || 'Team member';
              return (
                <article key={person.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-ring/40 hover:shadow-md sm:p-4">
                  <button
                    type="button"
                    aria-label={`View ${name}'s profile`}
                    onClick={() => navigate(`/profile/${person.id}`)}
                    className="relative h-12 w-12 shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <img
                      src={person.avatar || '/pfp.jpg'}
                      alt=""
                      className="h-full w-full rounded-2xl border border-border object-cover"
                      onError={(event) => {
                        event.currentTarget.src = '/pfp.jpg';
                      }}
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/profile/${person.id}`)}
                    className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate text-sm font-semibold text-card-foreground">{name}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                      {isOnline ? 'Online' : 'Away'} <span aria-hidden="true">·</span> {person.role || 'Member'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void startMessage(person.id)}
                    aria-label={`Message ${name}`}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border ${theme.bgSubtle} ${theme.textAccent} transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                  >
                    <MessageCircle size={17} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
