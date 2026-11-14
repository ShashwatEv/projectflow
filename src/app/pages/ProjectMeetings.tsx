import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Copy,
  Hand,
  Info,
  LayoutGrid,
  Loader2,
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  MonitorUp,
  Moon,
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
  Sun,
  Users,
  Video,
  VideoOff,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';
import {
  getMeetingIceServers,
  createMeetingInviteUrl,
  formatMeetingCode,
  getMeetingInviteOrigin,
  getMeetingRoomTopic,
  getMeetingSignalTopic,
  isMeetingSignal,
  normalizeMeetingCode,
  type MeetingSignal,
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

interface MeetingChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface ParticipantPresence {
  userId: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
}

interface PeerState {
  connection: RTCPeerConnection;
  audioSender: RTCRtpSender;
  videoSender: RTCRtpSender;
  inboundChannel: RealtimeChannel;
  outboundChannel: RealtimeChannel;
  remoteStream: MediaStream;
  pendingCandidates: RTCIceCandidateInit[];
}

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '👏', '🔥', '🚀'] as const;

function waitForSubscription(channel: RealtimeChannel): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Realtime connection timed out.')), 15000);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        window.clearTimeout(timeout);
        resolve();
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        window.clearTimeout(timeout);
        reject(new Error('Could not connect to meeting signaling. Check the Supabase migration and network.'));
      }
    });
  });
}

