import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUsers, UserData } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, Briefcase, Clock, CheckCircle2, TrendingUp, 
  MapPin, Calendar, Edit2, Share2, MoreHorizontal, MessageSquare, Copy
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const users = getUsers();
    // If ID in URL -> Find that user. Else -> Show Current User.
    const foundUser = id ? users.find(u => u.id === id) : currentUser;
    
    if (foundUser) {
        setProfile(foundUser);
    }
  }, [id, currentUser]);

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleMessage = () => {
      // Navigate to chat and pass the user ID we want to talk to
      navigate(`/chat?dm=${profile?.id}`);
  };

  if (!profile) return <div className="p-8 text-center">Loading...</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
      
      {/* Dynamic Cover Image */}
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${profile.bannerUrl || 'https://images.unsplash.com/photo-1557683316-973673baf926'})` }}
      >
          <div className="absolute inset-0 bg-black/20"></div> {/* Overlay */}
          <div className="absolute top-6 right-6 flex gap-3">
              <button onClick={handleShare} className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg backdrop-blur-sm transition-colors flex items-center gap-2">
                  {copied ? <CheckCircle2 size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                  {copied && <span className="text-xs font-bold">Copied!</span>}
              </button>
              {isOwnProfile && (
                  <button className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg backdrop-blur-sm transition-colors">
                      <Edit2 size={20} />
                  </button>
              )}
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-12">
          {/* PROFILE INFO CARD */}
          <div className="relative -mt-20 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  
                  {/* Avatar & Status */}
                  <div className="relative">
                      <img src={profile.avatar} alt={profile.name} className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white" />
                      <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-4 border-white dark:border-gray-800 ${
                          profile.status === 'online' ? 'bg-emerald-500' : profile.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                      }`} title={profile.status}>
                          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                      </div>
                  </div>

                  {/* Text Info */}
                  <div className="flex-1 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{profile.name}</h1>
                      <div className="flex flex-wrap gap-4 text-gray-500 dark:text-gray-400 text-sm">
                          <span className="flex items-center gap-1.5"><Briefcase size={16} /> {profile.role}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={16} /> {profile.location || 'Remote'}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined {profile.joinedDate || 'Recently'}</span>
                      </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 w-full sm:w-auto">
                      {!isOwnProfile && (
                          <button onClick={handleMessage} className="flex-1 sm:flex-none py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                              <MessageSquare size={18} /> Message
                          </button>
                      )}
                      <button className="p-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>
              </div>
          </div>

          {/* DYNAMIC STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Clock className="text-blue-500" />} label="Working Hours" value={profile.stats.workingHours} />
              <StatCard icon={<TrendingUp className="text-emerald-500" />} label="Productivity" value={`${profile.stats.productivity}%`} />
              <StatCard icon={<CheckCircle2 className="text-purple-500" />} label="Tasks Done" value={profile.stats.tasksCompleted} />
              <StatCard icon={<Briefcase className="text-orange-500" />} label="Velocity" value={profile.stats.teamVelocity} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Contact Info */}
              <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                      <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm group cursor-pointer" onClick={() => { navigator.clipboard.writeText(profile.email) }}>
                              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500"><Mail size={16} /></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">Email</p>
                                  <p className="font-medium text-gray-900 dark:text-white truncate">{profile.email}</p>
                              </div>
                              <Copy size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                          </div>
                          {profile.phone && (
                              <div className="flex items-center gap-3 text-sm">
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500"><PhoneIcon /></div>
                                  <div>
                                      <p className="text-gray-500 dark:text-gray-400 text-xs">Phone</p>
                                      <p className="font-medium text-gray-900 dark:text-white">{profile.phone}</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              </div>

              {/* Current Project - DYNAMIC */}
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-4">Current Focus</h3>
                      {profile.stats.currentProject ? (
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/50 mb-4">
                              <div className="flex justify-between items-start mb-2">
                                  <div>
                                      <h4 className="font-bold text-indigo-900 dark:text-indigo-300">{profile.stats.currentProject.name}</h4>
                                      <p className="text-sm text-indigo-600 dark:text-indigo-400">Due: {profile.stats.currentProject.dueDate}</p>
                                  </div>
                                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                                      profile.stats.currentProject.status === 'Delayed' 
                                      ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' 
                                      : 'bg-white dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                                  }`}>
                                      {profile.stats.currentProject.status}
                                  </span>
                              </div>
                              <div className="w-full bg-indigo-200 dark:bg-indigo-900 rounded-full h-1.5 mt-2">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-1000 ${profile.stats.currentProject.status === 'Delayed' ? 'bg-red-500' : 'bg-indigo-600'}`} 
                                    style={{ width: `${profile.stats.currentProject.progress}%` }}
                                  ></div>
                              </div>
                              <div className="text-right mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold">{profile.stats.currentProject.progress}%</div>
                          </div>
                      ) : (
                          <p className="text-gray-500 italic">No active projects.</p>
                      )}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    )
}

function PhoneIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;
}