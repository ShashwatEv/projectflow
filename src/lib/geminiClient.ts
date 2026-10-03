import { GoogleGenAI } from '@google/genai';

// Gather all configured keys from env or fallback to a custom team setting
const RAW_KEYS = [
  import.meta.env.VITE_OPENROUTER_KEY_1,
  import.meta.env.VITE_GEMINI_KEY_2,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getClient(key: string) {
  return new GoogleGenAI({ apiKey: key });
}

export async function askGeminiCodeAssistant(
  prompt: string,
  codeContext: string,
  filePath: string
): Promise<string> {
  const keys = RAW_KEYS.length > 0 ? RAW_KEYS : [localStorage.getItem('pf_gemini_key') || ''];
  const validKeys = keys.filter(Boolean);

  if (validKeys.length === 0) {
    throw new Error('No Gemini API keys found. Please configure VITE_GEMINI_KEY_1 in your .env file.');
  }

  let attempts = 0;
  const maxAttempts = validKeys.length;

  while (attempts < maxAttempts) {
    const key = validKeys[currentKeyIndex % validKeys.length];
    currentKeyIndex++;
    attempts++;

    if (!key) continue;

    try {
      const ai = getClient(key);
      const systemInstruction = `You are a concise, senior code assistant embedded inside ProjectFlow Code Studio.
File being edited: ${filePath || 'untitled'}

Review the following file context carefully:
\`\`\`
${codeContext}
\`\`\`

Instructions:
- Provide direct, concise explanations or code blocks.
- Avoid unnecessary chatter or long introductory greetings.
- When generating updated code, output clean code blocks that can be directly applied.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Key index ${(currentKeyIndex - 1) % validKeys.length} failed. Trying next key in pool...`, err);
      if (attempts >= maxAttempts) {
        throw new Error(err?.message || 'All API keys in the pool failed or hit limits.');
      }
    }
  }

  throw new Error('Failed to generate response after rotating all available keys.');
}