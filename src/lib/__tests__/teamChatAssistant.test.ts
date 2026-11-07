import { describe, expect, it } from 'vitest';
import {
  extractExplicitTaskTitle,
  getTeamChatSlashCommand,
  containsCodeSnippet,
  getAiChatResponseText,
  getTeamChatCodeHandoffPrompt,
  getTeamChatAssistantMentionPrompt,
  findTaskSuggestions,
  getAssistantCapabilitiesReply,
  getAssistantContextErrorMessage,
  isCapabilitiesQuestion,
  isAiChatResponse,
  isCodeEditRequest,
  parseAgentReply,
} from '../teamChatAssistant';

describe('team chat assistant intent helpers', () => {
  it('accepts only explicit create-task prompts with a bounded title', () => {
    expect(extractExplicitTaskTitle('create task: Add audit logging.')).toBe('Add audit logging');
    expect(extractExplicitTaskTitle('what tasks are open?')).toBeNull();
    expect(extractExplicitTaskTitle(`create task: ${'x'.repeat(181)}`)).toBeNull();
  });

  it('extracts an @AI request from a team chat message', () => {
    expect(getTeamChatAssistantMentionPrompt('@AI')).toBe('Please respond to the recent team discussion.');
    expect(getTeamChatAssistantMentionPrompt('hello @AI')).toBe('hello');
    expect(getTeamChatAssistantMentionPrompt('@AI, summarize the release decision')).toBe('summarize the release decision');
    expect(getTeamChatAssistantMentionPrompt('hello team')).toBeNull();
  });

  it('creates grounded standup and retrospective prompts for supported slash commands', () => {
    expect(getTeamChatSlashCommand('/standup')).toMatchObject({
      name: 'standup',
      prompt: expect.stringContaining('Yesterday / completed, Today / next, Blockers'),
    });
    expect(getTeamChatSlashCommand('/standup focus on launch')).toMatchObject({
      name: 'standup',
      prompt: expect.stringContaining('Focus requested by the user: focus on launch'),
    });
    expect(getTeamChatSlashCommand('/retro')).toMatchObject({
      name: 'retro',
      prompt: expect.stringContaining('Went well, Could improve, Action items to review'),
    });
    expect(getTeamChatSlashCommand('/plan-sprint')).toMatchObject({
      name: 'plan-sprint',
      prompt: expect.stringContaining('Do not assign tasks, change statuses, or create tasks'),
    });
    expect(getTeamChatSlashCommand('/insights')).toMatchObject({
      name: 'insights',
      prompt: expect.stringContaining('Separate observed facts from hypotheses'),
    });
    expect(getTeamChatSlashCommand('/unknown')).toBeNull();
    expect(getTeamChatSlashCommand('please run /standup')).toBeNull();
  });

  it('identifies marked AI chat replies and detects code worth handing off', () => {
    const response = 'AI response: Here is a fix:\n```ts\nconst answer = 42;\n```';
    expect(isAiChatResponse(response, 'ai')).toBe(true);
    expect(isAiChatResponse(response, 'audio')).toBe(false);
    expect(isAiChatResponse('AI response: hello', undefined)).toBe(false);
    expect(getAiChatResponseText(response)).toContain('Here is a fix:');
    expect(containsCodeSnippet(response)).toBe(true);
    expect(containsCodeSnippet('Try this:\nconst answer = 42;')).toBe(true);
    expect(containsCodeSnippet('A normal response without code.')).toBe(false);
    expect(getTeamChatCodeHandoffPrompt(response)).toContain(response);
    expect(getTeamChatCodeHandoffPrompt(response)).toContain('I will select the tracked files in the target folder in Code Studio');
  });

  it('extracts distinct actionable discussion items without treating ordinary chat as tasks', () => {
    const suggestions = findTaskSuggestions([
      { content: 'Good morning, team.' },
      { content: 'Action item: add audit logging to exports.' },
      { content: 'We should add audit logging to exports!' },
      { content: 'Need to update the onboarding guide.' },
      { content: 'Decision: update the deployment checklist. We agreed this is needed before release.' },
      { content: 'We agreed to add a release checklist for the web app before Friday.' },
      { content: 'We decided to add retries to uploads.' },
      { content: 'Anyone free for lunch?' },
    ]);

    expect(suggestions.map((suggestion) => suggestion.title)).toEqual([
      'Add retries to uploads',
      'Add a release checklist for the web app before Friday',
      'Update the deployment checklist',
      'Update the onboarding guide',
      'Add audit logging to exports',
    ]);
  });

  it('recognizes explicit code-edit requests for the Code Studio handoff', () => {
    expect(isCodeEditRequest('Please fix the bug in the login component')).toBe(true);
    expect(isCodeEditRequest('Can you explain how tasks work?')).toBe(false);
    expect(isCodeEditRequest('hi')).toBe(false);
  });

  it('recognizes capability questions and describes supported actions positively', () => {
    expect(isCapabilitiesQuestion('What can you do?')).toBe(true);
    expect(isCapabilitiesQuestion('What can you help me with?')).toBe(true);
    expect(isCapabilitiesQuestion('What are your capabilities?')).toBe(true);
    expect(isCapabilitiesQuestion('Hi')).toBe(false);
    expect(getAssistantCapabilitiesReply()).toContain('help with code changes through Code Studio');
    expect(getAssistantCapabilitiesReply()).toContain('task draft');
  });

  it('parses a bounded task proposal without turning it into an automatic action', () => {
    expect(parseAgentReply(JSON.stringify({
      reply: 'I drafted a task for review.',
      taskProposal: {
        title: 'Add export audit logging',
        description: 'Record export actions.',
        projectId: 'project-1',
        priority: 'high',
      },
    }))).toEqual({
      reply: 'I drafted a task for review.',
      taskProposal: {
        title: 'Add export audit logging',
        description: 'Record export actions.',
        projectId: 'project-1',
        priority: 'high',
      },
    });
    expect(parseAgentReply('Plain text fallback')).toEqual({ reply: 'Plain text fallback' });
  });

  it('explains when the assistant Supabase migration is missing', () => {
    expect(getAssistantContextErrorMessage({
      code: 'PGRST202',
      message: 'Could not find the function team_chat_assistant_context',
    })).toContain('Apply supabase/migrations/202611070001_team_chat_assistant.sql');
  });

  it('explains how to fix an assistant RPC schema mismatch', () => {
    expect(getAssistantContextErrorMessage({
      code: '42703',
      message: 'column p.key does not exist',
    })).toContain('Apply supabase/migrations/202611070002_team_chat_assistant_project_schema_compat.sql');
  });
});
