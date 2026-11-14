import { describe, expect, it } from 'vitest';
import {
  createMeetingInviteUrl,
  formatMeetingCode,
  getMeetingIceServers,
  getMeetingInviteOrigin,
  getMeetingRoomTopic,
  getMeetingSignalTopic,
  isMeetingSignal,
  normalizeMeetingCode,
} from '../meetingConfig';

describe('meeting configuration and signaling', () => {
  it('uses the free public STUN fallback and accepts configured STUN/TURN servers', () => {
    expect(getMeetingIceServers(undefined)).toEqual([
      { urls: 'stun:stun.l.google.com:19302' },
    ]);
    expect(
      getMeetingIceServers(
        '[{"urls":["turn:turn.example.test:3478"],"username":"temporary-user","credential":"temporary-secret"}]'
      )
    ).toEqual([
      {
        urls: ['turn:turn.example.test:3478'],
        username: 'temporary-user',
        credential: 'temporary-secret',
      },
    ]);
  });

  it('rejects invalid ICE configuration instead of silently ignoring it', () => {
    expect(() => getMeetingIceServers('{')).toThrow(/JSON array/);
    expect(() => getMeetingIceServers('[{"urls":[]}]')).toThrow(/URL/);
  });

  it('uses separate project-scoped room and directed signaling topics', () => {
    expect(getMeetingRoomTopic('meeting-id')).toBe('projectflow-meeting:meeting-id');
    expect(getMeetingSignalTopic('meeting-id', 'alice', 'bob')).toBe(
      'projectflow-meeting-signal:meeting-id:alice:bob'
    );
  });

  it('normalizes and shares meeting codes without changing their identity', () => {
    expect(normalizeMeetingCode(' abcd-1234 efgh-5678 ')).toBe('ABCD1234EFGH5678');
    expect(formatMeetingCode('abcd1234efgh5678')).toBe('ABCD-1234-EFGH-5678');
    expect(createMeetingInviteUrl('abcd1234efgh5678', 'https://projectflow.example')).toBe(
      'https://projectflow.example/meetings?code=ABCD-1234-EFGH-5678'
    );
  });

  it('uses the public web app origin for desktop invite links unless configured', () => {
    expect(getMeetingInviteOrigin(undefined, true, 'file://app')).toBe(
      'https://projectflow-d9dk.onrender.com'
    );
    expect(getMeetingInviteOrigin(' https://custom.example/ ', true, 'file://app')).toBe(
      'https://custom.example/'
    );
    expect(getMeetingInviteOrigin(undefined, false, 'https://web.example')).toBe('https://web.example');
  });

  it('accepts only well-formed WebRTC signaling messages', () => {
    expect(
      isMeetingSignal({
        type: 'offer',
        description: { type: 'offer', sdp: 'v=0' },
      })
    ).toBe(true);
    expect(isMeetingSignal({ type: 'ice', candidate: { candidate: '' } })).toBe(true);
    expect(isMeetingSignal({ type: 'offer', description: { type: 'answer', sdp: 'v=0' } })).toBe(
      false
    );
    expect(isMeetingSignal({ type: 'offer', description: { type: 'offer' } })).toBe(false);
    expect(isMeetingSignal(null)).toBe(false);
  });
});
