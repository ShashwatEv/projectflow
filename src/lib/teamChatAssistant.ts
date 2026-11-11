export interface ChatAssistantMessage {
  content: string;
  user?: { name?: string };
}

export interface ChatTaskSuggestion {
  title: string;
  source: ChatAssistantMessage;
}

export interface AgentTaskProposal {
  title: string;
  description: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AgentReply {
  reply: string;
  taskProposal?: AgentTaskProposal;
}

export interface TeamChatSlashCommand {
  name: 'standup' | 'retro' | 'plan-sprint' | 'insights';
  prompt: string;
}

export function getTeamChatSlashCommand(input: string): TeamChatSlashCommand | null {
  const match = input.trim().match(/^\/(standup|retro|plan-sprint|insights)\b(?:\s+([\s\S]*))?$/i);
  const commandName = match?.[1]?.toLowerCase();
  if (
    !match
    || (commandName !== 'standup' && commandName !== 'retro' && commandName !== 'plan-sprint' && commandName !== 'insights')
  ) return null;

  const focus = match[2]?.trim();
  const commandPrompts: Record<TeamChatSlashCommand['name'], string[]> = {
    standup: [
      'Create a concise team standup from only the supplied recent room discussion and authorized project/task context.',
      'Use these sections: Yesterday / completed, Today / next, Blockers.',
      'Do not infer personal assignments, dates, completed work, or blockers. If the context does not support a section, say it was not mentioned.',
    ],
    retro: [
      'Create a concise retrospective from only the supplied recent room discussion and authorized project/task context.',
      'Use these sections: Went well, Could improve, Action items to review.',
      'Only include points supported by the supplied context. Do not invent outcomes or imply action items have been created.',
    ],
    'plan-sprint': [
      'Draft a proposed sprint plan using only the supplied authorized project/task context, milestones, task comments, and current-room discussion.',
      'Group existing open tasks by project and suggest a reasonable focus and risks. Do not assign tasks, change statuses, or create tasks. Clearly mark any recommendation as a proposal.',
      'If there are no open tasks or relevant context, say so instead of inventing a plan.',
    ],
    insights: [
      'Analyze the supplied authorized cross-project tasks, milestones, task comments, and current-room discussion for possible duplicate work, shared blockers, or dependencies.',
      'Separate observed facts from hypotheses, name the projects/tasks supporting each insight, and state when there is not enough evidence. Do not mutate data.',
    ],
  };
  const prompt = [
    ...commandPrompts[commandName],
    focus ? `Focus requested by the user: ${focus}` : '',
  ].filter(Boolean).join('\n');

  return { name: commandName, prompt };
}

const AI_CHAT_RESPONSE_PREFIX = 'AI response:';

export function isAiChatResponse(content: string, fileType?: string) {
  return fileType === 'ai' && content.startsWith(AI_CHAT_RESPONSE_PREFIX);
}

export function getAiChatResponseText(content: string) {
  return content.replace(/^AI response:\s*/, '');
}

export function containsCodeSnippet(content: string) {
  return /```[\s\S]*?```/.test(content)
    || /(?:^|\n)\s*(?:import\s+.+\s+from\s+|export\s+(?:default\s+)?(?:function|class|const|interface|type)\b|function\s+\w+\s*\(|(?:const|let|var)\s+\w+\s*=|<\/?[A-Za-z][^>]*>)/m.test(content);
}

export function getTeamChatCodeHandoffPrompt(response: string) {
  return `Use this AI-generated code suggestion as the starting point for an edit. I will select the tracked files in the target folder in Code Studio. Adapt it to those files, prepare a diff for review, and do not claim changes are applied until I approve them.\n\n${response}`;
}

export function getTeamChatAssistantMentionPrompt(content: string) {
  if (!/@ai\b/i.test(content)) return null;
  const prompt = content
    .replace(/@ai\b/gi, '')
    .replace(/^[\s,:;-]+|[\s,:;-]+$/g, '')
    .trim();
  return prompt || 'Please respond to the recent team discussion.';
}

const ACTION_PHRASE =
  /\b(?:action item|todo|follow[\s-]?up|decision|we decided to|we agreed to|agreed to|we should|we need to|let['’]s|lets|need to)\s*[:,-]?\s+(.+)/i;

export function extractExplicitTaskTitle(input: string) {
  const match = input.trim().match(/^(?:please\s+)?(?:create|add|make)\s+(?:a\s+)?task\s*[:-]\s*(.+)$/i);
  const title = match?.[1]?.trim().replace(/[.!?]+$/, '').trim();
  return title && title.length <= 180 ? title : null;
}

export function isCodeEditRequest(input: string) {
  const asksForChange = /\b(?:edit|change|update|refactor|fix|implement|modify|create|delete|rename|remove|build)\b/i.test(input);
  const mentionsCode = /\b(?:code|file|files|repository|repo|source|function|component|class|bug|codestudio)\b/i.test(input);
  return asksForChange && mentionsCode;
}

export function isCapabilitiesQuestion(input: string) {
  return /\b(?:what|which)\b.{0,30}\b(?:can you do|are your capabilities|can you help with|do you support)\b/i.test(input)
    || /\bwhat can you help me with\b/i.test(input);
}

export function getAssistantCapabilitiesReply() {
  return 'I can answer questions using the project, task, milestone, and task-comment information available to your account; discuss recent team-chat context; create /standup and /retro summaries; draft a /plan-sprint proposal; and look for possible cross-project patterns with /insights. I can also prepare a task draft for you to review and confirm, or help with code changes through Code Studio. What would you like to work on?';
}

export function findTaskSuggestions(messages: ChatAssistantMessage[]): ChatTaskSuggestion[] {
  const seen = new Set<string>();
  const suggestions: ChatTaskSuggestion[] = [];

  for (const message of messages.slice(-30).reverse()) {
    const match = message.content.match(ACTION_PHRASE);
    const title = match?.[1]?.split(/[\r\n]|(?<=[.!?])\s/)[0]?.trim().replace(/[.!?]+$/, '').trim();
    if (!title || title.length < 5 || title.length > 180) continue;

    const normalized = title.toLowerCase();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    suggestions.push({ title: title.charAt(0).toUpperCase() + title.slice(1), source: message });
    if (suggestions.length === 5) break;
  }

  return suggestions;
}

export function parseAgentReply(rawResponse: string): AgentReply {
  const trimmed = rawResponse.trim();
  const jsonText = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const start = jsonText.indexOf('{');
  const end = jsonText.lastIndexOf('}');
  if (start < 0 || end <= start) return { reply: trimmed.slice(0, 4000) };

  let parsed: {
    reply?: unknown;
    taskProposal?: {
      title?: unknown;
      description?: unknown;
      projectId?: unknown;
      priority?: unknown;
    } | null;
  };
  try {
    parsed = JSON.parse(jsonText.slice(start, end + 1));
  } catch {
    return { reply: trimmed.slice(0, 4000) };
  }

  const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
    ? parsed.reply.trim().slice(0, 4000)
    : 'I could not produce a response. Please try asking another way.';
  const proposal = parsed.taskProposal;
  if (
    !proposal
    || typeof proposal.title !== 'string'
    || !proposal.title.trim()
    || proposal.title.trim().length > 180
    || typeof proposal.projectId !== 'string'
  ) {
    return { reply };
  }

  return {
    reply,
    taskProposal: {
      title: proposal.title.trim(),
      description: typeof proposal.description === 'string' ? proposal.description.slice(0, 2000) : '',
      projectId: proposal.projectId,
      priority: proposal.priority === 'low' || proposal.priority === 'high' ? proposal.priority : 'medium',
    },
  };
}

export function getAssistantContextErrorMessage(error: { code?: string; message?: string }) {
  const message = (error.message || '').toLowerCase();
  if (
    error.code === '42703'
    || (message.includes('column') && message.includes('does not exist'))
  ) {
    return 'The team-chat RPC expects columns that are not present in this Supabase project. Apply supabase/migrations/202611070002_team_chat_assistant_project_schema_compat.sql, then retry.';
  }
  if (
    ['PGRST202', '42883'].includes(error.code || '')
    || (message.includes('team_chat_assistant_context') && message.includes('not find'))
  ) {
    return 'The team-chat context function is not installed in this Supabase project. Apply supabase/migrations/202611070001_team_chat_assistant.sql to the linked project, then retry.';
  }
  return 'Project and task context could not be loaded. Confirm this app is configured for the intended Supabase project, check your connection and account access, then retry.';
}
