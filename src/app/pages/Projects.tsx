import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, Calendar, ArrowRight, MoreVertical, 
  Trash2, Loader2, Search 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  progress?: number;
  created_at: string;
  owner_id?: string;
  github_repo?: string;
  owner?: {
    name?: string;
    avatar?: string;
  };
}

export default function Projects() {
  const navigate = useNavigate();
  const theme = useAccentTheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectRepo, setNewProjectRepo] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      // 1. Fetch projects directly
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectError) throw projectError;

      // 2. Fetch users to map owner details cleanly without foreign-key join errors
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, avatar');

      const userMap = new Map((userData || []).map((u) => [u.id, u]));

      const merged: Project[] = (projectData || []).map((p) => {
        const ownerUser = p.owner_id ? userMap.get(p.owner_id) : undefined;
        return {
          ...p,
          owner: ownerUser ? { name: ownerUser.name, avatar: ownerUser.avatar } : undefined,
        };
      });

      setProjects(merged);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          github_repo: newProjectRepo.trim() || null,
          status: 'active',
          progress: 0,
          owner_id: currentUserId,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectRepo('');
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-gray-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
            <FolderKanban size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
            <p className="text-xs text-gray-400">Manage, collaborate, and track milestones across your workspace.</p>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-[#161b22] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none ${theme.ringAccent} transition-all`}
          />
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-2">
          {(['all', 'active', 'completed', 'on_hold'] as const).map((filterKey) => {
            const isActive = statusFilter === filterKey;
            return (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive
                    ? `${theme.btnPrimary} shadow-sm`
                    : 'bg-[#161b22] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <Loader2 size={28} className={`animate-spin ${theme.textAccent}`} />
          <p className="text-xs">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center bg-[#161b22] border border-gray-800 rounded-2xl p-8 space-y-3">
          <FolderKanban size={36} className="mx-auto text-gray-500" />
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {searchQuery ? 'No projects match your search criteria.' : 'Create your first project to start tracking sprints.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const progressVal = p.progress || 0;
            return (
              <div
                key={p.id}
                className="bg-[#161b22] border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30`}>
                      <FolderKanban size={20} />
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'active' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60' 
                        : p.status === 'completed'
                        ? 'bg-blue-950/40 text-blue-400 border border-blue-800/60'
                        : 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-gray-100 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Date Metadata */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={13} />
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>Progress</span>
                      <span>{progressVal}%</span>
                    </div>
                    <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${theme.progressBar} transition-all duration-500`}
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-800/80">
                  {/* Owner Avatar */}
                  <div className="flex items-center gap-2">
                    <img
                      src={p.owner?.avatar || '/pfp.jpg'}
                      alt={p.owner?.name || 'Owner'}
                      className="w-6 h-6 rounded-full object-cover border border-gray-700"
                    />
                    <span className="text-xs text-gray-400 font-medium truncate max-w-[100px]">
                      {p.owner?.name || 'Workspace'}
                    </span>
                  </div>

                  {/* View Board Link */}
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className={`flex items-center gap-1 text-xs font-bold ${theme.textAccent} ${theme.textHover} transition-colors group/link`}
                  >
                    <span>View Board</span>
                    <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-white">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Gen Mobile App"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is the goal of this project?"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none ${theme.ringAccent}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">GitHub Repository (owner/repo)</label>
                <input
                  type="text"
                  placeholder="e.g. octocat/Hello-World"
                  value={newProjectRepo}
                  onChange={(e) => setNewProjectRepo(e.target.value)}
                  className={`w-full bg-[#0d1117] border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none font-mono ${theme.ringAccent}`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newProjectName.trim()}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md active:scale-95`}
                >
                  {creating && <Loader2 size={13} className="animate-spin" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}