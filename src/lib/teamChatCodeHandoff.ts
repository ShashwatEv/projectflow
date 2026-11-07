interface TeamChatCodeHandoff {
  userId: string;
  prompt: string;
  apiKey: string;
  createdAt: number;
}

let pendingHandoff: TeamChatCodeHandoff | null = null;

export function getPersonalOpenRouterKeyStorageKey(userId: string) {
  return `pf_team_chat_openrouter_key:${userId}`;
}

export function setTeamChatCodeHandoff(handoff: Omit<TeamChatCodeHandoff, 'createdAt'>) {
  pendingHandoff = {
    ...handoff,
    prompt: handoff.prompt.slice(0, 4000),
    createdAt: Date.now(),
  };
}

export function consumeTeamChatCodeHandoff(userId: string): TeamChatCodeHandoff | null {
  const handoff = pendingHandoff;
  pendingHandoff = null;
  if (
    !handoff
    || handoff.userId !== userId
    || Date.now() - handoff.createdAt > 10 * 60 * 1000
  ) {
    return null;
  }
  return handoff;
}
