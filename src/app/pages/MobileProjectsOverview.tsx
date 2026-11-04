import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FolderKanban, Plus, RefreshCw, Search, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number | null;
  created_at: string;
}

type ProjectFilter = 'all' | 'active' | 'completed' | 'on_hold';

const FILTERS: { id: ProjectFilter; label: string }[] = [
  { id: 'all', label: 'All projects' },
  { id: 'active', label: 'Active' },
  { id: 'on_hold', label: 'On hold' },
  { id: 'completed', label: 'Completed' },
];

export default function MobileProjectsOverview() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [search, setSearch] = useState('');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, description, status, progress, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load mobile project overview:', error);
      setLoadError('Projects could not be loaded. Please try again.');
      toast.error('Could not load projects');
    } else {
      setProjects((data || []) as ProjectSummary[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
    const channel = supabase
      .channel('mobile_projects_overview')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadProjects]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesFilter = filter === 'all' || project.status === filter;
        const matchesSearch = `${project.name} ${project.description || ''}`
          .toLowerCase()
          .includes(search.trim().toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [filter, projects, search]
  );
  const activeCount = projects.filter((project) => project.status === 'active').length;
  const completedCount = projects.filter((project) => project.status === 'completed').length;

  const statusLabel = (status: string) => {
    if (status === 'on_hold') return 'On hold';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={`mb-2 inline-flex items-center gap-1.5 text-xs font-semibold ${theme.textAccent}`}>
              <Sparkles size={14} />
              Your work, at a glance
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">A focused overview of what your team is building.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            aria-label="Create or manage projects"
            className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${theme.btnPrimary} ${theme.ringAccent} sm:px-4`}
          >
            <Plus size={17} />
            <span className="hidden min-[380px]:inline">New project</span>
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3" aria-label="Project summary">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Total projects</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-card-foreground">{loading ? '—' : projects.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">Active now</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${theme.textAccent}`}>{loading ? '—' : activeCount}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{completedCount} completed</p>
          </div>
        </section>

        <label className="relative block">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects"
            aria-label="Search projects"
            className="min-h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-base text-foreground shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2" role="group" aria-label="Filter projects">
            {FILTERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  filter === id
                    ? `${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/40`
                    : 'border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3" aria-label="Loading projects">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-2xl border border-border bg-card" />
            ))}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-center">
            <p className="text-sm font-semibold text-foreground">{loadError}</p>
            <button type="button" onClick={loadProjects} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted">
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
            <FolderKanban size={28} className={`mx-auto ${theme.textAccent}`} />
            <h2 className="mt-3 font-semibold text-card-foreground">{search ? 'No matching projects' : 'Nothing here yet'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? 'Try another search or choose a different filter.' : 'Create a project to give your next idea a home.'}
            </p>
            {!search && (
              <button type="button" onClick={() => navigate('/projects')} className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white ${theme.btnPrimary}`}>
                <Plus size={16} />
                Create a project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => {
              const progress = Number.isFinite(project.progress)
                ? Math.min(100, Math.max(0, project.progress || 0))
                : null;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-base font-semibold text-card-foreground">{project.name}</span>
                      <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
                        {project.description || 'No project description yet.'}
                      </span>
                    </span>
                    <ArrowRight size={18} className={`mt-0.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 ${theme.textAccent}`} />
                  </span>
                  <span className="mt-4 flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      project.status === 'active'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-border bg-muted text-muted-foreground'
                    }`}>
                      {statusLabel(project.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">{progress === null ? 'Progress not set' : `${progress}% complete`}</span>
                  </span>
                  {progress !== null && (
                    <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-muted">
                      <span className={`block h-full rounded-full ${theme.progressBar} transition-[width] duration-500`} style={{ width: `${progress}%` }} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
