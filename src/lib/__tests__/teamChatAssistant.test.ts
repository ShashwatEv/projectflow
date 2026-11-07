import { describe, expect, it } from 'vitest';
import {
  extractExplicitTaskTitle,
  findTaskSuggestions,
  getAssistantContextErrorMessage,
  isCodeEditRequest,
  parseAgentReply,
} from '../teamChatAssistant';

describe('team chat assistant intent helpers', () => {
  it('accepts only explicit create-task prompts with a bounded title', () => {
    expect(extractExplicitTaskTitle('create task: Add audit logging.')).toBe('Add audit logging');
    expect(extractExplicitTaskTitle('what tasks are open?')).toBeNull();
    expect(extractExplicitTaskTitle(`create task: ${'x'.repeat(181)}`)).toBeNull();
  });

  it('extracts distinct actionable discussion items without treating ordinary chat as tasks', () => {
    const suggestions = findTaskSuggestions([
      { content: 'Good morning, team.' },
      { content: 'Action item: add audit logging to exports.' },
      { content: 'We should add audit logging to exports!' },
      { content: 'Need to update the onboarding guide.' },
      { content: 'Anyone free for lunch?' },
    ]);

    expect(suggestions.map((suggestion) => suggestion.title)).toEqual([
      'Update the onboarding guide',
      'Add audit logging to exports',
    ]);
  });

  it('recognizes explicit code-edit requests for the Code Studio handoff', () => {
    expect(isCodeEditRequest('Please fix the bug in the login component')).toBe(true);
    expect(isCodeEditRequest('Can you explain how tasks work?')).toBe(false);
    expect(isCodeEditRequest('hi')).toBe(false);
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
