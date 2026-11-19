import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Maximize2,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { supabase } from '../lib/supabaseClient';
import {
  formatMeetingCode,
  getMeetingIceServers,
  getMeetingRoomTopic,
  getMeetingSignalTopic,
  isMeetingSignal,
  type MeetingSignal,
} from '../lib/meetingConfig';

export interface ActiveMeetingInfo {
  id: string;
  project_id: string;
  title: string;
  created_by: string;
  created_at: string;
  ended_at: string | null;
  invite_code: string;
  guestMode?: boolean;
  returnPath: string;
}

export interface MeetingChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface ParticipantPresence {
  userId: string;
  name: string;
  avatar: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
}

export interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  x: number;
}

export interface MeetingPollOption {
  id: string;
  label: string;
  voterIds: string[];
}

export interface MeetingPoll {
  id: string;
  question: string;
  options: MeetingPollOption[];
  createdBy: string;
  creatorName: string;
  createdAt: string;
  closed: boolean;
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

interface JoinMeetingArgs {
  meeting: ActiveMeetingInfo;
  inviteCode?: string;
}

interface MeetingContextValue {
  activeMeeting: ActiveMeetingInfo | null;
  joining: boolean;
  leaving: boolean;
  participants: ParticipantPresence[];
  remoteStreams: Map<string, MediaStream>;
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  chatMessages: MeetingChatMessage[];
  unreadChatCount: number;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  floatingReactions: FloatingReaction[];
  polls: MeetingPoll[];
  unreadPollCount: number;
  setUnreadPollCount: React.Dispatch<React.SetStateAction<number>>;
  elapsedTime: string;
  isMinimized: boolean;
  setIsMinimized: (value: boolean) => void;
  joinMeetingSession: (args: JoinMeetingArgs) => Promise<boolean>;
  leaveMeetingSession: (endMeeting?: boolean) => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  toggleHandRaise: () => Promise<void>;
  sendReaction: (emoji: string) => Promise<void>;
  sendChatMessage: (body: string) => Promise<boolean>;
  createPoll: (question: string, optionLabels: string[]) => Promise<void>;
  votePoll: (pollId: string, optionId: string) => Promise<void>;
  closePoll: (pollId: string) => Promise<void>;
}

const MeetingContext = createContext<MeetingContextValue | null>(null);

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
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

function MiniplayerVideoPreview({
  stream,
  name,
  avatar,
  hasVideo,
  isDarkTheme,
}: {
  stream: MediaStream | null;
  name: string;
  avatar: string;
  hasVideo: boolean;
  isDarkTheme: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    if (stream) void videoRef.current.play().catch(() => undefined);
  }, [stream]);

  return (
    <div
      className={`relative h-36 w-full overflow-hidden ${
        isDarkTheme ? 'bg-zinc-950' : 'bg-slate-100'
      }`}
    >
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${hasVideo ? '' : 'hidden'}`}
        />
      )}
      {!hasVideo && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-base font-bold text-white shadow-sm">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span
            className={`text-[11px] font-medium ${
              isDarkTheme ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            Camera off
          </span>
        </div>
      )}
    </div>
  );
}

