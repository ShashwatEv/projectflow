import { describe, expect, it } from 'vitest';
import { extractExplicitTaskTitle, findTaskSuggestions } from '../teamChatAssistant';

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
});
