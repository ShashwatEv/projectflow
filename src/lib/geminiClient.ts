/**
 * AI Assistant Client for ProjectFlow Code Studio
 * Powered by OpenRouter OpenAI-compatible API
 */

// Configured model slug
const PRIMARY_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';

// Fallback list of active free-tier models in case the primary free endpoint is at capacity
const FALLBACK_MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen-2.5-coder-32b-instruct:free',
];

function getOpenRouterApiKey(): string {
  return (
    import.meta.env.VITE_OPENROUTER_API_KEY ||
    localStorage.getItem('pf_openrouter_key') ||
    localStorage.getItem('pf_gemini_key') ||
    ''
  ).trim();
}

/**
 * Ask AI Code Assistant for review, suggestions, explanations, or code generation.
 */
export async function askGeminiCodeAssistant(
  prompt: string,
  currentCode: string = '',
  currentFilename: string = ''
): Promise<string> {
  const apiKey = getOpenRouterApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing OpenRouter API Key. Please configure VITE_OPENROUTER_API_KEY in your .env or save "pf_openrouter_key" in localStorage.'
    );
  }

  const systemMessage = `You are an expert full-stack engineer and coding assistant inside ProjectFlow Code Studio.
Analyze code snippets, answer architectural questions, detect bugs, and write clean, robust, and production-ready code.
Current File: ${currentFilename || 'untitled'}`;

  const userContent = currentCode.trim()
    ? `Context file (${currentFilename || 'source'}):\n\`\`\`\n${currentCode}\n\`\`\`\n\nPrompt:\n${prompt}`
    : prompt;

  const candidateModels = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastErrorMessage = '';

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://projectflow.dev',
          'X-Title': 'ProjectFlow Code Studio',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 2500,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        const errorMsg =
          errorJson?.error?.message ||
          `HTTP ${response.status} (${response.statusText})`;
        lastErrorMessage = errorMsg;
        console.warn(`Model ${model} returned error: ${errorMsg}. Trying next candidate...`);
        continue;
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || data.choices?.[0]?.text;

      if (reply && reply.trim()) {
        return reply.trim();
      }
    } catch (err: any) {
      lastErrorMessage = err.message || 'Network request failed';
      console.warn(`Failed call to ${model}:`, err);
    }
  }

  throw new Error(
    lastErrorMessage || 'All available free models failed or were temporarily rate-limited on OpenRouter.'
  );
}

/**
 * Helper to test if the key is valid and connected
 */
export async function verifyOpenRouterConnection(): Promise<boolean> {
  try {
    const testReply = await askGeminiCodeAssistant('ping');
    return Boolean(testReply);
  } catch {
    return false;
  }
}