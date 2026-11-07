export interface ChatAssistantMessage {
  content: string;
  user?: { name?: string };
}

export interface ChatTaskSuggestion {
  title: string;
  source: ChatAssistantMessage;
}

const ACTION_PHRASE =
  /\b(?:action item|todo|follow[\s-]?up|we should|we need to|let['’]s|lets|need to)\s*[:,-]?\s+(.+)/i;

export function extractExplicitTaskTitle(input: string) {
  const match = input.trim().match(/^(?:please\s+)?(?:create|add|make)\s+(?:a\s+)?task\s*[:-]\s*(.+)$/i);
  const title = match?.[1]?.trim().replace(/[.!?]+$/, '').trim();
  return title && title.length <= 180 ? title : null;
}

export function findTaskSuggestions(messages: ChatAssistantMessage[]): ChatTaskSuggestion[] {
  const seen = new Set<string>();
  const suggestions: ChatTaskSuggestion[] = [];

  for (const message of messages.slice(-30).reverse()) {
    const match = message.content.match(ACTION_PHRASE);
    const title = match?.[1]?.trim().replace(/[.!?]+$/, '').trim();
    if (!title || title.length < 5 || title.length > 180) continue;

    const normalized = title.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    suggestions.push({ title: title.charAt(0).toUpperCase() + title.slice(1), source: message });
    if (suggestions.length === 5) break;
  }

  return suggestions;
}
