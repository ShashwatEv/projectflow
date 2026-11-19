import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Camera,
  Check,
  Clock,
  Copy,
  Hand,
  Info,
  LayoutGrid,
  Loader2,
  Lock,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  MonitorUp,
  PhoneOff,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Search,
  Send,
  Smile,
  Sparkles,
  Square,
  Users,
  Video,
  VideoOff,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useMeeting } from '../../context/MeetingContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import {
  createMeetingInviteUrl,
  formatMeetingCode,
  getMeetingInviteOrigin,
  normalizeMeetingCode,
} from '../../lib/meetingConfig';

interface Meeting {
  id: string;
  project_id: string;
  title: string;
  created_by: string;
  created_at: string;
  ended_at: string | null;
  invite_code: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '👏', '🔥', '🚀'] as const;

function useSafeMeetingTheme(): 'light' | 'dark' {
  try {
    const { theme } = useTheme();
    return theme;
  } catch {
    const isDark =
      typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return isDark ? 'dark' : 'light';
  }
}

interface VideoTileProps {
  id: string;
  name: string;
  avatar: string;
  stream: MediaStream | null;
  muted?: boolean;
  cameraEnabled?: boolean;
  screenSharing?: boolean;
  local?: boolean;
  handRaised?: boolean;
  audioMuted?: boolean;
  pinned?: boolean;
  onPin?: () => void;
  onUnpin?: () => void;
  isSpotlight?: boolean;
  isDarkTheme: boolean;
}

