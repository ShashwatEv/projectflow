import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  consumeTeamChatCodeHandoff,
  getPersonalOpenRouterKeyStorageKey,
  setTeamChatCodeHandoff,
} from '../teamChatCodeHandoff';

describe('team chat Code Studio handoff', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes a bounded prompt and the current key once to the same signed-in user', () => {
    setTeamChatCodeHandoff({
      userId: 'user-1',
      prompt: 'Change this file',
      apiKey: 'personal-key',
    });

    expect(consumeTeamChatCodeHandoff('user-1')).toMatchObject({
      userId: 'user-1',
      prompt: 'Change this file',
      apiKey: 'personal-key',
    });
    expect(consumeTeamChatCodeHandoff('user-1')).toBeNull();
    expect(getPersonalOpenRouterKeyStorageKey('user-1')).toBe('pf_team_chat_openrouter_key:user-1');
  });

  it('does not deliver a handoff to a different account and expires old handoffs', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    setTeamChatCodeHandoff({
      userId: 'user-1',
      prompt: 'Change this file',
      apiKey: 'personal-key',
    });
    expect(consumeTeamChatCodeHandoff('user-2')).toBeNull();

    vi.spyOn(Date, 'now').mockReturnValue(now);
    setTeamChatCodeHandoff({
      userId: 'user-1',
      prompt: 'Change this file',
      apiKey: 'personal-key',
    });
    vi.spyOn(Date, 'now').mockReturnValue(now + 10 * 60 * 1000 + 1);
    expect(consumeTeamChatCodeHandoff('user-1')).toBeNull();
  });
});
