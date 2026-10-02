import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, Plus, Calendar, ArrowRight, MoreVertical, 
  Trash2, Loader2, Search, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import CreateProjectModal from '../components/CreateProjectModal';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'archived';
  progress: number;
  created_at: string;
  owner_id?: string;
  owner?: {
    name?: string;
    avatar?: string;
  };
}

export default function Projects() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // 1. Fetch Projects & Join Owner Avatar
  const fetchProjects = async () => {
  try {
    // Attempt join with owner relation
    let { data, error } = await supabase
      .from('projects')
      .select('*, owner:users!owner_id(name, avatar)')
      .order('created_at', { ascending: false });

    // Fallback to plain query if relationship is not mapped
    if (error) {
      console.warn('Foreign key relation missing, falling back to direct select:', error.message);
      const fallback = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      data = fallback.data;
    }

    setProjects(data || []);
  } catch (err: any) {
    console.error('Error fetching projects:', err);
    toast.error('Failed to load projects');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProjects();

    // Realtime changes listener
    const channel = supabase
      .channel('projects_page_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 2. Delete Project Handler
  const handleDeleteProject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success(`Project "${name}" deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete project');
    } finally {
      setActiveMenuId(null);
    }
  };

  // Filter projects by search input and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ? true : project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
      case 'on_hold':
        return 'bg-amber-950/60 text-amber-400 border-amber-800';
      case 'archived':
        return 'bg-gray-800 text-gray-400 border-gray-700';
      default:
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="text-orange-500" size={28} />
            Projects
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage, collaborate, and track milestones across your workspace.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'active', 'completed', 'on_hold'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#161b22] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-[#161b22] border border-dashed border-gray-800 rounded-3xl">
          <FolderKanban size={36} className="mx-auto text-gray-500 mb-3 opacity-60" />
          <h3 className="text-sm font-bold text-gray-200">No projects found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Get started by creating your first project to track tasks and collaborate with team members.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const resolvedAvatar = 
              project.owner?.avatar || 
              (project.owner_id === user?.id ? user?.avatar : null) || 
              '/pfp.jpg';

            const resolvedName = 
              project.owner?.name || 
              (project.owner_id === user?.id ? user?.name : 'Owner') || 
              'U';

            return (
              <div
                key={project.id}
                className="group relative bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800/80 hover:border-gray-700 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Row with Icon and Menu */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d1117] border border-gray-800 flex items-center justify-center text-orange-500">
                      <FolderKanban size={22} />
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === project.id ? null : project.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === project.id && (
                        <div className="absolute right-0 top-full mt-1.5 w-36 bg-[#0d1117] border border-gray-800 rounded-xl shadow-2xl py-1 z-20 animate-in zoom-in-95 duration-150">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/projects/${project.id}`);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs text-gray-300 hover:bg-gray-800/80 flex items-center gap-2"
                          >
                            <ArrowRight size={13} /> View Board
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id, project.name)}
                            className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-orange-500 transition-colors line-clamp-1"
                    title={project.name}
                  >
                    {project.name}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 min-h-[32px]">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* Status & Date */}
                  <div className="flex items-center gap-3 mt-4 text-[11px]">
                    <span
                      className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border text-[10px] ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status || 'ACTIVE'}
                    </span>

                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Calendar size={13} />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-400">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with Fixed Local Public Avatar Image */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2" title={`Owner: ${resolvedName}`}>
                    <img
                      src={resolvedAvatar}
                      onError={(e) => {
                        e.currentTarget.src = '/pfp.jpg';
                      }}
                      alt={resolvedName}
                      className="w-7 h-7 rounded-full object-cover border border-gray-700 bg-gray-800 shadow-sm"
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>View Board</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for creating projects */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
}