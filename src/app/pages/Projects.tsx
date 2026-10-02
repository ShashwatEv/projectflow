import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, Plus, Search, Calendar, 
  MoreVertical, ArrowRight, Loader2, User 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  due_date?: string;
  created_at: string;
  members: TeamMember[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // Query projects and join tasks to fetch all assigned team members
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          status,
          progress,
          due_date,
          created_at,
          tasks (
            assigned_to,
            assignee:users (
              id,
              name,
              avatar,
              role
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Deduplicate assigned users per project
        const formattedProjects: Project[] = data.map((proj: any) => {
          const membersMap = new Map<string, TeamMember>();

          if (Array.isArray(proj.tasks)) {
            proj.tasks.forEach((t: any) => {
              if (t?.assignee && t.assignee.id) {
                membersMap.set(t.assignee.id, {
                  id: t.assignee.id,
                  name: t.assignee.name || 'Team Member',
                  avatar: t.assignee.avatar,
                  role: t.assignee.role,
                });
              }
            });
          }

          return {
            id: proj.id,
            name: proj.name,
            description: proj.description,
            status: proj.status || 'active',
            progress: proj.progress ?? 0,
            due_date: proj.due_date,
            created_at: proj.created_at,
            members: Array.from(membersMap.values()),
          };
        });

        setProjects(formattedProjects);
      }
    } catch (err: any) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Listen for realtime task/project updates
    const channel = supabase
      .channel('projects_page_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage, monitor, and collaborate on ongoing projects.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 text-gray-400 pointer-events-none" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <FolderKanban className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Get started by creating your first team workspace and allocating tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800/80 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                    <FolderKanban size={22} />
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg">
                    <MoreVertical size={18} />
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 min-h-[32px] leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                {/* Status & Due Date */}
                <div className="flex items-center gap-3 mt-4 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {project.status}
                  </span>

                  {project.due_date && (
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Calendar size={13} />
                      {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500 dark:text-gray-400">Progress</span>
                    <span className="text-gray-900 dark:text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer: Real Contributors + View Board Link */}
              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                {/* Active Members Stack */}
                <div className="flex items-center -space-x-2">
                  {project.members.length > 0 ? (
                    <>
                      {project.members.slice(0, 3).map((m) => (
                        <div key={m.id} className="relative group/user" title={`${m.name} (${m.role || 'Member'})`}>
                          {m.avatar && m.avatar.startsWith('http') ? (
                            <img
                              src={m.avatar}
                              alt={m.name}
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-xs"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      ))}

                      {project.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <User size={12} /> No assignees
                    </span>
                  )}
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                >
                  View Board <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
}