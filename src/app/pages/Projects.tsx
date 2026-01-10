import { useEffect, useState } from 'react';
import { FolderKanban, MoreHorizontal, Plus, Calendar, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- Real Data

interface Project {
  id: string;
  name: string;
  status: string;
  due_date: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);

    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
           <p className="text-gray-500">Manage and track your ongoing projects.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
          <Plus size={18} /> New Project
        </button>
      </div>

      {loading ? (
         <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FolderKanban size={24} />
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
              
              <div className="flex items-center gap-4 mb-6">
                 <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(project.status)}`}>
                   {project.status}
                 </span>
                 {project.due_date && (
                   <span className="flex items-center gap-1.5 text-xs text-gray-500">
                     <Calendar size={12} /> {new Date(project.due_date).toLocaleDateString()}
                   </span>
                 )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                 <div className="flex -space-x-2">
                    {/* Placeholder avatars for now */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800"></div>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> Updated recently
                 </div>
              </div>
            </div>
          ))}
          
          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300">
               <p>No projects found. Create one to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}