function isUserId(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
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

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      setZoom((z) => {
        const next = Math.min(3, Math.max(1, +(z + delta).toFixed(2)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      className={`group relative overflow-hidden rounded-2xl border transition-shadow bg-zinc-950 select-none ${
        pinned
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-indigo-500/10'
          : 'border-zinc-800/80 shadow-md'
      } ${isSpotlight ? 'w-full h-full' : ''} ${
        zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
      }`}
      style={{
        aspectRatio: isSpotlight ? '16/9' : '16/10',
      }}
    >
      {/* Video & Media Layer with Zoom & Pan */}
      <div
        className="h-full w-full flex items-center justify-center transition-transform"
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
            className={`h-full w-full object-contain pointer-events-none ${hasVideo ? '' : 'invisible'}`}
          />
        )}
      </div>

      {/* Avatar Fallback when Camera is Off */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className={`rounded-full object-cover ring-2 ring-zinc-700 ${
                isSpotlight ? 'h-28 w-28' : 'h-16 w-16'
              }`}
            />
          ) : (
            <div
              className={`flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 font-bold text-white shadow-lg ${
                isSpotlight ? 'h-28 w-28 text-3xl' : 'h-16 w-16 text-xl'
              }`}
            >
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-zinc-400">
            {screenSharing ? 'Presenting screen' : 'Camera off'}
          </span>
        </div>
      )}

      {/* Top Left Badges: Hand Raised */}
      {handRaised && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-zinc-950 shadow-lg backdrop-blur-md animate-pulse">
          <Hand size={13} />
          <span>Raised</span>
        </div>
      )}

      {/* Audio Muted Indicator */}
      {audioMuted && !local && (
        <div className="absolute left-3 bottom-12 rounded-full bg-red-600/90 p-1.5 text-white shadow-md backdrop-blur-sm">
          <MicOff size={13} />
        </div>
      )}

      {/* Top Right: Zoom In/Out & Pin Toolbar (Hover or Zoomed) */}
      <div
        className={`absolute right-3 top-3 flex items-center gap-1 rounded-xl bg-black/75 p-1 text-white shadow-xl backdrop-blur-md transition-opacity z-20 ${
          zoom > 1 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          title="Zoom out"
          className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 transition"
        >
          <ZoomOut size={13} />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset zoom (100%)"
          className="px-1.5 py-0.5 text-[11px] font-mono font-medium rounded hover:bg-white/20 transition"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          title="Zoom in"
          className="p-1 rounded-lg hover:bg-white/20 disabled:opacity-30 transition"
        >
          <ZoomIn size={13} />
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={handleResetZoom}
            title="Reset"
            className="p-1 rounded-lg hover:bg-white/20 text-indigo-300 transition"
          >
            <RotateCcw size={12} />
          </button>
        )}
        {!local && (onPin || onUnpin) && (
          <button
            type="button"
            onClick={pinned ? onUnpin : onPin}
            title={pinned ? 'Unpin participant' : 'Pin to spotlight'}
            className={`p-1 rounded-lg transition ${
              pinned ? 'bg-indigo-600 text-white' : 'hover:bg-white/20 text-zinc-300'
            }`}
          >
            {pinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
        )}
      </div>

      {/* Bottom Name Bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3.5 pb-2.5 pt-6 text-xs font-medium text-white pointer-events-none">
        <span className="truncate max-w-[180px] drop-shadow-sm">
          {name}{local ? ' (You)' : ''}
        </span>
        <div className="flex items-center gap-1.5">
          {screenSharing && (
            <span className="rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
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
  const [searchParams, setSearchParams] = useSearchParams();
  const inviteCode = normalizeMeetingCode(searchParams.get('code') || '');
  const requestedMeetingId = searchParams.get('join');
  const { user } = useAuth();
  const { theme, setThemeMode } = useTheme();

  const [projectName, setProjectName] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [pendingMeeting, setPendingMeeting] = useState<Meeting | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [joining, setJoining] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [participants, setParticipants] = useState<ParticipantPresence[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Google Meet UI / UX Controls
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'chat' | 'people' | 'info' | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [stageZoom, setStageZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCodeFeedback, setCopiedCodeFeedback] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  const roomRef = useRef<RealtimeChannel | null>(null);
  const peerConnections = useRef(new Map<string, PeerState>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const activeMeetingRef = useRef<Meeting | null>(null);
  const userRef = useRef(user);
  const mountedRef = useRef(true);
  const accessCheckTimer = useRef<number | null>(null);
  const accessCheckRunning = useRef(false);
  const guestPromptedFor = useRef('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const activeSidebarTabRef = useRef(activeSidebarTab);

  userRef.current = user;
  activeMeetingRef.current = activeMeeting;
  activeSidebarTabRef.current = activeSidebarTab;

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
        if (guestPromptedFor.current !== promptKey) {
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
  }, [guestMode, inviteCode, projectId, routeId]);

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

  const loadChatMessage = useCallback(async (meetingId: string, messageId: string) => {
    const { data, error } = await supabase
      .from('project_meeting_messages')
      .select('id, meeting_id, user_id, body, created_at')
      .eq('meeting_id', meetingId)
      .eq('id', messageId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return;
    setChatMessages((current) =>
      current.some((message) => message.id === data.id) ? current : [...current, data]
    );
  }, []);

  const loadMeetingChat = useCallback(async (meetingId: string) => {
    const { data, error } = await supabase
      .from('project_meeting_messages')
      .select('id, meeting_id, user_id, body, created_at')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) {
      console.error('Could not load meeting chat:', error);
      toast.error('Meeting joined, but chat could not be loaded. Check the meeting codes and chat migration.');
      return;
    }
    setChatMessages(data || []);
  }, []);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (activeSidebarTab === 'chat') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSidebarTab]);

  const removePeer = useCallback(async (remoteUserId: string) => {
    const peer = peerConnections.current.get(remoteUserId);
    if (!peer) return;
    peerConnections.current.delete(remoteUserId);
    peer.connection.ontrack = null;
    peer.connection.onicecandidate = null;
    peer.connection.close();
    await Promise.all([
      supabase.removeChannel(peer.inboundChannel),
      supabase.removeChannel(peer.outboundChannel),
    ]);
    setRemoteStreams((current) => {
      const next = new Map(current);
      next.delete(remoteUserId);
      return next;
    });
  }, []);

  const sendSignal = useCallback(async (peer: PeerState, signal: MeetingSignal) => {
    const result = await peer.outboundChannel.send({
      type: 'broadcast',
      event: 'signal',
      payload: signal,
    });
    if (result !== 'ok') throw new Error('Meeting signal could not be delivered.');
  }, []);

  const ensurePeer = useCallback(async (meetingId: string, remoteUserId: string, makeOffer: boolean) => {
    const localUser = userRef.current;
    if (!localUser?.id || !isUserId(remoteUserId) || remoteUserId === localUser.id) return;
    if (peerConnections.current.has(remoteUserId)) return;

    const connection = new RTCPeerConnection({ iceServers: iceServersRef.current });
    const peer: PeerState = {
      connection,
      audioSender: connection.addTransceiver('audio', { direction: 'sendrecv' }).sender,
      videoSender: connection.addTransceiver('video', { direction: 'sendrecv' }).sender,
      inboundChannel: supabase.channel(
        getMeetingSignalTopic(meetingId, remoteUserId, localUser.id),
        { config: { private: true } }
      ),
      outboundChannel: supabase.channel(
        getMeetingSignalTopic(meetingId, localUser.id, remoteUserId),
        { config: { private: true } }
      ),
      remoteStream: new MediaStream(),
      pendingCandidates: [],
    };
    peerConnections.current.set(remoteUserId, peer);

    const audioTrack = localStreamRef.current?.getAudioTracks()[0] || null;
    const videoTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    await Promise.all([
      peer.audioSender.replaceTrack(audioTrack),
      peer.videoSender.replaceTrack(videoTrack),
    ]);

    connection.ontrack = ({ track }) => {
      if (!peer.remoteStream.getTracks().some((existing) => existing.id === track.id)) {
        peer.remoteStream.addTrack(track);
      }
      setRemoteStreams((current) => new Map(current).set(remoteUserId, peer.remoteStream));
    };
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        void sendSignal(peer, { type: 'ice', candidate: event.candidate.toJSON() }).catch((error) => {
          console.error('Could not send ICE candidate:', error);
        });
      }
    };
    peer.inboundChannel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      if (!isMeetingSignal(payload)) return;
      void (async () => {
        if (payload.type === 'offer') {
          if (connection.signalingState !== 'stable') return;
          await connection.setRemoteDescription(payload.description);
          for (const candidate of peer.pendingCandidates.splice(0)) {
            await connection.addIceCandidate(candidate);
          }
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);
          await sendSignal(peer, { type: 'answer', description: answer });
        } else if (payload.type === 'answer') {
          if (connection.signalingState !== 'have-local-offer') return;
          await connection.setRemoteDescription(payload.description);
          for (const candidate of peer.pendingCandidates.splice(0)) {
            await connection.addIceCandidate(candidate);
          }
        } else if (connection.remoteDescription) {
          await connection.addIceCandidate(payload.candidate);
        } else {
          peer.pendingCandidates.push(payload.candidate);
        }
      })().catch((error) => console.error('Could not process meeting signal:', error));
    });

    try {
      await Promise.all([
        waitForSubscription(peer.inboundChannel),
        waitForSubscription(peer.outboundChannel),
      ]);
      if (makeOffer) {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        await sendSignal(peer, { type: 'offer', description: offer });
      }
    } catch (error) {
      await removePeer(remoteUserId);
      throw error;
    }
  }, [removePeer, sendSignal]);

  const updatePresence = useCallback(async (updates: Partial<ParticipantPresence>) => {
    const room = roomRef.current;
    const localUser = userRef.current;
    if (!room || !localUser) return;
    const current = participants.find((participant) => participant.userId === localUser.id);
    await room.track({
      userId: localUser.id,
      name: localUser.name || 'ProjectFlow member',
      avatar: localUser.avatar || '',
      audioEnabled,
      videoEnabled,
      screenSharing,
      handRaised,
      ...current,
      ...updates,
    });
  }, [audioEnabled, handRaised, participants, screenSharing, videoEnabled]);

  const cleanupMediaAndRealtime = useCallback(async () => {
    if (accessCheckTimer.current !== null) {
      window.clearInterval(accessCheckTimer.current);
      accessCheckTimer.current = null;
    }
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      await room.untrack().catch((error) => console.error('Could not leave meeting presence:', error));
      await supabase.removeChannel(room);
    }

    const peerIds = Array.from(peerConnections.current.keys());
    await Promise.all(peerIds.map((peerId) => removePeer(peerId)));
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    screenStreamRef.current = null;
    setLocalStream(null);
    setScreenStream(null);
    setRemoteStreams(new Map());
    setParticipants([]);
    setChatMessages([]);
    setChatDraft('');
    setAudioEnabled(false);
    setVideoEnabled(false);
    setScreenSharing(false);
    setActiveMeeting(null);
    setPendingMeeting(null);
    setConsentGiven(false);
    setHandRaised(false);
    setActiveSidebarTab(null);
    setShowReactionPicker(false);
    setFloatingReactions([]);
    setJoinedAt(null);
    setPinnedUserId(null);
    setViewMode('grid');
    setUnreadChatCount(0);
    setStageZoom(1);
  }, [removePeer]);

  useEffect(() => {
    mountedRef.current = true;
    const peers = peerConnections.current;
    return () => {
      mountedRef.current = false;
      const meetingId = activeMeetingRef.current?.id;
      if (meetingId) void supabase.rpc('leave_project_meeting', { p_meeting_id: meetingId });
      if (accessCheckTimer.current !== null) window.clearInterval(accessCheckTimer.current);
      const room = roomRef.current;
      if (room) void supabase.removeChannel(room);
      for (const peer of peers.values()) {
        peer.connection.close();
        void supabase.removeChannel(peer.inboundChannel);
        void supabase.removeChannel(peer.outboundChannel);
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Meeting elapsed timer
  useEffect(() => {
    if (!joinedAt) { setElapsedTime('00:00'); return; }
    const tick = () => {
      const diff = Math.floor((Date.now() - joinedAt.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsedTime(
        h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
          : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [joinedAt]);

  const addFloatingReaction = useCallback((emoji: string, senderName: string) => {
    const id = crypto.randomUUID();
    const x = Math.random() * 60 + 20;
    setFloatingReactions((prev) => [...prev, { id, emoji, senderName, x }]);
    window.setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3200);
  }, []);

  const sendReaction = useCallback(async (emoji: string) => {
    const room = roomRef.current;
    const localUser = userRef.current;
    if (!room || !localUser) return;
    addFloatingReaction(emoji, 'You');
    await room.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji, senderName: localUser.name || 'ProjectFlow member' },
    });
    setShowReactionPicker(false);
  }, [addFloatingReaction]);

  const toggleHandRaise = useCallback(async () => {
    const raised = !handRaised;
    setHandRaised(raised);
    await updatePresence({ handRaised: raised });
    toast.info(raised ? 'Hand raised' : 'Hand lowered');
  }, [handRaised, updatePresence]);

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

  const captureLocalMedia = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('This device does not support microphone or camera access.');
      return new MediaStream();
    }

    const stream = new MediaStream();
    const [audioResult, videoResult] = await Promise.allSettled([
      navigator.mediaDevices.getUserMedia({ audio: true }),
      navigator.mediaDevices.getUserMedia({ video: true }),
    ]);
    const errors: string[] = [];

    for (const [result, kind] of [[audioResult, 'microphone'], [videoResult, 'camera']] as const) {
      if (result.status === 'fulfilled') {
        for (const track of result.value.getTracks()) {
          track.enabled = false;
          stream.addTrack(track);
        }
      } else {
        errors.push(kind);
        console.warn(`Could not access meeting ${kind}:`, result.reason);
      }
    }

    if (errors.length) {
      toast.info(
        errors.length === 2
          ? 'Joined as a listener; microphone and camera are unavailable.'
          : `Joined with ${errors[0]} unavailable.`
      );
    }
    return stream;
  };

  const joinMeeting = async () => {
    if (!pendingMeeting || !user?.id || !consentGiven) return;
    setJoining(true);
    let participantRecorded = false;
    try {
      iceServersRef.current = getMeetingIceServers();
      const { data: joinedMeetingId, error: joinError } = guestMode
        ? await supabase.rpc('join_project_meeting_by_code', { p_code: inviteCode })
        : await supabase.rpc('join_project_meeting', { p_meeting_id: pendingMeeting.id });
      if (joinError) throw joinError;
      if (guestMode && joinedMeetingId !== pendingMeeting.id) {
        throw new Error('The invite code does not match this meeting.');
      }
      participantRecorded = true;

      const stream = await captureLocalMedia();
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        await supabase.rpc('leave_project_meeting', { p_meeting_id: pendingMeeting.id });
        participantRecorded = false;
        return;
      }
      localStreamRef.current = stream;
      setLocalStream(stream);

      const room = supabase.channel(getMeetingRoomTopic(pendingMeeting.id), {
        config: { private: true, presence: { key: user.id } },
      });

      room.on('presence', { event: 'sync' }, () => {
        const state = room.presenceState<ParticipantPresence>();
        const members = new Map<string, ParticipantPresence>();
        for (const entries of Object.values(state)) {
          for (const entry of entries) {
            if (isUserId(entry.userId)) members.set(entry.userId, entry);
          }
        }
        setParticipants(Array.from(members.values()));
        for (const participant of members.values()) {
          if (participant.userId !== user.id) {
            void ensurePeer(
              pendingMeeting.id,
              participant.userId,
              user.id.localeCompare(participant.userId) < 0
            ).catch((error) => {
              console.error('Could not connect meeting participant:', error);
              toast.error('Could not establish a participant connection.');
            });
          }
        }
        for (const remoteId of peerConnections.current.keys()) {
          if (!members.has(remoteId)) void removePeer(remoteId);
        }
      });

      room.on('broadcast', { event: 'participant_joined' }, ({ payload }) => {
        const remoteId = payload?.userId;
        if (isUserId(remoteId) && remoteId !== user.id) {
          void ensurePeer(
            pendingMeeting.id,
            remoteId,
            user.id.localeCompare(remoteId) < 0
          ).catch((error) => {
            console.error('Could not connect meeting participant:', error);
            toast.error('Could not establish a participant connection.');
          });
        }
      });

      room.on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (payload?.emoji && typeof payload.emoji === 'string') {
          addFloatingReaction(payload.emoji, payload.senderName || 'Participant');
        }
      });

      room.on('broadcast', { event: 'meeting_ended' }, () => {
        toast.info('The meeting host ended this meeting.');
        void cleanupMediaAndRealtime();
        window.setTimeout(() => void loadProjectAndMeetings(), 500);
      });

      room.on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        const messageId = payload?.messageId;
        if (isUserId(messageId)) {
          void loadChatMessage(pendingMeeting.id, messageId).catch((error) => {
            console.error('Could not load a meeting chat message:', error);
            toast.error('A meeting chat message could not be loaded.');
          });
          if (activeSidebarTabRef.current !== 'chat') {
            setUnreadChatCount((count) => count + 1);
          }
        }
      });

      roomRef.current = room;
      await waitForSubscription(room);
      if (!mountedRef.current) {
        await supabase.rpc('leave_project_meeting', { p_meeting_id: pendingMeeting.id });
        participantRecorded = false;
        await cleanupMediaAndRealtime();
        return;
      }

      const presence: ParticipantPresence = {
        userId: user.id,
        name: user.name || 'ProjectFlow member',
        avatar: user.avatar || '',
        audioEnabled: false,
        videoEnabled: false,
        screenSharing: false,
        handRaised: false,
      };
      await room.track(presence);

      const announce = await room.send({
        type: 'broadcast',
        event: 'participant_joined',
        payload: { userId: user.id },
      });
      if (announce !== 'ok') throw new Error('Could not announce meeting presence.');

      setParticipants([presence]);
      setActiveMeeting(pendingMeeting);
      setPendingMeeting(null);
      setJoinedAt(new Date());
      void loadMeetingChat(pendingMeeting.id);

      accessCheckTimer.current = window.setInterval(async () => {
        if (accessCheckRunning.current) return;
        accessCheckRunning.current = true;
        try {
          const { data, error } = await supabase.rpc('projectflow_can_access_meeting_room', {
            p_topic: getMeetingRoomTopic(pendingMeeting.id),
          });
          if (error) throw error;
          if (data !== true) {
            toast.error('Project meeting access was revoked. Your devices have been disconnected.');
            await cleanupMediaAndRealtime();
            await loadProjectAndMeetings();
          }
        } catch (error) {
          console.error('Could not verify project meeting access:', error);
          toast.error('Could not verify meeting access. Your devices have been disconnected.');
          await cleanupMediaAndRealtime();
        } finally {
          accessCheckRunning.current = false;
        }
      }, 15000);
      toast.success('You joined the meeting. Audio and video are muted until you turn them on.');
    } catch (error) {
      console.error('Could not join meeting:', error);
      toast.error(error instanceof Error ? error.message : 'Could not join meeting.');
      await cleanupMediaAndRealtime();
      if (participantRecorded) {
        await supabase.rpc('leave_project_meeting', { p_meeting_id: pendingMeeting.id });
      }
    } finally {
      setJoining(false);
    }
  };

  const leaveMeeting = async (endMeeting = false) => {
    if (!activeMeeting) return;
    const meeting = activeMeeting;
    setLeaving(true);
    try {
      if (endMeeting && roomRef.current) {
        const result = await roomRef.current.send({
          type: 'broadcast',
          event: 'meeting_ended',
          payload: { meetingId: meeting.id },
        });
        if (result !== 'ok') throw new Error('Could not notify meeting participants.');
      }
      const { error } = await supabase.rpc(
        endMeeting ? 'end_project_meeting' : 'leave_project_meeting',
        { p_meeting_id: meeting.id }
      );
      if (error) throw error;
      toast.success(endMeeting ? 'Meeting ended.' : 'You left the meeting.');
    } catch (error) {
      console.error('Could not update meeting state:', error);
      toast.error(error instanceof Error ? error.message : 'Could not update meeting state.');
    } finally {
      await cleanupMediaAndRealtime();
      setLeaving(false);
      await loadProjectAndMeetings();
    }
  };

  const sendChatMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeMeeting || !chatDraft.trim()) return;
    setSendingChat(true);
    try {
      const { data: messageId, error } = await supabase.rpc('send_project_meeting_message', {
        p_meeting_id: activeMeeting.id,
        p_body: chatDraft.trim(),
      });
      if (error) throw error;
      if (typeof messageId !== 'string') throw new Error('The message could not be saved.');

      const room = roomRef.current;
      const broadcastResult = room
        ? await room.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: { messageId },
        })
        : 'error';

      try {
        await loadChatMessage(activeMeeting.id, messageId);
      } catch (error) {
        console.error('Message was sent but could not be loaded into chat:', error);
        toast.error('Message was sent, but could not be displayed here.');
      }
      if (broadcastResult !== 'ok') {
        toast.error('Message was saved, but could not be delivered to other participants in real time.');
      }
      setChatDraft('');
    } catch (error) {
      console.error('Could not send meeting chat message:', error);
      toast.error(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setSendingChat(false);
    }
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

  const toggleAudio = async () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      toast.error('No microphone is available. Leave and rejoin after connecting one.');
      return;
    }
    const enabled = !audioEnabled;
    track.enabled = enabled;
    setAudioEnabled(enabled);
    await updatePresence({ audioEnabled: enabled });
  };

  const toggleVideo = async () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) {
      toast.error('No camera is available. Leave and rejoin after connecting one.');
      return;
    }
    const enabled = !videoEnabled;
    track.enabled = enabled;
    setVideoEnabled(enabled);
    await updatePresence({ videoEnabled: enabled });
  };

  const stopScreenShare = async () => {
    const stream = screenStreamRef.current;
    if (!stream) return;
    screenStreamRef.current = null;
    stream.getTracks().forEach((track) => track.stop());
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    const restored = await Promise.allSettled(
      Array.from(peerConnections.current.values()).map((peer) => peer.videoSender.replaceTrack(cameraTrack))
    );
    setScreenStream(null);
    setScreenSharing(false);
    await updatePresence({ screenSharing: false });
    if (restored.some((result) => result.status === 'rejected')) {
      toast.error('Screen sharing stopped, but a participant connection could not be restored.');
    }
  };

  const startScreenShare = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error('Screen sharing is not supported on this device.');
      return;
    }
    let selectedStream: MediaStream | null = null;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      selectedStream = stream;
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error('No screen-share video track was selected.');
      screenStreamRef.current = stream;
      setScreenStream(stream);
      await Promise.all(
        Array.from(peerConnections.current.values()).map((peer) => peer.videoSender.replaceTrack(track))
      );
      track.addEventListener('ended', () => void stopScreenShare());
      setScreenSharing(true);
      await updatePresence({ screenSharing: true });
    } catch (error) {
      if (selectedStream) {
        selectedStream.getTracks().forEach((track) => track.stop());
        if (screenStreamRef.current === selectedStream) {
          screenStreamRef.current = null;
          setScreenStream(null);
          setScreenSharing(false);
          const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
          await Promise.allSettled(
            Array.from(peerConnections.current.values()).map((peer) => peer.videoSender.replaceTrack(cameraTrack))
          );
        }
      }
      if (error instanceof DOMException && error.name === 'NotAllowedError') return;
      console.error('Could not share screen:', error);
      toast.error(error instanceof Error ? error.message : 'Could not share your screen.');
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

  // Calculate spotlight tile for speaker/spotlight mode
  const spotlightUserId = pinnedUserId || (participants.find(p => p.screenSharing)?.userId) || (participants.find(p => p.userId !== user?.id)?.userId) || user?.id;

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const someoneRaisedHand = participants.find(p => p.handRaised && p.userId !== user?.id);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={38} />
      </div>
    );
  }

  if (!projectName) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto mt-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm">
        <p className="mb-4 text-slate-600 dark:text-zinc-400">
          {guestMode
            ? 'This meeting invite is invalid or has ended. If it should be active, ask the host to check the invite link.'
            : 'Project not found or you do not have access.'}
        </p>
        <Link
          to={guestMode ? '/meetings' : '/projects'}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
        >
          <ArrowLeft size={16} /> {guestMode ? 'Back to Meetings' : 'Back to Projects'}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Floating Reaction Animation Styles */}
      <style>{`
        @keyframes pfFloatReaction {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { transform: translateY(-30px) scale(1.2); opacity: 1; }
          85% { transform: translateY(-180px) scale(1); opacity: 0.9; }
          100% { transform: translateY(-250px) scale(0.8); opacity: 0; }
        }
      `}</style>

      {/* ACTIVE GOOGLE MEET CALL STAGE */}
      {activeMeeting ? (
        <div
          ref={meetingContainerRef}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden select-none font-sans"
        >
          {/* Top Bar (Google Meet Style) */}
          <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-900/90 dark:bg-zinc-950/90 border-b border-slate-800/80 backdrop-blur-md">
            {/* Left: Meeting Name & Live indicator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
                <h1 className="text-base font-semibold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                  {activeMeeting.title}
                </h1>
              </div>
              {guestMode && (
                <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                  Guest
                </span>
              )}
            </div>

            {/* Hand Raised Announcement Banner */}
            {someoneRaisedHand && (
              <div className="hidden md:flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300 animate-pulse">
                <Hand size={14} />
                <span>{someoneRaisedHand.name} raised hand</span>
              </div>
            )}

            {/* Right: Stage Zoom & View Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls (Stage) */}
              <div className="flex items-center rounded-xl bg-slate-800/80 border border-slate-700/80 p-0.5 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => setStageZoom((z) => Math.max(0.75, +(z - 0.15).toFixed(2)))}
                  title="Zoom out stage"
                  className="p-1.5 rounded-lg hover:bg-slate-700 hover:text-white transition disabled:opacity-30"
                  disabled={stageZoom <= 0.75}
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setStageZoom(1)}
                  title="Reset stage zoom to 100%"
                  className="px-2 py-1 font-mono font-medium hover:text-white"
                >
                  {Math.round(stageZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setStageZoom((z) => Math.min(1.5, +(z + 0.15).toFixed(2)))}
                  title="Zoom in stage"
                  className="p-1.5 rounded-lg hover:bg-slate-700 hover:text-white transition disabled:opacity-30"
                  disabled={stageZoom >= 1.5}
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* View Mode Toggle: Grid vs Spotlight */}
              <div className="flex items-center rounded-xl bg-slate-800/80 border border-slate-700/80 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    setPinnedUserId(null);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                    viewMode === 'grid' && !pinnedUserId
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid size={14} />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('speaker')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition ${
                    viewMode === 'speaker' || pinnedUserId
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Spotlight view"
                >
                  <Square size={14} />
                  <span className="hidden sm:inline">Spotlight</span>
                </button>
              </div>

              {/* Theme Toggle (Light / Dark) */}
              <button
                type="button"
                onClick={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            </div>
          </header>

          {/* Central Call Stage (Video Grid & Sidebars) */}
          <div className="relative flex-1 flex overflow-hidden">
            {/* Floating Reactions Layer */}
            {floatingReactions.map((reaction) => (
              <div
                key={reaction.id}
                className="pointer-events-none absolute bottom-24 z-50 flex flex-col items-center"
                style={{
                  left: `${reaction.x}%`,
                  animation: 'pfFloatReaction 3.2s ease-out forwards',
                }}
              >
                <span className="text-4xl filter drop-shadow-lg">{reaction.emoji}</span>
                <span className="mt-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
                  {reaction.senderName}
                </span>
              </div>
            ))}

            {/* Video Stage Container */}
            <main
              className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto items-center justify-center transition-all duration-300"
              style={{
                transform: `scale(${stageZoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* SPOTLIGHT / SPEAKER VIEW */}
              {viewMode === 'speaker' || pinnedUserId ? (
                <div className="w-full h-full max-w-6xl flex flex-col gap-4">
                  {/* Spotlight Stage */}
                  <div className="flex-1 min-h-[360px] w-full">
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
                      />
                    ) : (
                      (() => {
                        const spotParticipant = participants.find(p => p.userId === spotlightUserId);
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
                          />
                        ) : null;
                      })()
                    )}
                  </div>

                  {/* Thumbnail Carousel for Other Participants */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 px-1 shrink-0">
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
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                /* GRID VIEW (Dynamic Responsive Auto-Grid) */
                <div
                  className={`w-full max-w-6xl grid gap-4 items-center justify-center ${
                    participants.length <= 1
                      ? 'grid-cols-1 max-w-3xl'
                      : participants.length === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : participants.length <= 4
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {/* Local Participant Tile */}
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
                  />

                  {/* Remote Participants Tiles */}
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
                      />
                    ))}
                </div>
              )}
            </main>

            {/* GOOGLE MEET SIDEBAR DRAWER (People | Chat | Details) */}
            {activeSidebarTab && (
              <aside
                className={`w-full sm:w-96 flex flex-col border-l shadow-2xl transition-all duration-300 z-40 shrink-0 ${
                  theme === 'dark'
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Sidebar Tab Header */}
                <div
                  className={`flex items-center justify-between px-5 py-4 border-b ${
                    theme === 'dark' ? 'border-zinc-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('people')}
                      className={`text-sm font-semibold pb-1 border-b-2 transition ${
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
                      className={`relative text-sm font-semibold pb-1 border-b-2 transition ${
                        activeSidebarTab === 'chat'
                          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Chat
                      {unreadChatCount > 0 && (
                        <span className="ml-1.5 rounded-full bg-indigo-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                          {unreadChatCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarTab('info')}
                      className={`text-sm font-semibold pb-1 border-b-2 transition ${
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
                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition"
                    title="Close panel"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* TAB 1: PEOPLE (Participants List) */}
                {activeSidebarTab === 'people' && (
                  <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                    {/* Search box */}
                    <div className="relative mb-3">
                      <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search people..."
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                        className={`w-full rounded-xl pl-9 pr-3 py-2 text-sm outline-none border transition ${
                          theme === 'dark'
                            ? 'bg-zinc-800/80 border-zinc-700 text-white focus:border-indigo-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      In this meeting ({filteredParticipants.length})
                    </p>

                    <div className="space-y-1">
                      {filteredParticipants.map((p) => {
                        const isSelf = p.userId === user?.id;
                        return (
                          <div
                            key={p.userId}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                              theme === 'dark'
                                ? 'hover:bg-zinc-800/60'
                                : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {p.avatar ? (
                                <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                                  {p.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
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
                                  className={`p-1 rounded-lg ${
                                    pinnedUserId === p.userId
                                      ? 'text-indigo-500'
                                      : 'hover:text-white hover:bg-slate-700/60'
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
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Notice */}
                    <div
                      className={`px-4 py-2 text-xs border-b ${
                        theme === 'dark'
                          ? 'bg-zinc-800/40 border-zinc-800 text-zinc-400'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      Messages can only be seen by people in this call and are deleted when the call ends.
                    </div>

                    {/* Messages feed */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                          <MessageSquare size={32} className="mb-2 opacity-40" />
                          <p className="text-sm font-medium">No messages yet</p>
                          <p className="text-xs mt-1">Send a message to everyone in this call</p>
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
                              <div className="flex items-center gap-1.5 mb-1 px-1">
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
                                className={`rounded-2xl px-3.5 py-2 text-sm max-w-[85%] break-words shadow-sm ${
                                  isSelf
                                    ? 'bg-indigo-600 text-white rounded-br-xs'
                                    : theme === 'dark'
                                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 rounded-bl-xs'
                                    : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
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

                    {/* Chat Input Bar */}
                    <form
                      onSubmit={(e) => void sendChatMessage(e)}
                      className={`p-3 border-t flex items-center gap-2 ${
                        theme === 'dark' ? 'border-zinc-800 bg-zinc-900' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <input
                        value={chatDraft}
                        onChange={(e) => setChatDraft(e.target.value)}
                        placeholder="Send a message..."
                        maxLength={2000}
                        className={`flex-1 min-w-0 rounded-xl px-3.5 py-2 text-sm outline-none border transition ${
                          theme === 'dark'
                            ? 'bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500'
                            : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={sendingChat || !chatDraft.trim()}
                        className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm"
                        title="Send message"
                      >
                        {sendingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: MEETING DETAILS (Info & Links) */}
                {activeSidebarTab === 'info' && (
                  <div className="flex-1 p-5 space-y-6 overflow-y-auto">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Meeting Info
                      </h3>
                      <p className="text-lg font-bold">{activeMeeting.title}</p>
                      {projectName && <p className="text-xs text-indigo-500 font-medium">{projectName}</p>}
                    </div>

                    <div
                      className={`p-4 rounded-2xl border space-y-3 ${
                        theme === 'dark' ? 'bg-zinc-800/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-400">Meeting Code</p>
                        <div className="flex items-center justify-between mt-1">
                          <code className="text-sm font-mono font-bold tracking-widest text-indigo-500">
                            {meetingCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => void copyMeetingValue(meetingCode, 'Meeting code')}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
                            title="Copy code"
                          >
                            <Copy size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-zinc-700/60 pt-3">
                        <p className="text-xs font-medium text-slate-400">Invite Link</p>
                        <button
                          type="button"
                          onClick={() => void copyMeetingValue(meetingInviteUrl, 'Invite link')}
                          className="mt-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                        >
                          <Copy size={14} /> Copy joining info
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-2">
                      <p>✨ Share this code or link with your teammates or external guests to join this call.</p>
                      <p>🔒 All audio, video, and screen-sharing media are transmitted directly via peer-to-peer WebRTC encryption.</p>
                    </div>
                  </div>
                )}
              </aside>
            )}
          </div>

          {/* Bottom Dock (Google Meet Style) */}
          <footer className="relative z-30 flex items-center justify-between px-6 py-4 bg-slate-900/90 dark:bg-zinc-950/90 border-t border-slate-800/80 backdrop-blur-xl">
            {/* Left: Meeting Time & Code */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Clock size={15} className="text-indigo-400" />
                <span>{elapsedTime}</span>
              </div>
              <span className="text-slate-600">|</span>
              <button
                type="button"
                onClick={() => void copyMeetingValue(meetingCode, 'Meeting code')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition"
                title="Copy meeting code"
              >
                <span>{meetingCode}</span>
                {copiedCodeFeedback ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>

            {/* Center: Main Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 mx-auto">
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={() => void toggleAudio()}
                title={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                className={`p-3.5 rounded-full transition-all shadow-md ${
                  audioEnabled
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-500/30'
                }`}
              >
                {audioEnabled ? <Mic size={19} /> : <MicOff size={19} />}
              </button>

              {/* Camera Toggle */}
              <button
                type="button"
                onClick={() => void toggleVideo()}
                title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                className={`p-3.5 rounded-full transition-all shadow-md ${
                  videoEnabled
                    ? 'bg-slate-800 hover:bg-slate-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-500/30'
                }`}
              >
                {videoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
              </button>

              {/* Hand Raise Toggle */}
              <button
                type="button"
                onClick={() => void toggleHandRaise()}
                title={handRaised ? 'Lower hand' : 'Raise hand'}
                className={`p-3.5 rounded-full transition-all shadow-md ${
                  handRaised
                    ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold ring-2 ring-amber-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <Hand size={19} className={handRaised ? 'animate-bounce' : ''} />
              </button>

              {/* Screen Share Toggle */}
              <button
                type="button"
                onClick={() => (screenSharing ? void stopScreenShare() : void startScreenShare())}
                title={screenSharing ? 'Stop presenting' : 'Present screen'}
                className={`p-3.5 rounded-full transition-all shadow-md ${
                  screenSharing
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <MonitorUp size={19} />
              </button>

              {/* Emoji Reactions Palette */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowReactionPicker((prev) => !prev)}
                  title="Send reaction"
                  className={`p-3.5 rounded-full transition-all shadow-md ${
                    showReactionPicker
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Smile size={19} />
                </button>

                {showReactionPicker && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl z-50">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => void sendReaction(emoji)}
                        className="text-2xl p-2 rounded-xl hover:bg-slate-800 hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Leave Call Button */}
              <button
                type="button"
                onClick={() => void leaveMeeting(false)}
                disabled={leaving}
                title="Leave meeting"
                className="px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md flex items-center gap-2 ml-1"
              >
                {leaving ? <Loader2 size={18} className="animate-spin" /> : <PhoneOff size={18} />}
                <span className="hidden sm:inline text-sm">Leave</span>
              </button>

              {/* End Meeting for all (Host Only) */}
              {activeMeeting.created_by === user?.id && (
                <button
                  type="button"
                  onClick={() => void leaveMeeting(true)}
                  disabled={leaving}
                  title="End meeting for everyone"
                  className="px-3.5 py-3 rounded-full border border-red-700/80 bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium transition"
                >
                  End all
                </button>
              )}
            </div>

            {/* Right: Drawer Navigation Buttons */}
            <div className="flex items-center gap-2">
              {/* Info Drawer */}
              <button
                type="button"
                onClick={() => setActiveSidebarTab((t) => (t === 'info' ? null : 'info'))}
                title="Meeting details"
                className={`p-3 rounded-full transition ${
                  activeSidebarTab === 'info'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Info size={18} />
              </button>

              {/* People Drawer */}
              <button
                type="button"
                onClick={() => setActiveSidebarTab((t) => (t === 'people' ? null : 'people'))}
                title="People"
                className={`relative p-3 rounded-full transition ${
                  activeSidebarTab === 'people'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Users size={18} />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-700 px-1 text-[10px] font-bold text-white">
                  {participants.length}
                </span>
              </button>

              {/* Chat Drawer */}
              <button
                type="button"
                onClick={() => {
                  setActiveSidebarTab((t) => (t === 'chat' ? null : 'chat'));
                  setUnreadChatCount(0);
                }}
                title="In-call messages"
                className={`relative p-3 rounded-full transition ${
                  activeSidebarTab === 'chat'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare size={18} />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white animate-pulse">
                    {unreadChatCount}
                  </span>
                )}
              </button>
            </div>
          </footer>
        </div>
      ) : (
        /* LOBBY / PRE-MEETING VIEW (Theme-Compatible & Clean) */
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 p-6 md:p-8 transition-colors">
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-5">
              <div>
                <Link
                  to={guestMode ? '/meetings' : `/projects/${projectId}`}
                  className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
                >
                  <ArrowLeft size={16} /> {guestMode ? 'Meetings' : projectName}
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  {guestMode ? 'Meeting Room' : 'Project Meetings'}
                </h1>
              </div>

              {/* Theme Switcher Button */}
              <button
                type="button"
                onClick={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-700 dark:text-zinc-200 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="capitalize">{theme} mode</span>
              </button>
            </header>

            {guestMode ? (
              <section className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                  <Sparkles size={13} /> Invite-only access
                </span>
                <h2 className="mt-3 text-2xl font-bold">{meetings[0]?.title || 'Meeting'}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
                  This invite gives you access to join this meeting room. It does not grant access to the full project workspace.
                </p>
                {meetings[0] && (
                  <button
                    type="button"
                    onClick={() => {
                      const meeting = meetings[0];
                      if (meeting) setPendingMeeting(meeting);
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
                  >
                    <Video size={18} /> Join meeting
                  </button>
                )}
              </section>
            ) : (
              /* Create Meeting Card */
              <form
                onSubmit={(event) => void createMeeting(event)}
                className="flex flex-col sm:flex-row gap-3 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm"
              >
                <div className="relative flex-1">
                  <input
                    value={meetingTitle}
                    onChange={(event) => setMeetingTitle(event.target.value)}
                    maxLength={120}
                    placeholder={`${projectName} sync`}
                    aria-label="Meeting title"
                    className="w-full rounded-2xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating || !meetingTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20 transition"
                >
                  {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Create meeting
                </button>
              </form>
            )}

            {/* Recent Meetings List */}
            {!guestMode && (
              <section className="space-y-4">
                <h2 className="text-lg font-bold">Recent meetings</h2>
                {meetings.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800 p-12 text-center text-sm text-slate-500 dark:text-zinc-500">
                    No meetings yet. Create one to start a project call.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {meetings.map((meeting) => (
                      <article
                        key={meeting.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition hover:border-slate-300 dark:hover:border-zinc-700"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base">{meeting.title}</h3>
                            {!meeting.ended_at && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
                            onClick={() => void copyMeetingValue(formatMeetingCode(meeting.invite_code), 'Meeting code')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs font-mono font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                            title="Copy meeting code"
                          >
                            <Copy size={13} /> {formatMeetingCode(meeting.invite_code)}
                          </button>

                          {!meeting.ended_at ? (
                            <button
                              type="button"
                              onClick={() => setPendingMeeting(meeting)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
                            >
                              <Video size={16} /> Join meeting
                            </button>
                          ) : (
                            <span className="rounded-xl bg-slate-100 dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="meeting-consent-title"
            className="w-full max-w-lg space-y-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-7 shadow-2xl text-slate-900 dark:text-zinc-100"
          >
            <div>
              <div className="mb-3 inline-flex rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 p-3 text-indigo-600 dark:text-indigo-400">
                <Camera size={24} />
              </div>
              <h2 id="meeting-consent-title" className="text-2xl font-bold">
                Join {pendingMeeting.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                Joining will ask your device for microphone and camera access. Both start muted/off for your privacy. Your media is sent directly to other meeting participants via encrypted WebRTC.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 p-4 text-sm cursor-pointer select-none">
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
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void joinMeeting()}
                disabled={!consentGiven || joining}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
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
