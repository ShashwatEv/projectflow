import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Clock,
  Copy,
  Hand,
  Info,
  LayoutGrid,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Pin,
  PinOff,
  Plus,
  Send,
  Smile,
  Square,
  Users,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';
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

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🎉', '👏'] as const;

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
  large = false,
}: {
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
  large?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(stream?.getVideoTracks().length && (cameraEnabled || screenSharing));

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    if (stream) void videoRef.current.play().catch(() => undefined);
  }, [stream]);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gray-950 ${
        pinned ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-gray-700/50'
      } ${large ? 'col-span-2 row-span-2' : ''}`}
      style={{ aspectRatio: large ? '16/9' : '16/10' }}
    >
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          aria-label={`${name}${local ? ' (you)' : ''} video`}
          className={`h-full w-full object-contain ${hasVideo ? '' : 'invisible'}`}
        />
      )}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          {avatar ? (
            <img src={avatar} alt="" className={`rounded-full object-cover ${large ? 'h-24 w-24' : 'h-16 w-16'}`} />
          ) : (
            <div className={`flex items-center justify-center rounded-full bg-indigo-600 font-bold text-white ${
              large ? 'h-24 w-24 text-3xl' : 'h-16 w-16 text-xl'
            }`}>
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-400">
            {screenSharing ? 'Sharing screen' : 'Camera off'}
          </span>
        </div>
      )}

      {/* Hand raised indicator */}
      {handRaised && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-amber-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
          <Hand size={13} /> Raised
        </div>
      )}

      {/* Audio muted indicator (for remote participants) */}
      {audioMuted && !local && (
        <div className="absolute right-3 top-3 rounded-full bg-red-600/80 p-1.5 backdrop-blur-sm">
          <MicOff size={12} className="text-white" />
        </div>
      )}

      {/* Pin/Unpin button (visible on hover) */}
      {!local && (onPin || onUnpin) && (
        <button
          type="button"
          onClick={pinned ? onUnpin : onPin}
          className="absolute right-3 bottom-12 rounded-lg bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          title={pinned ? 'Unpin' : 'Pin'}
        >
          {pinned ? <PinOff size={14} /> : <Pin size={14} />}
        </button>
      )}

      {/* Bottom name bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-sm font-medium text-white">
        <span className="truncate">{name}{local ? ' (you)' : ''}</span>
        <div className="flex items-center gap-1.5">
          {screenSharing && (
            <span className="rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px]">Screen</span>
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

  // Google Meet-style features
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const [pinnedUserId, setPinnedUserId] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');

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
  userRef.current = user;
  activeMeetingRef.current = activeMeeting;

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
      ...current,
      ...updates,
    });
  }, [audioEnabled, participants, screenSharing, videoEnabled]);

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
    setShowParticipants(false);
    setShowChat(false);
    setShowMeetingInfo(false);
    setShowReactionPicker(false);
    setFloatingReactions([]);
    setJoinedAt(null);
    setPinnedUserId(null);
    setViewMode('grid');
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
    const x = Math.random() * 70 + 15;
    setFloatingReactions((prev) => [...prev, { id, emoji, senderName, x }]);
    window.setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3500);
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
    if (raised) toast.info('Hand raised');
  }, [handRaised, updatePresence]);

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
      toast.success(`${label} copied.`);
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (!projectName) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-gray-500">
          {guestMode
            ? 'This meeting invite is invalid or has ended. If it should be active, ask the host to apply the guest-invite Supabase migration.'
            : 'Project not found or you do not have access.'}
        </p>
        <Link to={guestMode ? '/meetings' : '/projects'} className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
          <ArrowLeft size={16} /> {guestMode ? 'Back to Meetings' : 'Back to Projects'}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to={guestMode ? '/meetings' : `/projects/${projectId}`} className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600">
            <ArrowLeft size={15} /> {guestMode ? 'Meetings' : projectName}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {guestMode ? 'Meeting room' : 'Project meetings'}
          </h1>
        </div>
      </header>

      {activeMeeting ? (
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Live meeting</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeMeeting.title}</h2>
              <p className="mt-1 font-mono text-xs font-semibold tracking-widest text-gray-500 dark:text-gray-400">
                Code: {meetingCode}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void copyMeetingValue(meetingCode, 'Meeting code')}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Copy size={13} /> Copy code
              </button>
              <button
                type="button"
                onClick={() => void copyMeetingValue(meetingInviteUrl, 'Invite link')}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Copy size={13} /> Copy invite
              </button>
              <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                <Users size={16} /> {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <VideoTile
              name={user?.name || 'You'}
              avatar={user?.avatar || ''}
              stream={screenStream || localStream}
              muted
              cameraEnabled={videoEnabled}
              screenSharing={screenSharing}
              local
            />
            {participants
              .filter((participant) => participant.userId !== user?.id)
              .map((participant) => (
                <VideoTile
                  key={participant.userId}
                  name={participant.name || 'ProjectFlow member'}
                  avatar={participant.avatar}
                  stream={remoteStreams.get(participant.userId) || null}
                  cameraEnabled={participant.videoEnabled}
                  screenSharing={participant.screenSharing}
                />
              ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <button type="button" onClick={() => void toggleAudio()} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${audioEnabled ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white' : 'bg-red-600 text-white'}`}>
              {audioEnabled ? <Mic size={17} /> : <MicOff size={17} />}{audioEnabled ? 'Mute' : 'Unmute'}
            </button>
            <button type="button" onClick={() => void toggleVideo()} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${videoEnabled ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white' : 'bg-red-600 text-white'}`}>
              {videoEnabled ? <Video size={17} /> : <VideoOff size={17} />}{videoEnabled ? 'Stop video' : 'Start video'}
            </button>
            <button type="button" onClick={() => screenSharing ? void stopScreenShare() : void startScreenShare()} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${screenSharing ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'}`}>
              <MonitorUp size={17} />{screenSharing ? 'Stop sharing' : 'Share screen'}
            </button>
            <button type="button" onClick={() => void leaveMeeting(false)} disabled={leaving} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {leaving ? <Loader2 size={17} className="animate-spin" /> : <PhoneOff size={17} />} Leave
            </button>
            {activeMeeting.created_by === user?.id && (
              <button type="button" onClick={() => void leaveMeeting(true)} disabled={leaving} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 dark:border-red-800 dark:text-red-300">
                End meeting for everyone
              </button>
            )}
          </div>

          <section className="border-t border-gray-100 pt-4 dark:border-gray-700" aria-labelledby="meeting-chat-heading">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 id="meeting-chat-heading" className="font-semibold text-gray-900 dark:text-white">Meeting chat</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Messages are visible only to active participants in this meeting.</p>
              </div>
            </div>
            <div
              className="mb-3 max-h-64 min-h-24 space-y-3 overflow-y-auto rounded-xl bg-gray-50 p-3 dark:bg-gray-900/60"
              aria-live="polite"
              aria-relevant="additions"
            >
              {chatMessages.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No messages yet. Send the first one.</p>
              ) : (
                chatMessages.map((message) => {
                  const senderName = message.user_id === user?.id
                    ? 'You'
                    : participants.find((participant) => participant.userId === message.user_id)?.name || 'ProjectFlow member';
                  return (
                    <article key={message.id} className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                      <div className="mb-1 flex items-baseline justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">{senderName}</span>
                        <time className="shrink-0 text-[10px] text-gray-400" dateTime={message.created_at}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">{message.body}</p>
                    </article>
                  );
                })
              )}
            </div>
            <form onSubmit={(event) => void sendChatMessage(event)} className="flex gap-2">
              <input
                value={chatDraft}
                onChange={(event) => setChatDraft(event.target.value)}
                maxLength={2000}
                aria-label="Meeting chat message"
                placeholder="Write a message…"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={sendingChat || !chatDraft.trim()}
                aria-label="Send meeting message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sendingChat ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </section>
        </section>
      ) : guestMode ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Invite-only access</p>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{meetings[0]?.title || 'Meeting'}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            This invite gives you access to this meeting only. It does not grant access to the project workspace.
          </p>
          {meetings[0] && (
            <button
              type="button"
              onClick={() => {
                const meeting = meetings[0];
                if (meeting) setPendingMeeting(meeting);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Video size={16} /> Join meeting
            </button>
          )}
        </section>
      ) : (
        <form onSubmit={(event) => void createMeeting(event)} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
          <input
            value={meetingTitle}
            onChange={(event) => setMeetingTitle(event.target.value)}
            maxLength={120}
            placeholder={`${projectName} sync`}
            aria-label="Meeting title"
            className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
          <button type="submit" disabled={creating || !meetingTitle.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            {creating ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} Create meeting
          </button>
        </form>
      )}

      {!activeMeeting && !guestMode && (
        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent meetings</h2>
          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700">
              No meetings yet. Create one to start a project call.
            </div>
          ) : (
            meetings.map((meeting) => (
              <article key={meeting.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{meeting.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(meeting.created_at).toLocaleString()} · {meeting.ended_at ? 'Ended' : 'Available'}
                  </p>
                </div>
                {!meeting.ended_at ? (
                  <button type="button" onClick={() => setPendingMeeting(meeting)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                    Join meeting
                  </button>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700">Ended</span>
                )}
              </article>
            ))
          )}
        </section>
      )}

      {pendingMeeting && !activeMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="meeting-consent-title" className="w-full max-w-lg space-y-5 rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
            <div>
              <div className="mb-2 inline-flex rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"><Camera size={20} /></div>
              <h2 id="meeting-consent-title" className="text-xl font-bold text-gray-900 dark:text-white">Join {pendingMeeting.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Joining will ask your device for microphone and camera access. Both start muted/off. Your media is sent directly to other meeting participants; screen sharing requires a separate selection and confirmation.
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={consentGiven} onChange={(event) => setConsentGiven(event.target.checked)} className="mt-1 accent-indigo-600" />
              <span>I consent to accessing my microphone and camera for this meeting, with both disabled until I turn them on.</span>
            </label>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setPendingMeeting(null); setConsentGiven(false); }} className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button type="button" onClick={() => void joinMeeting()} disabled={!consentGiven || joining} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {joining && <Loader2 size={16} className="animate-spin" />} Join with devices
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
