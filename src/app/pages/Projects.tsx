import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, MoreHorizontal, Plus, Calendar, Loader2,
  Search, ExternalLink, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  progress?: number;
  created_at?: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || p.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, monitor, and collaborate on ongoing projects.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Toolbar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1">
          {['All', 'Active', 'Planning', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <FolderKanban size={24} />
                  </div>

                  {/* 3-Dots Menu */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuId === project.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 overflow-hidden animate-in zoom-in-95 duration-150"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <ExternalLink size={14} /> Open Project
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.due_date && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} /> {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Footer */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium mb-1.5 text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/80">
                  <div className="flex -space-x-1.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800">
                      P
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800">
                      F
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    View Board →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No projects found</h3>
              <p className="text-xs text-gray-500 mt-1">Try a different search or create your first project.</p>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />
    </div>
  );
}