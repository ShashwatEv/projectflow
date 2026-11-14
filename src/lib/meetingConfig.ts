export type MeetingSignal =
  | { type: 'offer'; description: RTCSessionDescriptionInit }
  | { type: 'answer'; description: RTCSessionDescriptionInit }
  | { type: 'ice'; candidate: RTCIceCandidateInit };

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
];

export function getMeetingIceServers(raw = import.meta.env.VITE_MEETING_ICE_SERVERS): RTCIceServer[] {
  if (!raw?.trim()) return DEFAULT_ICE_SERVERS;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('VITE_MEETING_ICE_SERVERS must contain a JSON array of ICE servers.');
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('VITE_MEETING_ICE_SERVERS must be a non-empty JSON array.');
  }

  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`ICE server ${index + 1} must be an object.`);
    }

    const value = entry as Record<string, unknown>;
    const urls = value.urls;
    const validUrls =
      (typeof urls === 'string' && urls.trim().length > 0) ||
      (Array.isArray(urls) &&
        urls.length > 0 &&
        urls.every((url) => typeof url === 'string' && url.trim().length > 0));
    if (!validUrls) throw new Error(`ICE server ${index + 1} needs a string URL or non-empty URL array.`);
    if (value.username !== undefined && typeof value.username !== 'string') {
      throw new Error(`ICE server ${index + 1} has an invalid username.`);
    }
    if (value.credential !== undefined && typeof value.credential !== 'string') {
      throw new Error(`ICE server ${index + 1} has an invalid credential.`);
    }

    return {
      urls: urls as string | string[],
      ...(typeof value.username === 'string' ? { username: value.username } : {}),
      ...(typeof value.credential === 'string' ? { credential: value.credential } : {}),
    };
  });
}

export function getMeetingRoomTopic(meetingId: string): string {
  return `projectflow-meeting:${meetingId}`;
}

export function getMeetingSignalTopic(
  meetingId: string,
  senderId: string,
  recipientId: string
): string {
  return `projectflow-meeting-signal:${meetingId}:${senderId}:${recipientId}`;
}

export function isMeetingSignal(value: unknown): value is MeetingSignal {
  if (!value || typeof value !== 'object') return false;
  const signal = value as Record<string, unknown>;

  if (signal.type === 'offer' || signal.type === 'answer') {
    const description = signal.description as Record<string, unknown> | undefined;
    return Boolean(
      description &&
        description.type === signal.type &&
        typeof description.sdp === 'string' &&
        description.sdp.length > 0 &&
        description.sdp.length <= 100_000
    );
  }

  if (signal.type === 'ice') {
    const candidate = signal.candidate as Record<string, unknown> | undefined;
    return Boolean(
      candidate &&
        typeof candidate.candidate === 'string' &&
        candidate.candidate.length <= 4096 &&
        (candidate.sdpMid === undefined || candidate.sdpMid === null || typeof candidate.sdpMid === 'string') &&
        (candidate.sdpMLineIndex === undefined ||
          candidate.sdpMLineIndex === null ||
          typeof candidate.sdpMLineIndex === 'number')
    );
  }

  return false;
}