export function MeetingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<ActiveMeetingInfo | null>(null);
  const [participants, setParticipants] = useState<ParticipantPresence[]>([]);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(() => new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [polls, setPolls] = useState<MeetingPoll[]>([]);
  const [unreadPollCount, setUnreadPollCount] = useState(0);
  const [joinedAt, setJoinedAt] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isMinimized, setIsMinimized] = useState(false);
  const [miniPos, setMiniPos] = useState<{ x: number; y: number } | null>(null);

  const roomRef = useRef<RealtimeChannel | null>(null);
  const peerConnections = useRef(new Map<string, PeerState>());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const activeMeetingRef = useRef<ActiveMeetingInfo | null>(null);
  const userRef = useRef(user);
  const mountedRef = useRef(true);
  const accessCheckTimer = useRef<number | null>(null);
  const accessCheckRunning = useRef(false);
  const miniplayerRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  userRef.current = user;
  activeMeetingRef.current = activeMeeting;

  const isOnMeetingRoute = Boolean(
    activeMeeting &&
      (location.pathname === activeMeeting.returnPath ||
        location.pathname.startsWith('/meetings/guest/') ||
        /^\/projects\/[^/]+\/meetings/.test(location.pathname))
  );

  // Automatically restore full stage when user returns to the meeting route
  useEffect(() => {
    if (isOnMeetingRoute && isMinimized) {
      setIsMinimized(false);
    }
  }, [isOnMeetingRoute, isMinimized]);

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

  const ensurePeer = useCallback(
    async (meetingId: string, remoteUserId: string, makeOffer: boolean) => {
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
    },
    [removePeer, sendSignal]
  );

  const updatePresence = useCallback(
    async (updates: Partial<ParticipantPresence>) => {
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
    },
    [audioEnabled, handRaised, participants, screenSharing, videoEnabled]
  );

  const cleanupMediaAndRealtime = useCallback(async () => {
    if (accessCheckTimer.current !== null) {
      window.clearInterval(accessCheckTimer.current);
      accessCheckTimer.current = null;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
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
    setAudioEnabled(false);
    setVideoEnabled(false);
    setScreenSharing(false);
    setHandRaised(false);
    setActiveMeeting(null);
    setFloatingReactions([]);
    setPolls([]);
    setUnreadPollCount(0);
    setJoinedAt(null);
    setUnreadChatCount(0);
    setIsMinimized(false);
    setMiniPos(null);
    dragRef.current = null;
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

  useEffect(() => {
    if (!joinedAt) {
      setElapsedTime('00:00');
      return;
    }
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

    for (const [result, kind] of [
      [audioResult, 'microphone'],
      [videoResult, 'camera'],
    ] as const) {
      if (result.status === 'fulfilled') {
        for (const track of result.value.getTracks()) {
          track.enabled = false;
          stream.addTrack(track);
        }
      } else {
        errors.push(kind);
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

  const joinMeetingSession = useCallback(
    async ({ meeting, inviteCode = '' }: JoinMeetingArgs): Promise<boolean> => {
      if (!user?.id) return false;
      if (activeMeetingRef.current?.id === meeting.id) return true;
      if (activeMeetingRef.current) {
        await cleanupMediaAndRealtime();
      }

      setJoining(true);
      let participantRecorded = false;
      try {
        iceServersRef.current = getMeetingIceServers();
        const { data: joinedMeetingId, error: joinError } = meeting.guestMode
          ? await supabase.rpc('join_project_meeting_by_code', { p_code: inviteCode })
          : await supabase.rpc('join_project_meeting', { p_meeting_id: meeting.id });
        if (joinError) throw joinError;
        if (meeting.guestMode && joinedMeetingId !== meeting.id) {
          throw new Error('The invite code does not match this meeting.');
        }
        participantRecorded = true;

        const stream = await captureLocalMedia();
        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          await supabase.rpc('leave_project_meeting', { p_meeting_id: meeting.id });
          return false;
        }
        localStreamRef.current = stream;
        setLocalStream(stream);

        const room = supabase.channel(getMeetingRoomTopic(meeting.id), {
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
                meeting.id,
                participant.userId,
                user.id.localeCompare(participant.userId) < 0
              ).catch((error) => {
                console.error('Could not connect meeting participant:', error);
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
              meeting.id,
              remoteId,
              user.id.localeCompare(remoteId) < 0
            ).catch((error) => {
              console.error('Could not connect meeting participant:', error);
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
        });

        room.on('broadcast', { event: 'chat_message' }, ({ payload }) => {
          const messageId = payload?.messageId;
          if (isUserId(messageId)) {
            void loadChatMessage(meeting.id, messageId).catch(() => undefined);
            setUnreadChatCount((count) => count + 1);
          }
        });

        room.on('broadcast', { event: 'poll_created' }, ({ payload }) => {
          const incoming = payload?.poll as MeetingPoll | undefined;
          if (!incoming?.id) return;
          setPolls((prev) => (prev.some((p) => p.id === incoming.id) ? prev : [incoming, ...prev]));
          setUnreadPollCount((c) => c + 1);
          toast.info(`New live poll: ${incoming.question}`);
        });

        room.on('broadcast', { event: 'poll_voted' }, ({ payload }) => {
          const { pollId, optionId, voterId } = payload || {};
          if (!pollId || !optionId || !voterId) return;
          setPolls((prev) =>
            prev.map((poll) => {
              if (poll.id !== pollId || poll.closed) return poll;
              return {
                ...poll,
                options: poll.options.map((opt) => {
                  const filtered = opt.voterIds.filter((id) => id !== voterId);
                  return opt.id === optionId
                    ? { ...opt, voterIds: [...filtered, voterId] }
                    : { ...opt, voterIds: filtered };
                }),
              };
            })
          );
        });

        room.on('broadcast', { event: 'poll_closed' }, ({ payload }) => {
          const { pollId } = payload || {};
          if (!pollId) return;
          setPolls((prev) =>
            prev.map((poll) => (poll.id === pollId ? { ...poll, closed: true } : poll))
          );
        });

        roomRef.current = room;
        await waitForSubscription(room);

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
        setActiveMeeting(meeting);
        setJoinedAt(new Date());
        setIsMinimized(false);
        void loadMeetingChat(meeting.id);

        accessCheckTimer.current = window.setInterval(async () => {
          if (accessCheckRunning.current) return;
          accessCheckRunning.current = true;
          try {
            const { data, error } = await supabase.rpc('projectflow_can_access_meeting_room', {
              p_topic: getMeetingRoomTopic(meeting.id),
            });
            if (error) throw error;
            if (data !== true) {
              toast.error('Meeting access was revoked. Your devices have been disconnected.');
              await cleanupMediaAndRealtime();
            }
          } catch {
            await cleanupMediaAndRealtime();
          } finally {
            accessCheckRunning.current = false;
          }
        }, 15000);

        toast.success('You joined the meeting. Audio and video are muted until you turn them on.');
        return true;
      } catch (error) {
        console.error('Could not join meeting:', error);
        toast.error(error instanceof Error ? error.message : 'Could not join meeting.');
        await cleanupMediaAndRealtime();
        if (participantRecorded) {
          await supabase.rpc('leave_project_meeting', { p_meeting_id: meeting.id });
        }
        return false;
      } finally {
        setJoining(false);
      }
    },
    [
      addFloatingReaction,
      cleanupMediaAndRealtime,
      ensurePeer,
      loadChatMessage,
      loadMeetingChat,
      removePeer,
      user,
    ]
  );

  const leaveMeetingSession = useCallback(
    async (endMeeting = false) => {
      const meeting = activeMeetingRef.current;
      if (!meeting) return;
      setLeaving(true);
      try {
        if (endMeeting && roomRef.current) {
          await roomRef.current.send({
            type: 'broadcast',
            event: 'meeting_ended',
            payload: { meetingId: meeting.id },
          });
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
      }
    },
    [cleanupMediaAndRealtime]
  );

  const toggleAudio = useCallback(async () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      toast.error('No microphone is available. Leave and rejoin after connecting one.');
      return;
    }
    const enabled = !audioEnabled;
    track.enabled = enabled;
    setAudioEnabled(enabled);
    await updatePresence({ audioEnabled: enabled });
  }, [audioEnabled, updatePresence]);

  const toggleVideo = useCallback(async () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) {
      toast.error('No camera is available. Leave and rejoin after connecting one.');
      return;
    }
    const enabled = !videoEnabled;
    track.enabled = enabled;
    setVideoEnabled(enabled);
    await updatePresence({ videoEnabled: enabled });
  }, [updatePresence, videoEnabled]);

  const stopScreenShare = useCallback(async () => {
    const stream = screenStreamRef.current;
    if (!stream) return;
    screenStreamRef.current = null;
    stream.getTracks().forEach((track) => track.stop());
    const cameraTrack = localStreamRef.current?.getVideoTracks()[0] || null;
    await Promise.allSettled(
      Array.from(peerConnections.current.values()).map((peer) =>
        peer.videoSender.replaceTrack(cameraTrack)
      )
    );
    setScreenStream(null);
    setScreenSharing(false);
    await updatePresence({ screenSharing: false });
  }, [updatePresence]);

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error('Screen sharing is not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = stream.getVideoTracks()[0];
      if (!track) throw new Error('No screen-share video track was selected.');
      screenStreamRef.current = stream;
      setScreenStream(stream);
      await Promise.all(
        Array.from(peerConnections.current.values()).map((peer) =>
          peer.videoSender.replaceTrack(track)
        )
      );
      track.addEventListener('ended', () => void stopScreenShare());
      setScreenSharing(true);
      await updatePresence({ screenSharing: true });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') return;
      toast.error(error instanceof Error ? error.message : 'Could not share your screen.');
    }
  }, [stopScreenShare, updatePresence]);

  const toggleHandRaise = useCallback(async () => {
    const raised = !handRaised;
    setHandRaised(raised);
    await updatePresence({ handRaised: raised });
    toast.info(raised ? 'Hand raised' : 'Hand lowered');
  }, [handRaised, updatePresence]);

  const sendReaction = useCallback(
    async (emoji: string) => {
      const room = roomRef.current;
      const localUser = userRef.current;
      if (!room || !localUser) return;
      addFloatingReaction(emoji, 'You');
      await room.send({
        type: 'broadcast',
        event: 'reaction',
        payload: { emoji, senderName: localUser.name || 'ProjectFlow member' },
      });
    },
    [addFloatingReaction]
  );

  const sendChatMessage = useCallback(
    async (body: string): Promise<boolean> => {
      const meeting = activeMeetingRef.current;
      if (!meeting || !body.trim()) return false;
      try {
        const { data: messageId, error } = await supabase.rpc('send_project_meeting_message', {
          p_meeting_id: meeting.id,
          p_body: body.trim(),
        });
        if (error) throw error;
        if (typeof messageId !== 'string') throw new Error('The message could not be saved.');

        if (roomRef.current) {
          await roomRef.current.send({
            type: 'broadcast',
            event: 'chat_message',
            payload: { messageId },
          });
        }
        await loadChatMessage(meeting.id, messageId);
        return true;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not send message.');
        return false;
      }
    },
    [loadChatMessage]
  );

  const createPoll = useCallback(async (question: string, optionLabels: string[]) => {
    const room = roomRef.current;
    const localUser = userRef.current;
    if (!room || !localUser) return;
    const cleanQuestion = question.trim();
    const cleanOptions = optionLabels.map((o) => o.trim()).filter(Boolean);
    if (!cleanQuestion || cleanOptions.length < 2) return;

    const newPoll: MeetingPoll = {
      id: crypto.randomUUID(),
      question: cleanQuestion,
      options: cleanOptions.map((label) => ({
        id: crypto.randomUUID(),
        label,
        voterIds: [],
      })),
      createdBy: localUser.id,
      creatorName: localUser.name || 'You',
      createdAt: new Date().toISOString(),
      closed: false,
    };

    setPolls((prev) => [newPoll, ...prev]);
    await room.send({
      type: 'broadcast',
      event: 'poll_created',
      payload: { poll: newPoll },
    });
    toast.success('Live poll launched');
  }, []);

  const votePoll = useCallback(async (pollId: string, optionId: string) => {
    const room = roomRef.current;
    const localUser = userRef.current;
    if (!room || !localUser) return;

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId || poll.closed) return poll;
        return {
          ...poll,
          options: poll.options.map((opt) => {
            const filtered = opt.voterIds.filter((id) => id !== localUser.id);
            return opt.id === optionId
              ? { ...opt, voterIds: [...filtered, localUser.id] }
              : { ...opt, voterIds: filtered };
          }),
        };
      })
    );

    await room.send({
      type: 'broadcast',
      event: 'poll_voted',
      payload: { pollId, optionId, voterId: localUser.id },
    });
  }, []);

  const closePoll = useCallback(async (pollId: string) => {
    const room = roomRef.current;
    if (!room) return;
    setPolls((prev) =>
      prev.map((poll) => (poll.id === pollId ? { ...poll, closed: true } : poll))
    );
    await room.send({
      type: 'broadcast',
      event: 'poll_closed',
      payload: { pollId },
    });
  }, []);

  const clampMiniPos = useCallback((x: number, y: number) => {
    const el = miniplayerRef.current;
    const width = el?.offsetWidth || 288;
    const height = el?.offsetHeight || 228;
    const margin = 12;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const maxY = Math.max(margin, window.innerHeight - height - margin);
    return {
      x: Math.min(Math.max(margin, x), maxX),
      y: Math.min(Math.max(margin, y), maxY),
    };
  }, []);

  const handleMiniPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;

    const rect = miniplayerRef.current?.getBoundingClientRect();
    const originX = miniPos ? miniPos.x : rect?.left ?? 16;
    const originY = miniPos ? miniPos.y : rect?.top ?? Math.max(16, window.innerHeight - 260);

    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX,
      originY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleMiniPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const state = dragRef.current;
    if (!state || state.pointerId !== e.pointerId) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < 4) return;
    state.moved = true;

    setMiniPos(clampMiniPos(state.originX + dx, state.originY + dy));
  };

  const handleMiniPointerUp = (e: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
    }
  };

  useEffect(() => {
    if (!miniPos) return;
    const onResize = () => {
      setMiniPos((prev) => (prev ? clampMiniPos(prev.x, prev.y) : null));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampMiniPos, miniPos]);

  const showMiniplayer = Boolean(activeMeeting && (!isOnMeetingRoute || isMinimized));
  const spotlightRemote = participants.find((p) => p.userId !== user?.id);
  const miniStream = spotlightRemote
    ? remoteStreams.get(spotlightRemote.userId) || null
    : screenStream || localStream;
  const miniHasVideo = spotlightRemote
    ? Boolean(spotlightRemote.videoEnabled || spotlightRemote.screenSharing)
    : Boolean(videoEnabled || screenSharing);
  const miniName = spotlightRemote ? spotlightRemote.name : user?.name || 'You';
  const miniAvatar = spotlightRemote ? spotlightRemote.avatar : user?.avatar || '';
  const openPollsCount = polls.filter((p) => !p.closed).length;

  return (
    <MeetingContext.Provider
      value={{
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
        isMinimized,
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
      }}
    >
      {children}

      {/* DRAGGABLE COMPACT MINIPLAYER */}
      {showMiniplayer && activeMeeting && (
        <aside
          ref={miniplayerRef}
          aria-label="Active meeting miniplayer"
          onPointerDown={handleMiniPointerDown}
          onPointerMove={handleMiniPointerMove}
          onPointerUp={handleMiniPointerUp}
          onPointerCancel={handleMiniPointerUp}
          style={
            miniPos
              ? { left: `${miniPos.x}px`, top: `${miniPos.y}px`, bottom: 'auto' }
              : undefined
          }
          className={`fixed z-50 w-72 cursor-grab touch-none select-none overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-shadow duration-200 active:cursor-grabbing ${
            miniPos ? '' : 'bottom-20 left-4 lg:bottom-4'
          } ${
            isDarkTheme
              ? 'border-zinc-700/90 bg-zinc-900/95 text-white'
              : 'border-slate-200 bg-white/95 text-slate-900'
          }`}
        >
          <div className="group relative">
            <MiniplayerVideoPreview
              stream={miniStream}
              name={miniName}
              avatar={miniAvatar}
              hasVideo={miniHasVideo}
              isDarkTheme={isDarkTheme}
            />

            <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                {elapsedTime}
              </span>

              <div className="flex items-center gap-1">
                {openPollsCount > 0 && (
                  <span
                    title="Active live poll"
                    className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                  >
                    <BarChart3 size={10} />
                    Poll
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                  <Users size={10} />
                  {participants.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMinimized(false);
                if (!isOnMeetingRoute) {
                  navigate(activeMeeting.returnPath);
                }
              }}
              title="Expand meeting"
              className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition hover:bg-indigo-700"
            >
              <Maximize2 size={12} />
              <span>Expand</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{activeMeeting.title}</p>
              <p
                className={`truncate font-mono text-[10px] ${
                  isDarkTheme ? 'text-zinc-400' : 'text-slate-500'
                }`}
              >
                {formatMeetingCode(activeMeeting.invite_code)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => void toggleAudio()}
                title={audioEnabled ? 'Mute mic' : 'Unmute mic'}
                className={`rounded-full p-2 transition ${
                  audioEnabled
                    ? isDarkTheme
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
              </button>

              <button
                type="button"
                onClick={() => void toggleVideo()}
                title={videoEnabled ? 'Turn camera off' : 'Turn camera on'}
                className={`rounded-full p-2 transition ${
                  videoEnabled
                    ? isDarkTheme
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
              </button>

              <button
                type="button"
                onClick={() => void leaveMeetingSession(false)}
                disabled={leaving}
                title="Leave meeting"
                className="rounded-full bg-red-600 p-2 text-white transition hover:bg-red-700"
              >
                <PhoneOff size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
}
