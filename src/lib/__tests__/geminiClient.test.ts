import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyOpenRouterConnection } from '../../lib/geminiClient';

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
  });
});