import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Video,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import {
  createMeetingInviteUrl,
  formatMeetingCode,
  getMeetingInviteOrigin,
  normalizeMeetingCode,
} from '../../lib/meetingConfig';

interface ProjectOption {
  id: string;
  name: string;
}

interface MeetingSummary {
  id: string;
  project_id: string;
  title: string;
  created_by: string;
  created_at: string;
  ended_at: string | null;
  invite_code: string;
}

interface FoundMeeting {
  id: string;
  title: string;
  ended_at: string | null;
}

const MEETING_CODE_LENGTH = 16;

export default function MeetingsHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCodeFromUrl = searchParams.get('code') || '';
  const autoJoinAttempted = useRef('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [joinCode, setJoinCode] = useState(() => formatMeetingCode(inviteCodeFromUrl));
  const [creating, setCreating] = useState(false);
  const [joiningByCode, setJoiningByCode] = useState(false);

  const loadMeetings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [projectsResult, meetingsResult] = await Promise.all([
        supabase.from('projects').select('id, name').order('name'),
        supabase
          .from('project_meetings')
          .select('id, project_id, title, created_by, created_at, ended_at, invite_code')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);
      if (projectsResult.error) throw projectsResult.error;
      if (meetingsResult.error) throw meetingsResult.error;
      const projectRows = (projectsResult.data || []) as ProjectOption[];
      setProjects(projectRows);
      setMeetings((meetingsResult.data || []) as MeetingSummary[]);
      setSelectedProjectId((current) =>
        projectRows.some((project) => project.id === current) ? current : projectRows[0]?.id || ''
      );
    } catch (error) {
      console.error('Could not load the meetings hub:', error);
      toast.error('Could not load meetings. Check project access and apply the meeting codes and chat migration.');
      setProjects([]);
      setMeetings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  const openMeetingByCode = useCallback(async (code: string) => {
    const normalizedCode = normalizeMeetingCode(code);
    if (normalizedCode.length !== MEETING_CODE_LENGTH) {
      toast.error('Enter the 16-character meeting code.');
      return;
    }

    setJoiningByCode(true);
    try {
      const { data, error } = await supabase.rpc('find_project_meeting_by_code', {
        p_code: normalizedCode,
      });
      if (error) throw error;
      const meeting = (Array.isArray(data) ? data[0] : data) as FoundMeeting | null;
      if (!meeting?.id || meeting.ended_at) {
        toast.error('Meeting code is invalid or the room has ended. Guest invites require the latest Supabase migration.');
        return;
      }

      navigate(`/meetings/guest/${meeting.id}?code=${formatMeetingCode(normalizedCode)}`);
    } catch (error) {
      console.error('Could not join meeting by code:', error);
      toast.error(error instanceof Error ? error.message : 'Could not find that meeting.');
    } finally {
      setJoiningByCode(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!inviteCodeFromUrl || !user?.id || autoJoinAttempted.current === inviteCodeFromUrl) return;
    autoJoinAttempted.current = inviteCodeFromUrl;
    void openMeetingByCode(inviteCodeFromUrl);
  }, [inviteCodeFromUrl, openMeetingByCode, user?.id]);

  const createMeeting = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProjectId || !meetingTitle.trim()) return;
    setCreating(true);
    try {
      const { data: meetingId, error } = await supabase.rpc('create_project_meeting', {
        p_project_id: selectedProjectId,
        p_title: meetingTitle.trim(),
      });
      if (error) throw error;
      if (typeof meetingId !== 'string') throw new Error('The meeting could not be created.');
      const { data: meeting, error: meetingError } = await supabase
        .from('project_meetings')
        .select('invite_code')
        .eq('id', meetingId)
        .single();
      if (meetingError) throw meetingError;
      if (!meeting?.invite_code) throw new Error('The meeting was created, but its invite code could not be loaded.');
      navigate(`/meetings/guest/${meetingId}?code=${formatMeetingCode(meeting.invite_code)}`);
    } catch (error) {
      console.error('Could not create meeting from the hub:', error);
      toast.error(error instanceof Error ? error.message : 'Could not create meeting.');
    } finally {
      setCreating(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied.`);
    } catch (error) {
      console.error(`Could not copy meeting ${label.toLowerCase()}:`, error);
      toast.error(`Could not copy the ${label.toLowerCase()}.`);
    }
  };

  const projectsById = new Map(projects.map((project) => [project.id, project.name]));
  const activeMeetings = meetings.filter((meeting) => !meeting.ended_at);
  const inviteOrigin = getMeetingInviteOrigin(
    import.meta.env.VITE_APP_URL,
    Boolean(window.projectFlowDesktop?.isDesktop),
    window.location.origin
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-6 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Video size={14} aria-hidden="true" />
            ProjectFlow meetings
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Meetings</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            Start a project call or share a meeting code. Invitees can join the room without gaining access to the project workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadMeetings(true)}
          disabled={refreshing || loading}
          aria-label="Refresh meetings"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={15} />}
          Refresh
        </button>
      </header>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Start or join a meeting">
        <form
          onSubmit={(event) => void createMeeting(event)}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <Plus size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Start a meeting</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create a room for one of your projects.</p>
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Project</span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={loading || projects.length === 0}
              required
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            >
              {projects.length === 0 ? (
                <option value="">No accessible projects</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))
              )}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Meeting name</span>
            <input
              value={meetingTitle}
              onChange={(event) => setMeetingTitle(event.target.value)}
              maxLength={120}
              placeholder="Weekly project sync"
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={creating || loading || !selectedProjectId || !meetingTitle.trim()}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
            Create and continue
          </button>
        </form>

        <form
          onSubmit={(event: FormEvent) => { event.preventDefault(); void openMeetingByCode(joinCode); }}
          className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              <KeyRound size={19} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Join with a code</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Paste the code or open a meeting invite link.</p>
            </div>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Meeting code</span>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              maxLength={19}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABCD-1234-EF56-7890"
              aria-label="Meeting code"
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 font-mono text-sm tracking-wider text-gray-900 outline-none placeholder:font-sans placeholder:tracking-normal focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </label>
          <button
            type="submit"
            disabled={joiningByCode || normalizeMeetingCode(joinCode).length !== MEETING_CODE_LENGTH}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-50 px-4 text-sm font-semibold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            {joiningByCode ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            Find meeting
          </button>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            Anyone signed in with the code can join this meeting only. The invite does not grant access to project tasks, files, or other project data.
          </p>
        </form>
      </section>

      <section className="space-y-4" aria-labelledby="active-meetings-heading">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="active-meetings-heading" className="text-lg font-bold text-gray-900 dark:text-white">Open project meetings</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Rooms you can currently join or share with project teammates.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {activeMeetings.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-10 dark:border-gray-700 dark:bg-gray-800">
            <Loader2 className="animate-spin text-indigo-600" size={25} aria-label="Loading meetings" />
          </div>
        ) : activeMeetings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <CalendarClock size={25} className="mx-auto text-gray-400" aria-hidden="true" />
            <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200">No open meetings yet</p>
            <p className="mt-1 text-sm text-gray-500">Start a meeting above and share its code with your team.</p>
            {projects.length === 0 && (
              <Link to="/projects" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                View projects <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {activeMeetings.map((meeting) => {
              const code = formatMeetingCode(meeting.invite_code);
              const meetingUrl = createMeetingInviteUrl(code, inviteOrigin);
              return (
                <article key={meeting.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {projectsById.get(meeting.project_id) || 'Project'} · {new Date(meeting.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      Open
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Join code</p>
                      <p className="mt-1 font-mono text-sm font-bold tracking-widest text-gray-900 dark:text-white">{code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void copyText(code, 'Meeting code')}
                        aria-label={`Copy code for ${meeting.title}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Copy size={13} aria-hidden="true" /> Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyText(meetingUrl, 'Invite link')}
                        aria-label={`Copy invite link for ${meeting.title}`}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <Copy size={13} aria-hidden="true" /> Invite
                      </button>
                    </div>
                  </div>
                  <Link
                    to={`/meetings/guest/${meeting.id}?code=${code}`}
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Open meeting <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