function VideoTile({
  name,
  avatar,
  stream,
  muted = false,
  cameraEnabled = true,
  screenSharing = false,
  local = false,
  handRaised = false,
  audioMuted = false,
  pinned = false,
  onPin,
  onUnpin,
  isSpotlight = false,
  isDarkTheme,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0 });
  const hasVideo = Boolean(stream?.getVideoTracks().length && (cameraEnabled || screenSharing));

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    if (stream) void videoRef.current.play().catch(() => undefined);
  }, [stream]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoom((z) => {
        const next = Math.min(3, Math.max(1, +(z + delta).toFixed(2)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((z) => {
      const next = Math.max(1, +(z - 0.25).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(1.75);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const maxBound = (zoom - 1) * 250;
    setPan({
      x: Math.max(-maxBound, Math.min(maxBound, dragStartRef.current.panX + dx)),
      y: Math.max(-maxBound, Math.min(maxBound, dragStartRef.current.panY + dy)),
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      className={`group relative overflow-hidden rounded-2xl border transition-all select-none ${
        isDarkTheme
          ? 'bg-zinc-900/90 text-white shadow-lg'
          : 'bg-white text-slate-900 shadow-sm'
      } ${
        pinned
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10'
          : isDarkTheme
          ? 'border-zinc-800 hover:border-zinc-700'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${isSpotlight ? 'w-full h-full' : ''} ${
        zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      style={{
        aspectRatio: isSpotlight ? '16/9' : '16/10',
      }}
    >
      {/* Video & Media Layer with Zoom & Pan */}
      <div
        className="flex h-full w-full items-center justify-center transition-transform"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        {stream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            aria-label={`${name}${local ? ' (you)' : ''} video`}
            className={`pointer-events-none h-full w-full object-contain ${hasVideo ? '' : 'invisible'}`}
          />
        )}
      </div>

      {/* Avatar Fallback when Camera is Off */}
      {!hasVideo && (
        <div
          className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 ${
            isDarkTheme
              ? 'bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950'
              : 'bg-gradient-to-b from-slate-50 via-white to-slate-100/90'
          }`}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className={`rounded-full object-cover ring-2 ${
                isDarkTheme ? 'ring-zinc-700' : 'ring-slate-200'
              } ${isSpotlight ? 'h-28 w-28' : 'h-16 w-16'}`}
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 font-bold text-white shadow-md ${
                isSpotlight ? 'h-28 w-28 text-3xl' : 'h-16 w-16 text-xl'
              }`}
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isDarkTheme ? 'bg-zinc-800/90 text-zinc-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {screenSharing ? 'Presenting screen' : 'Camera off'}
          </span>
        </div>
      )}

      {/* Top Left Badges: Hand Raised */}
      {handRaised && (
        <div className="absolute left-3 top-3 flex animate-pulse items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-zinc-950 shadow-lg backdrop-blur-md">
          <Hand size={13} />
          <span>Raised</span>
        </div>
      )}

      {/* Audio Muted Indicator */}
      {audioMuted && !local && (
        <div className="absolute bottom-12 left-3 rounded-full bg-red-600/90 p-1.5 text-white shadow-md backdrop-blur-sm">
          <MicOff size={13} />
        </div>
      )}

      {/* Top Right: Zoom In/Out & Pin Toolbar (Hover or Zoomed) */}
      <div
        className={`absolute right-3 top-3 z-20 flex items-center gap-1 rounded-xl border p-1 shadow-xl backdrop-blur-md transition-opacity ${
          isDarkTheme
            ? 'border-zinc-700/80 bg-zinc-900/90 text-zinc-100'
            : 'border-slate-200 bg-white/95 text-slate-800'
        } ${zoom > 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          title="Zoom out"
          className="rounded-lg p-1 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
        >
          <ZoomOut size={13} />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset zoom (100%)"
          className="rounded px-1.5 py-0.5 font-mono text-[11px] font-medium transition hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          title="Zoom in"
          className="rounded-lg p-1 transition hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
        >
          <ZoomIn size={13} />
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset"
            className="rounded-lg p-1 text-indigo-500 transition hover:bg-slate-100 dark:text-indigo-400 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={12} />
          </button>
        )}
        {!local && (onPin || onUnpin) && (
          <button
            type="button"
            onClick={pinned ? onUnpin : onPin}
            title={pinned ? 'Unpin participant' : 'Pin to spotlight'}
            className={`rounded-lg p-1 transition ${
              pinned
                ? 'bg-indigo-600 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            {pinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
        )}
      </div>

      {/* Bottom Name Bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 pb-2.5 pt-6 text-xs font-medium text-white">
        <span className="max-w-[180px] truncate drop-shadow-xs">
          {name}
          {local ? ' (You)' : ''}
        </span>
        <div className="flex items-center gap-1.5">
          {screenSharing && (
            <span className="rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              Screen
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProjectMeetingsProps {
  guestMode?: boolean;
}

type MeetingCodeResult = Pick<Meeting, 'id' | 'title' | 'created_at' | 'ended_at'>;

export default function ProjectMeetings({ guestMode = false }: ProjectMeetingsProps) {
  const { id: routeId } = useParams<{ id: string }>();
  const projectId = guestMode ? undefined : routeId;
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteCode = normalizeMeetingCode(searchParams.get('code') || '');
  const requestedMeetingId = searchParams.get('join');
  const { user } = useAuth();
  const theme = useSafeMeetingTheme();
  const isDarkTheme = theme === 'dark';

  const {
    activeMeeting,
    joining,
    leaving,
    participants,
    remoteStreams,
    localStream,
    screenStream,
    audioEnabled,
    videoEnabled,
    screenSharing,
    handRaised,
    chatMessages,
    unreadChatCount,
    setUnreadChatCount,
    floatingReactions,
    polls,
    unreadPollCount,
    setUnreadPollCount,
    elapsedTime,
    setIsMinimized,
    joinMeetingSession,
    leaveMeetingSession,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    toggleHandRaise,
    sendReaction,
    sendChatMessage,
    createPoll,
    votePoll,
    closePoll,
  } = useMeeting();

  const [projectName, setProjectName] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingMeeting, setPendingMeeting] = useState<Meeting | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Stage & Drawer UI Controls
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'people' | 'polls' | 'info' | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [stageZoom, setStageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCodeFeedback, setCopiedCodeFeedback] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  // Live Poll Composer State
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [showPollComposer, setShowPollComposer] = useState(false);

  const guestPromptedFor = useRef('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const loadProjectAndMeetings = useCallback(async () => {
    if (guestMode) {
      setLoading(true);
      try {
        if (!routeId || inviteCode.length !== 16) {
          setProjectName('');
          setMeetings([]);
          return;
        }
        const { data, error } = await supabase.rpc('find_project_meeting_by_code', {
          p_code: inviteCode,
        });
        if (error) throw error;
        const foundMeeting = (Array.isArray(data) ? data[0] : data) as MeetingCodeResult | null;
        if (!foundMeeting || foundMeeting.id !== routeId || foundMeeting.ended_at) {
          setProjectName('');
          setMeetings([]);
          return;
        }

        const meeting: Meeting = {
          ...foundMeeting,
          project_id: '',
          created_by: '',
          invite_code: inviteCode,
        };
        setProjectName('Invited meeting');
        setMeetings([meeting]);
        const promptKey = `${routeId}:${inviteCode}`;
        if (guestPromptedFor.current !== promptKey && activeMeeting?.id !== meeting.id) {
          guestPromptedFor.current = promptKey;
          setPendingMeeting(meeting);
        }
      } catch (error) {
        console.error('Could not load invited meeting:', error);
        toast.error(error instanceof Error ? error.message : 'Could not load this meeting invite.');
        setProjectName('');
        setMeetings([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!projectId) return;
    setLoading(true);
    try {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .maybeSingle();
      if (projectError) throw projectError;
      if (!project) {
        setProjectName('');
        setMeetings([]);
        return;
      }

      setProjectName(project.name);
      const { data, error } = await supabase
        .from('project_meetings')
        .select('id, project_id, title, created_by, created_at, ended_at, invite_code')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Could not load project meetings:', error);
      toast.error('Could not load meetings. Check project access and apply the meetings migration.');
      setProjectName('');
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [activeMeeting?.id, guestMode, inviteCode, projectId, routeId]);

  useEffect(() => {
    void loadProjectAndMeetings();
  }, [loadProjectAndMeetings]);

  useEffect(() => {
    if (guestMode || loading || !requestedMeetingId) return;
    const meeting = meetings.find((candidate) => candidate.id === requestedMeetingId);
    if (meeting && !meeting.ended_at) {
      setPendingMeeting(meeting);
    } else {
      toast.error('That meeting is no longer available in this project.');
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('join');
    setSearchParams(nextSearchParams, { replace: true });
  }, [guestMode, loading, meetings, requestedMeetingId, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeSidebarTab === 'chat') {
      setUnreadChatCount(0);
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    if (activeSidebarTab === 'polls') {
      setUnreadPollCount(0);
    }
  }, [chatMessages, activeSidebarTab, setUnreadChatCount, setUnreadPollCount]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      meetingContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const createMeeting = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !meetingTitle.trim()) return;
    setCreating(true);
    try {
      const { data: meetingId, error: createError } = await supabase.rpc('create_project_meeting', {
        p_project_id: projectId,
        p_title: meetingTitle.trim(),
      });
      if (createError) throw createError;

      const { data, error } = await supabase
        .from('project_meetings')
        .select('id, project_id, title, created_by, created_at, ended_at, invite_code')
        .eq('id', meetingId)
        .single();
      if (error) throw error;
      setMeetings((current) => [data, ...current]);
      setMeetingTitle('');
      setPendingMeeting(data);
      toast.success('Meeting created. Join when you are ready.');
    } catch (error) {
      console.error('Could not create meeting:', error);
      toast.error(error instanceof Error ? error.message : 'Could not create meeting.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!pendingMeeting || !consentGiven) return;
    const returnPath = `${location.pathname}${location.search}`;
    const ok = await joinMeetingSession({
      meeting: {
        ...pendingMeeting,
        guestMode,
        returnPath,
      },
      inviteCode,
    });
    if (ok) {
      setPendingMeeting(null);
      setConsentGiven(false);
    }
  };

  const handleLeaveMeeting = async (endMeeting = false) => {
    await leaveMeetingSession(endMeeting);
    setActiveSidebarTab(null);
    setShowReactionPicker(false);
    setPinnedUserId(null);
    setViewMode('grid');
    setStageZoom(1);
    await loadProjectAndMeetings();
  };

  const handleSendChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!chatDraft.trim()) return;
    setSendingChat(true);
    const sent = await sendChatMessage(chatDraft);
    if (sent) setChatDraft('');
    setSendingChat(false);
  };

  const handleCreatePoll = async (event: React.FormEvent) => {
    event.preventDefault();
    const validOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    if (!pollQuestion.trim() || validOptions.length < 2) {
      toast.error('Enter a question and at least two options.');
      return;
    }
    await createPoll(pollQuestion, validOptions);
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollComposer(false);
  };

  const copyMeetingValue = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCodeFeedback(true);
      setTimeout(() => setCopiedCodeFeedback(false), 2000);
      toast.success(`${label} copied to clipboard.`);
    } catch (error) {
      console.error(`Could not copy meeting ${label.toLowerCase()}:`, error);
      toast.error(`Could not copy the ${label.toLowerCase()}.`);
    }
  };

  const inviteOrigin = getMeetingInviteOrigin(
    import.meta.env.VITE_APP_URL,
    Boolean(window.projectFlowDesktop?.isDesktop),
    window.location.origin
  );
  const meetingCode = activeMeeting ? formatMeetingCode(activeMeeting.invite_code) : '';
  const meetingInviteUrl = activeMeeting
    ? createMeetingInviteUrl(activeMeeting.invite_code, inviteOrigin)
    : '';

  const spotlightUserId =
    pinnedUserId ||
    participants.find((p) => p.screenSharing)?.userId ||
    participants.find((p) => p.userId !== user?.id)?.userId ||
    user?.id;

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const someoneRaisedHand = participants.find((p) => p.handRaised && p.userId !== user?.id);
  const openPollsCount = polls.filter((p) => !p.closed).length;

  const stageSurfaceClass = isDarkTheme ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900';

  const chromeBarClass = isDarkTheme
    ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100'
    : 'bg-white/95 border-slate-200 text-slate-900';

  const utilityPillClass = isDarkTheme
    ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-300 hover:bg-zinc-700 hover:text-white'
    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900';

  const dockNeutralButtonClass = isDarkTheme
    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/70'
    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={38} />
      </div>
    );
  }

  if (!projectName) {
    return (
      <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="mb-4 text-slate-600 dark:text-zinc-400">
          {guestMode
            ? 'This meeting invite is invalid or has ended. If it should be active, ask the host to check the invite link.'
            : 'Project not found or you do not have access.'}
        </p>
        <Link
          to={guestMode ? '/meetings' : '/projects'}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={16} /> {guestMode ? 'Back to Meetings' : 'Back to Projects'}
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pfFloatReaction {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          85% { transform: translateY(-180px) scale(1); opacity: 0.9; }
          100% { transform: translateY(-250px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* ACTIVE CALL STAGE */}
      {activeMeeting ? (
        <div
          ref={meetingContainerRef}
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden select-none font-sans transition-colors duration-200 ${stageSurfaceClass}`}
        >
          {/* Top Bar */}
          <header
            className={`relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3 backdrop-blur-md transition-colors ${chromeBarClass}`}
          >
            {/* Left: Miniplayer trigger + Meeting Name & Live indicator */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                onClick={() => setIsMinimized(true)}
                title="Minimize to corner miniplayer and browse workspace"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${utilityPillClass}`}
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Miniplayer</span>
              </Link>

              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <h1 className="max-w-[200px] truncate text-base font-semibold tracking-wide sm:max-w-xs md:max-w-md">
                  {activeMeeting.title}
                </h1>
              </div>

              {guestMode && (
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
                  Guest
                </span>
              )}
            </div>

            {/* Hand Raised Announcement Banner */}
            {someoneRaisedHand && (
              <div className="hidden animate-pulse items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 md:flex">
                <Hand size={14} />
                <span>{someoneRaisedHand.name} raised hand</span>
              </div>
            )}

            {/* Right: Stage Zoom, View Mode & Fullscreen Controls */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center rounded-xl border p-0.5 text-xs ${utilityPillClass}`}>
                <button
                  type="button"
                  onClick={() => setStageZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
                  title="Zoom out stage"
                  className="rounded-lg p-1.5 transition disabled:opacity-30"
                  disabled={stageZoom <= 0.75}
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setStageZoom(1)}
                  title="Reset stage zoom to 100%"
                  className="px-2 py-1 font-mono font-medium"
                >
                  {Math.round(stageZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setStageZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
                  title="Zoom in stage"
                  className="rounded-lg p-1.5 transition disabled:opacity-30"
                  disabled={stageZoom >= 1.5}
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              <div className={`flex items-center rounded-xl border p-0.5 text-xs ${utilityPillClass}`}>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    setPinnedUserId(null);
                  }}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition ${
                    viewMode === 'grid' && !pinnedUserId ? 'bg-indigo-600 font-medium text-white' : ''
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('speaker')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition ${
                    viewMode === 'speaker' || pinnedUserId ? 'bg-indigo-600 font-medium text-white' : ''
                  }`}
                  title="Spotlight view"
                >
                  <Square size={14} />
                  <span className="hidden sm:inline">Spotlight</span>
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className={`rounded-xl border p-2 transition ${utilityPillClass}`}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </header>

          {/* Central Call Stage (Video Grid & Sidebars) */}
          <div className="relative flex flex-1 overflow-hidden">
            {floatingReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="pointer-events-none absolute bottom-24 z-50 flex flex-col items-center"
                style={{
                  left: `${reaction.x}%`,
                  animation: 'pfFloatReaction 3.2s ease-out forwards',
                }}
              >
                <span className="text-4xl drop-shadow-lg">{reaction.emoji}</span>
                <span className="mt-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {reaction.senderName}
                </span>
              </div>
            ))}

            <main
              className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 transition-all duration-300 md:p-6"
              style={{
                transform: `scale(${stageZoom})`,
                transformOrigin: 'center center',
              }}
            >
              {viewMode === 'speaker' || pinnedUserId ? (
                <div className="flex h-full w-full max-w-6xl flex-col gap-4">
                  <div className="min-h-[360px] w-full flex-1">
                    {spotlightUserId === user?.id ? (
                      <VideoTile
                        id={user?.id || 'local'}
                        name={user?.name || 'You'}
                        avatar={user?.avatar || ''}
                        stream={screenStream || localStream}
                        muted
                        cameraEnabled={videoEnabled}
                        screenSharing={screenSharing}
                        local
                        handRaised={handRaised}
                        isSpotlight
                        isDarkTheme={isDarkTheme}
                      />
                    ) : (
                      (() => {
                        const spotParticipant = participants.find((p) => p.userId === spotlightUserId);
                        return spotParticipant ? (
                          <VideoTile
                            id={spotParticipant.userId}
                            name={spotParticipant.name || 'ProjectFlow member'}
                            avatar={spotParticipant.avatar}
                            stream={remoteStreams.get(spotParticipant.userId) || null}
                            cameraEnabled={spotParticipant.videoEnabled}
                            screenSharing={spotParticipant.screenSharing}
                            audioMuted={!spotParticipant.audioEnabled}
                            handRaised={spotParticipant.handRaised}
                            pinned={pinnedUserId === spotParticipant.userId}
                            onPin={() => setPinnedUserId(spotParticipant.userId)}
                            onUnpin={() => setPinnedUserId(null)}
                            isSpotlight
                            isDarkTheme={isDarkTheme}
                          />
                        ) : null;
                      })()
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 overflow-x-auto px-1 pb-2 pt-1">
                    {spotlightUserId !== user?.id && (
                      <div className="w-44 shrink-0">
                        <VideoTile
                          id={user?.id || 'local'}
                          name={user?.name || 'You'}
                          avatar={user?.avatar || ''}
                          stream={screenStream || localStream}
                          muted
                          cameraEnabled={videoEnabled}
                          screenSharing={screenSharing}
                          local
                          handRaised={handRaised}
                          isDarkTheme={isDarkTheme}
                        />
                      </div>
                    )}
                    {participants
                      .filter((p) => p.userId !== user?.id && p.userId !== spotlightUserId)
                      .map((participant) => (
                        <div key={participant.userId} className="w-44 shrink-0">
                          <VideoTile
                            id={participant.userId}
                            name={participant.name || 'ProjectFlow member'}
                            avatar={participant.avatar}
                            stream={remoteStreams.get(participant.userId) || null}
                            cameraEnabled={participant.videoEnabled}
                            screenSharing={participant.screenSharing}
                            audioMuted={!participant.audioEnabled}
                            handRaised={participant.handRaised}
                            pinned={pinnedUserId === participant.userId}
                            onPin={() => setPinnedUserId(participant.userId)}
                            onUnpin={() => setPinnedUserId(null)}
                            isDarkTheme={isDarkTheme}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`grid w-full max-w-6xl items-center justify-center gap-4 ${
                    participants.length <= 1
                      ? 'max-w-3xl grid-cols-1'
                      : participants.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : participants.length <= 4
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  <VideoTile
                    id={user?.id || 'local'}
                    name={user?.name || 'You'}
                    avatar={user?.avatar || ''}
                    stream={screenStream || localStream}
                    muted
                    cameraEnabled={videoEnabled}
                    screenSharing={screenSharing}
                    local
                    handRaised={handRaised}
                    isDarkTheme={isDarkTheme}
                  />

                  {participants
                    .filter((participant) => participant.userId !== user?.id)
                    .map((participant) => (
                      <VideoTile
                        key={participant.userId}
                        id={participant.userId}
                        name={participant.name || 'ProjectFlow member'}
                        avatar={participant.avatar}
                        stream={remoteStreams.get(participant.userId) || null}
                        cameraEnabled={participant.videoEnabled}
                        screenSharing={participant.screenSharing}
                        audioMuted={!participant.audioEnabled}
                        handRaised={participant.handRaised}
                        pinned={pinnedUserId === participant.userId}
                        onPin={() => {
                          setPinnedUserId(participant.userId);
                          setViewMode('speaker');
                        }}
                        onUnpin={() => setPinnedUserId(null)}
                        isDarkTheme={isDarkTheme}
                      />
                    ))}
                </div>
              )}
            </main>

            {/* SIDEBAR DRAWER (People | Chat | Polls | Details) */}
            {activeSidebarTab && (
              <aside
                className={`z-40 flex w-full shrink-0 flex-col border-l shadow-2xl transition-all duration-300 sm:w-96 ${
                  isDarkTheme
                    ? 'border-zinc-800 bg-zinc-900 text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b px-4 py-4 ${
                    isDarkTheme ? 'border-zinc-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('people')}
                      className={`border-b-2 pb-1 text-xs font-semibold transition ${
                        activeSidebarTab === 'people'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      People ({participants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab('chat');
                        setUnreadChatCount(0);
                      }}
                      className={`relative border-b-2 pb-1 text-xs font-semibold transition ${
                        activeSidebarTab === 'chat'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Chat
                      {unreadChatCount > 0 && (
                        <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unreadChatCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSidebarTab('polls');
                        setUnreadPollCount(0);
                      }}
                      className={`relative border-b-2 pb-1 text-xs font-semibold transition ${
                        activeSidebarTab === 'polls'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Polls ({openPollsCount})
                      {unreadPollCount > 0 && (
                        <span className="ml-1 rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {unreadPollCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('info')}
                      className={`border-b-2 pb-1 text-xs font-semibold transition ${
                        activeSidebarTab === 'info'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Details
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSidebarTab(null)}
                    className="rounded-xl p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                    title="Close panel"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* TAB 1: PEOPLE */}
                {activeSidebarTab === 'people' && (
                  <div className="flex flex-1 flex-col overflow-y-auto p-4">
                    <div className="relative mb-3">
                      <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search people..."
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                        className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm outline-none transition ${
                          isDarkTheme
                            ? 'border-zinc-700 bg-zinc-800/80 text-white focus:border-indigo-500'
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      In this meeting ({filteredParticipants.length})
                    </p>

                    <div className="space-y-1">
                      {filteredParticipants.map((p) => {
                        const isSelf = p.userId === user?.id;
                        return (
                          <div
                            key={p.userId}
                            className={`flex items-center justify-between rounded-xl p-2.5 transition ${
                              isDarkTheme ? 'hover:bg-zinc-800/60' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                  {p.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {p.name} {isSelf ? '(You)' : ''}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {isSelf ? 'Host / Member' : 'Participant'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400">
                              {p.handRaised && (
                                <span className="text-amber-500" title="Hand raised">
                                  <Hand size={15} />
                                </span>
                              )}
                              {p.audioEnabled ? (
                                <span title="Microphone on">
                                  <Mic size={15} className="text-emerald-500" />
                                </span>
                              ) : (
                                <span title="Microphone muted">
                                  <MicOff size={15} className="text-red-500" />
                                </span>
                              )}
                              {p.videoEnabled ? (
                                <span title="Camera on">
                                  <Video size={15} className="text-emerald-500" />
                                </span>
                              ) : (
                                <span title="Camera off">
                                  <VideoOff size={15} className="text-slate-400" />
                                </span>
                              )}
                              {!isSelf && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPinnedUserId(pinnedUserId === p.userId ? null : p.userId);
                                    setViewMode('speaker');
                                  }}
                                  title={pinnedUserId === p.userId ? 'Unpin' : 'Pin to spotlight'}
                                  className={`rounded-lg p-1 ${
                                    pinnedUserId === p.userId
                                      ? 'text-indigo-500'
                                      : 'hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-zinc-700/60 dark:hover:text-white'
                                  }`}
                                >
                                  <Pin size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: IN-CALL CHAT */}
                {activeSidebarTab === 'chat' && (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div
                      className={`border-b px-4 py-2 text-xs ${
                        isDarkTheme
                          ? 'border-zinc-800 bg-zinc-800/40 text-zinc-400'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      Messages can only be seen by people in this call and are deleted when the call ends.
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-400">
                          <MessageSquare size={32} className="mb-2 opacity-40" />
                          <p className="text-sm font-medium">No messages yet</p>
                          <p className="mt-1 text-xs">Send a message to everyone in this call</p>
                        </div>
                      ) : (
                        chatMessages.map((msg) => {
                          const isSelf = msg.user_id === user?.id;
                          const sender = participants.find((p) => p.userId === msg.user_id);
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                            >
                              <div className="mb-1 flex items-center gap-1.5 px-1">
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {isSelf ? 'You' : sender?.name || 'Participant'}
                                </span>
                                <time className="text-[10px] text-slate-500">
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </time>
                              </div>
                              <div
                                className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                                  isSelf
                                    ? 'rounded-br-xs bg-indigo-600 text-white'
                                    : isDarkTheme
                                    ? 'rounded-bl-xs border border-zinc-700/60 bg-zinc-800 text-zinc-100'
                                    : 'rounded-bl-xs border border-slate-200 bg-slate-100 text-slate-900'
                                }`}
                              >
                                {msg.body}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>

                    <form
                      onSubmit={(e) => void handleSendChat(e)}
                      className={`flex items-center gap-2 border-t p-3 ${
                        isDarkTheme ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        placeholder="Send a message..."
                        maxLength={2000}
                        className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2 text-sm outline-none transition ${
                          isDarkTheme
                            ? 'border-zinc-700 bg-zinc-800 text-white focus:border-indigo-500'
                            : 'border-slate-200 bg-slate-100 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={sendingChat || !chatDraft.trim()}
                        className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-40"
                        title="Send message"
                      >
                        {sendingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: LIVE POLLS */}
                {activeSidebarTab === 'polls' && (
                  <div className="flex flex-1 flex-col space-y-4 overflow-y-auto p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Live Polls</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          Quick real-time votes with everyone in the room.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPollComposer((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        <Plus size={14} />
                        <span>{showPollComposer ? 'Cancel' : 'Create poll'}</span>
                      </button>
                    </div>

                    {showPollComposer && (
                      <form
                        onSubmit={(e) => void handleCreatePoll(e)}
                        className={`space-y-3 rounded-2xl border p-3.5 ${
                          isDarkTheme
                            ? 'border-zinc-800 bg-zinc-800/50'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <input
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="Ask a question..."
                          maxLength={180}
                          className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition ${
                            isDarkTheme
                              ? 'border-zinc-700 bg-zinc-900 text-white focus:border-indigo-500'
                              : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
                          }`}
                        />

                        <div className="space-y-2">
                          {pollOptions.map((opt, index) => (
                            <div key={index} className="flex items-center gap-1.5">
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const next = [...pollOptions];
                                  next[index] = e.target.value;
                                  setPollOptions(next);
                                }}
                                placeholder={`Option ${index + 1}`}
                                maxLength={100}
                                className={`flex-1 rounded-xl border px-3 py-1.5 text-xs outline-none transition ${
                                  isDarkTheme
                                    ? 'border-zinc-700 bg-zinc-900 text-white focus:border-indigo-500'
                                    : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
                                }`}
                              />
                              {pollOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPollOptions((prev) => prev.filter((_, i) => i !== index))
                                  }
                                  className="rounded-lg p-1 text-slate-400 hover:text-red-500"
                                  title="Remove option"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          {pollOptions.length < 5 ? (
                            <button
                              type="button"
                              onClick={() => setPollOptions((prev) => [...prev, ''])}
                              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              + Add option
                            </button>
                          ) : (
                            <span />
                          )}
                          <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                          >
                            Launch poll
                          </button>
                        </div>
                      </form>
                    )}

                    {polls.length === 0 && !showPollComposer ? (
                      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-slate-400">
                        <BarChart3 size={32} className="mb-2 opacity-40" />
                        <p className="text-sm font-medium">No live polls yet</p>
                        <p className="mt-1 text-xs">Create a quick poll to gather instant feedback.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {polls.map((poll) => {
                          const totalVotes = poll.options.reduce(
                            (sum, opt) => sum + opt.voterIds.length,
                            0
                          );
                          const isCreator = poll.createdBy === user?.id;

                          return (
                            <div
                              key={poll.id}
                              className={`space-y-3 rounded-2xl border p-4 ${
                                isDarkTheme
                                  ? 'border-zinc-800 bg-zinc-800/40'
                                  : 'border-slate-200 bg-slate-50/70'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold leading-snug">{poll.question}</p>
                                  <p className="mt-0.5 text-[11px] text-slate-400">
                                    By {poll.creatorName} · {totalVotes}{' '}
                                    {totalVotes === 1 ? 'vote' : 'votes'}
                                  </p>
                                </div>
                                {poll.closed ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    <Lock size={10} /> Closed
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    Live
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2">
                                {poll.options.map((opt) => {
                                  const count = opt.voterIds.length;
                                  const pct =
                                    totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                                  const voted = Boolean(user?.id && opt.voterIds.includes(user.id));

                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      disabled={poll.closed}
                                      onClick={() => void votePoll(poll.id, opt.id)}
                                      className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-xs transition ${
                                        voted
                                          ? 'border-indigo-500 ring-1 ring-indigo-500/40'
                                          : isDarkTheme
                                          ? 'border-zinc-700 hover:border-zinc-600'
                                          : 'border-slate-200 hover:border-slate-300'
                                      } ${poll.closed ? 'cursor-default' : 'cursor-pointer'}`}
                                    >
                                      <div
                                        className="pointer-events-none absolute inset-y-0 left-0 bg-indigo-500/15 transition-all duration-300"
                                        style={{ width: `${pct}%` }}
                                      />
                                      <div className="relative flex items-center justify-between gap-2">
                                        <span className="font-medium">{opt.label}</span>
                                        <span className="shrink-0 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                          {pct}% ({count})
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {!poll.closed && isCreator && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => void closePoll(poll.id)}
                                    className="text-xs font-semibold text-slate-500 hover:text-red-500 dark:text-zinc-400"
                                  >
                                    End poll
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: MEETING DETAILS */}
                {activeSidebarTab === 'info' && (
                  <div className="flex-1 space-y-6 overflow-y-auto p-5">
                    <div>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Meeting Info
                      </h3>
                      <p className="text-lg font-bold">{activeMeeting.title}</p>
                      {projectName && <p className="text-xs font-medium text-indigo-500">{projectName}</p>}
                    </div>

                    <div
                      className={`space-y-3 rounded-2xl border p-4 ${
                        isDarkTheme ? 'border-zinc-800 bg-zinc-800/60' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-400">Meeting Code</p>
                        <div className="mt-1 flex items-center justify-between">
                          <code className="font-mono text-sm font-bold tracking-widest text-indigo-500">
                            {meetingCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => void copyMeetingValue(meetingCode, 'Meeting code')}
                            className="rounded-lg p-1.5 transition hover:bg-slate-200 dark:hover:bg-zinc-700"
                            title="Copy code"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3 dark:border-zinc-700/60">
                        <p className="text-xs font-medium text-slate-400">Invite Link</p>
                        <button
                          type="button"
                          onClick={() => void copyMeetingValue(meetingInviteUrl, 'Invite link')}
                          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                        >
                          <Copy size={14} /> Copy joining info
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                      <p>Share this code or link with your teammates or external guests to join this call.</p>
                      <p>Audio, video, and screen-sharing media are transmitted directly via WebRTC.</p>
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>

          {/* Bottom Dock */}
          <footer
            className={`relative z-30 flex items-center justify-between border-t px-6 py-4 backdrop-blur-xl transition-colors ${chromeBarClass}`}
          >
            {/* Left: Meeting Time & Code */}
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <Clock size={15} className="text-indigo-500 dark:text-indigo-400" />
                <span>{elapsedTime}</span>
              </div>
              <span className="text-slate-300 dark:text-zinc-700">|</span>
              <button
                type="button"
                onClick={() => void copyMeetingValue(meetingCode, 'Meeting code')}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                title="Copy meeting code"
              >
                <span>{meetingCode}</span>
                {copiedCodeFeedback ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
            </div>

            {/* Center: Main Action Controls */}
            <div className="mx-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => void toggleAudio()}
                title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                className={`rounded-full p-3.5 shadow-sm transition-all ${
                  audioEnabled
                    ? dockNeutralButtonClass
                    : 'bg-red-600 text-white ring-2 ring-red-500/30 hover:bg-red-700'
                }`}
              >
                {audioEnabled ? <Mic size={19} /> : <MicOff size={19} />}
              </button>

              <button
                type="button"
                onClick={() => void toggleVideo()}
                title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                className={`rounded-full p-3.5 shadow-sm transition-all ${
                  videoEnabled
                    ? dockNeutralButtonClass
                    : 'bg-red-600 text-white ring-2 ring-red-500/30 hover:bg-red-700'
                }`}
              >
                {videoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
              </button>

              <button
                type="button"
                onClick={() => void toggleHandRaise()}
                title={handRaised ? 'Lower hand' : 'Raise hand'}
                className={`rounded-full p-3.5 shadow-sm transition-all ${
                  handRaised
                    ? 'bg-amber-500 font-bold text-zinc-950 ring-2 ring-amber-400/50 hover:bg-amber-600'
                    : dockNeutralButtonClass
                }`}
              >
                <Hand size={19} className={handRaised ? 'animate-bounce' : ''} />
              </button>

              <button
                type="button"
                onClick={() => (screenSharing ? void stopScreenShare() : void startScreenShare())}
                title={screenSharing ? 'Stop presenting' : 'Present screen'}
                className={`rounded-full p-3.5 shadow-sm transition-all ${
                  screenSharing
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/40 hover:bg-indigo-700'
                    : dockNeutralButtonClass
                }`}
              >
                <MonitorUp size={19} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReactionPicker((prev) => !prev)}
                  title="Send reaction"
                  className={`rounded-full p-3.5 shadow-sm transition-all ${
                    showReactionPicker ? 'bg-indigo-600 text-white' : dockNeutralButtonClass
                  }`}
                >
                  <Smile size={19} />
                </button>

                {showReactionPicker && (
                  <div
                    className={`absolute bottom-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl ${
                      isDarkTheme
                        ? 'border-zinc-700 bg-zinc-900/95'
                        : 'border-slate-200 bg-white/95'
                    }`}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => void sendReaction(emoji)}
                        className="rounded-xl p-2 text-2xl transition-transform hover:scale-125 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleLeaveMeeting(false)}
                disabled={leaving}
                title="Leave meeting"
                className="ml-1 flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 font-semibold text-white shadow-sm transition-all hover:bg-red-700"
              >
                {leaving ? <Loader2 size={18} className="animate-spin" /> : <PhoneOff size={18} />}
                <span className="hidden text-sm sm:inline">Leave</span>
              </button>

              {activeMeeting.created_by === user?.id && (
                <button
                  type="button"
                  onClick={() => void handleLeaveMeeting(true)}
                  disabled={leaving}
                  title="End meeting for everyone"
                  className="rounded-full border border-red-300 bg-red-50 px-3.5 py-3 text-xs font-medium text-red-700 transition hover:bg-red-100 dark:border-red-800/80 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60"
                >
                  End all
                </button>
              )}
            </div>

            {/* Right: Drawer Navigation Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setActiveSidebarTab((t) => (t === 'info' ? null : 'info'))}
                title="Meeting details"
                className={`rounded-full p-3 transition ${
                  activeSidebarTab === 'info'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <Info size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSidebarTab((t) => (t === 'polls' ? null : 'polls'));
                  setUnreadPollCount(0);
                }}
                title="Live polls"
                className={`relative rounded-full p-3 transition ${
                  activeSidebarTab === 'polls'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <BarChart3 size={18} />
                {(unreadPollCount > 0 || openPollsCount > 0) && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {unreadPollCount > 0 ? unreadPollCount : openPollsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveSidebarTab((t) => (t === 'people' ? null : 'people'))}
                title="People"
                className={`relative rounded-full p-3 transition ${
                  activeSidebarTab === 'people'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <Users size={18} />
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                  {participants.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSidebarTab((t) => (t === 'chat' ? null : 'chat'));
                  setUnreadChatCount(0);
                }}
                title="In-call messages"
                className={`relative rounded-full p-3 transition ${
                  activeSidebarTab === 'chat'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <MessageSquare size={18} />
                {unreadChatCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 animate-pulse items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            </div>
          </footer>
        </div>
      ) : (
        /* LOBBY / PRE-MEETING VIEW */
        <div className="min-h-screen bg-slate-50 p-6 text-slate-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 md:p-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-zinc-800">
              <div>
                <Link
                  to={guestMode ? '/meetings' : `/projects/${projectId}`}
                  className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                >
                  <ArrowLeft size={16} /> {guestMode ? 'Meetings' : projectName}
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {guestMode ? 'Meeting Room' : 'Project Meetings'}
                </h1>
              </div>
            </header>

            {guestMode ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Sparkles size={13} /> Invite-only access
                </span>
                <h2 className="mt-3 text-2xl font-bold">{meetings[0]?.title || 'Meeting'}</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-zinc-400">
                  This invite gives you access to join this meeting room. It does not grant access to the full project workspace.
                </p>
                {meetings[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const meeting = meetings[0];
                      if (meeting) setPendingMeeting(meeting);
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                  >
                    <Video size={18} /> Join meeting
                  </button>
                )}
              </section>
            ) : (
              <form
                onSubmit={(event) => void createMeeting(event)}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row"
              >
                <div className="relative flex-1">
                  <input
                    value={meetingTitle}
                    onChange={(event) => setMeetingTitle(event.target.value)}
                    maxLength={120}
                    placeholder={`${projectName} sync`}
                    aria-label="Meeting title"
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !meetingTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Create meeting
                </button>
              </form>
            )}

            {!guestMode && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold">Recent meetings</h2>
                {meetings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-500">
                    No meetings yet. Create one to start a project call.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {meetings.map((meeting) => (
                      <article
                        key={meeting.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold">{meeting.title}</h3>
                            {!meeting.ended_at && (
                              <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                Available
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                            Created {new Date(meeting.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void copyMeetingValue(formatMeetingCode(meeting.invite_code), 'Meeting code')
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs font-medium transition hover:bg-slate-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            title="Copy meeting code"
                          >
                            <Copy size={13} /> {formatMeetingCode(meeting.invite_code)}
                          </button>

                          {!meeting.ended_at ? (
                            <button
                              type="button"
                              onClick={() => setPendingMeeting(meeting)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                            >
                              <Video size={16} /> Join meeting
                            </button>
                          ) : (
                            <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                              Ended
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      )}

      {/* CONSENT MODAL DIALOG */}
      {pendingMeeting && !activeMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-consent-title"
            className="w-full max-w-lg space-y-6 rounded-3xl border border-slate-200 bg-white p-7 text-slate-900 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <div>
              <div className="mb-3 inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Camera size={24} />
              </div>
              <h2 id="meeting-consent-title" className="text-2xl font-bold">
                Join {pendingMeeting.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                Joining will ask your device for microphone and camera access. Both start muted/off for your privacy. Your media is sent directly to other meeting participants via encrypted WebRTC.
              </p>
            </div>

            <label className="flex cursor-pointer select-none items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800/40">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(event) => setConsentGiven(event.target.checked)}
                className="mt-1 h-4 w-4 rounded accent-indigo-600"
              />
              <span className="text-slate-700 dark:text-zinc-300">
                I consent to accessing my microphone and camera for this meeting, with both disabled until I turn them on.
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPendingMeeting(null);
                  setConsentGiven(false);
                }}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleJoinMeeting()}
                disabled={!consentGiven || joining}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {joining && <Loader2 size={16} className="animate-spin" />} Join with devices
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}