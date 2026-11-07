import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  askProjectFlowChatAgent,
  getOpenRouterErrorMessage,
  parseCodeEditResponse,
  verifyOpenRouterApiKey,
  verifyOpenRouterConnection,
} from '../../lib/geminiClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('geminiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key');
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  describe('verifyOpenRouterConnection', () => {
    it('returns true when API responds successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'pong' } }],
        }),
      });

      const result = await verifyOpenRouterConnection();
      
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('sends an explicit conversational thread to OpenRouter using the supplied key', async () => {
      const mockedFetch = vi.mocked(fetch);
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"reply":"hello","taskProposal":null}' } }] }),
      } as Response);

      await askProjectFlowChatAgent(
        'system prompt',
        [
          { role: 'user', content: 'Authorized project context' },
          { role: 'assistant', content: 'Previous answer' },
          { role: 'user', content: 'What next?' },
        ],
        'explicit-user-key'
      );

      const options = mockedFetch.mock.calls[0]?.[1];
      const headers = options?.headers as Record<string, string>;
      expect((headers.Authorization || '').startsWith('Bearer ')).toBe(true);
      const requestBody = JSON.parse(String(options?.body));
      expect(requestBody.model).toBe('openrouter/free');
      expect(requestBody.messages).toEqual([
        { role: 'system', content: 'system prompt' },
        { role: 'user', content: 'Authorized project context' },
        { role: 'assistant', content: 'Previous answer' },
        { role: 'user', content: 'What next?' },
      ]);
      expect(String(options?.body)).not.toContain('explicit-user-key');
    });

    it('checks a pasted OpenRouter key with a minimal request', async () => {
      const mockedFetch = vi.mocked(fetch);
      mockedFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Ready' } }] }),
      } as Response);

      await verifyOpenRouterApiKey('personal-key');
      const options = mockedFetch.mock.calls[0]?.[1];
      expect((options?.headers as Record<string, string>).Authorization?.startsWith('Bearer ')).toBe(true);
      const requestBody = JSON.parse(String(options?.body));
      expect(requestBody.model).toBe('openrouter/free');
      expect(String(options?.body)).not.toContain('personal-key');
      expect(requestBody.messages.at(-1)).toEqual({
        role: 'user',
        content: 'Reply: Ready',
      });
    });

    it('converts common provider failures into actionable user guidance', () => {
      expect(getOpenRouterErrorMessage(new Error('HTTP 401 (Unauthorized)')))
        .toContain('OpenRouter rejected this key');
      expect(getOpenRouterErrorMessage(new Error('HTTP 429')))
        .toContain('rate-limited this request');
      expect(getOpenRouterErrorMessage(new Error('Failed to fetch')))
        .toContain('Check your connection');
      expect(getOpenRouterErrorMessage(new Error('This model is unavailable for free')))
        .toContain('available free model');
    });

    it('returns false when API returns error', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Invalid API key' } }),
      });

      const result = await verifyOpenRouterConnection();
      
      expect(result).toBe(false);
    });

    it('returns false when network fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyOpenRouterConnection();
      
      expect(result).toBe(false);
    });

    it('returns false when no API key is configured', async () => {
      vi.stubEnv('VITE_OPENROUTER_API_KEY', '');
      localStorage.removeItem('pf_openrouter_key');
      localStorage.removeItem('pf_gemini_key');

      const result = await verifyOpenRouterConnection();
      
      expect(result).toBe(false);
    });

    describe('parseCodeEditResponse', () => {
      it('parses a proposal and preserves original contents for diff review', () => {
        const contextFiles = [{ path: 'src/App.tsx', content: 'export default 1;' }];
        const result = parseCodeEditResponse(
          '```json\n{"summary":"Update app","edits":[{"path":"src/App.tsx","content":"export default 2;"}]}\n```',
          contextFiles
        );

        expect(result).toEqual({
          summary: 'Update app',
          edits: [{
            path: 'src/App.tsx',
            content: 'export default 2;',
            originalContent: 'export default 1;',
          }],
        });
      });

      it('rejects edits to paths outside the selected repository context', () => {
        expect(() => parseCodeEditResponse(
          '{"edits":[{"path":"../../.env","content":"exfiltrate"}]}',
          [{ path: 'src/App.tsx', content: 'source' }]
        )).toThrow('unselected file');
      });

      it('rejects proposals with no file edits', () => {
        expect(() => parseCodeEditResponse('{"summary":"No context needed","edits":[]}', [
          { path: 'src/App.tsx', content: 'source' },
        ])).toThrow('did not propose any file changes');
      });
    });
  });
});