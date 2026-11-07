import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamChatAssistant from '../TeamChatAssistant';
import { consumeTeamChatCodeHandoff } from '../../../lib/teamChatCodeHandoff';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  askAgent: vi.fn(),
  verifyKey: vi.fn(),
  navigate: vi.fn(),
  localStorageValues: new Map<string, string>(),
  sessionStorageValues: new Map<string, string>(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    rpc: mocks.rpc,
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'member@example.com', role: 'Member' },
  }),
}));

vi.mock('../../../lib/geminiClient', () => ({
  askProjectFlowChatAgent: mocks.askAgent,
  verifyOpenRouterApiKey: mocks.verifyKey,
  getOpenRouterErrorMessage: (error: unknown) => (
    error instanceof Error && error.message.includes('401')
      ? 'OpenRouter rejected this key. Check that it is active and try again.'
      : error instanceof Error ? error.message : 'OpenRouter error'
  ),
}));

describe('TeamChatAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.askAgent.mockResolvedValue(JSON.stringify({ reply: 'Platform is active. What would you like to work on?' }));
    mocks.verifyKey.mockResolvedValue(undefined);
    mocks.localStorageValues.clear();
    mocks.sessionStorageValues.clear();
    vi.mocked(localStorage.getItem).mockImplementation((key) => mocks.localStorageValues.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
      mocks.localStorageValues.set(key, value);
    });
    vi.mocked(localStorage.removeItem).mockImplementation((key) => {
      mocks.localStorageValues.delete(key);
    });
    vi.mocked(sessionStorage.getItem).mockImplementation((key) => mocks.sessionStorageValues.get(key) ?? null);
    vi.mocked(sessionStorage.setItem).mockImplementation((key, value) => {
      mocks.sessionStorageValues.set(key, value);
    });
    vi.mocked(sessionStorage.removeItem).mockImplementation((key) => {
      mocks.sessionStorageValues.delete(key);
    });
    mocks.rpc.mockImplementation((name: string) => {
      if (name === 'team_chat_assistant_context') {
        return Promise.resolve({
          data: {
            projects: [{
              id: 'project-1',
              name: 'Platform',
              key: 'PLAT',
              status: 'active',
              can_create_task: true,
            }],
            tasks: [],
          },
          error: null,
        });
      }
      return Promise.resolve({ data: 'task-1', error: null });
    });
  });

  it('waits for explicit confirmation before creating the suggested task', async () => {
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'Action item: add audit logging to exports.' }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'create task: Add alerts' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    await screen.findByText('Review task before creating');
    expect(mocks.rpc).not.toHaveBeenCalledWith('create_chat_task', expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Confirm & create task' }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith('create_chat_task', {
      p_project_id: 'project-1',
      p_title: 'Add alerts',
      p_description: null,
      p_priority: 'medium',
    }));
  });

  it('turns a team decision into a task draft with its source and waits for confirmation', async () => {
    const decision = 'Decision: add a release checklist before Friday.';
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: decision, user: { name: 'Rae' } }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    expect(screen.getByText('Add a release checklist before Friday')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review as task' }));
    await screen.findByText('Review task before creating');
    expect(screen.getByLabelText('Description (optional)')).toHaveValue(`Rae: ${decision}`);
    expect(mocks.rpc).not.toHaveBeenCalledWith('create_chat_task', expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Confirm & create task' }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith('create_chat_task', {
      p_project_id: 'project-1',
      p_title: 'Add a release checklist before Friday',
      p_description: `Rae: ${decision}`,
      p_priority: 'medium',
    }));
  });

  it('does not offer task creation for a project where the current user is a viewer', async () => {
    mocks.rpc.mockImplementation((name: string) => {
      if (name === 'team_chat_assistant_context') {
        return Promise.resolve({
          data: {
            projects: [{
              id: 'project-1',
              name: 'Platform',
              key: 'PLAT',
              status: 'active',
              can_create_task: false,
            }],
            tasks: [],
          },
          error: null,
        });
      }
      return Promise.resolve({ data: 'task-1', error: null });
    });

    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'Action item: add audit logging to exports.' }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    expect(screen.getByText('Add audit logging to exports')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Review as task/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'create task: Add alerts' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));
    expect(await screen.findByText(/creating tasks requires owner, editor, or admin access/i)).toBeInTheDocument();
    expect(screen.queryByText('Review task before creating')).not.toBeInTheDocument();
    expect(mocks.rpc).not.toHaveBeenCalledWith('create_chat_task', expect.anything());
  });

  it('uses the language model with authorized context and the current chat discussion', async () => {
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'Action item: add audit logging to exports.', user: { name: 'Rae' } }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    await screen.findByText('OpenRouter key verified');
    expect(localStorage.getItem('pf_team_chat_openrouter_key:user-1')).toBeNull();
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'hi' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    expect(await screen.findByText('Platform is active. What would you like to work on?')).toBeInTheDocument();
    expect(mocks.askAgent).toHaveBeenCalledWith(
      expect.stringContaining('conversational team chat agent'),
      expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('"name":"Platform"'),
        }),
        expect.objectContaining({
          content: expect.stringContaining('"author":"Rae","text":"Action item: add audit logging to exports."'),
        }),
        expect.objectContaining({ content: 'hi' }),
      ]),
      'user-owned-test-key'
    );
  });

  it('posts the generated response publicly for an explicit @AI request', async () => {
    const onPublicReply = vi.fn().mockResolvedValue(undefined);
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'hello @AI', user: { name: 'Rae' } }]}
        initialPrompt="hello"
        publicReplyRoom="room-1"
        onPublicReply={onPublicReply}
      />
    );

    await screen.findByText(/the generated answer will be posted publicly in this team chat/i);
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    await screen.findByText('OpenRouter key verified');
    fireEvent.click(screen.getByRole('button', { name: 'Generate AI reply in team chat' }));

    await waitFor(() => expect(onPublicReply).toHaveBeenCalledWith(
      'Platform is active. What would you like to work on?',
      'room-1'
    ));
  });

  it('turns an AI task proposal into a review draft and creates it only after confirmation', async () => {
    mocks.askAgent.mockResolvedValue(JSON.stringify({
      reply: 'I suggest adding an audit logging task to Platform. Please review the draft.',
      taskProposal: {
        title: 'Add export audit logging',
        description: 'Record export actions in the audit log.',
        projectId: 'unauthorized-project',
        priority: 'high',
      },
    }));
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'We need export audit logging.' }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    await screen.findByText('OpenRouter key verified');
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'Please create a task for export audit logging.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    await screen.findByText('Review task before creating');
    expect(screen.getByLabelText('Project')).toHaveValue('project-1');
    expect(mocks.rpc).not.toHaveBeenCalledWith('create_chat_task', expect.anything());
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & create task' }));
    await waitFor(() => expect(mocks.rpc).toHaveBeenCalledWith('create_chat_task', {
      p_project_id: 'project-1',
      p_title: 'Add export audit logging',
      p_description: 'Record export actions in the audit log.',
      p_priority: 'high',
    }));
  });

  it('does not send chat or workspace context to the model until disclosure is accepted', async () => {
    render(
      <TeamChatAssistant
        isOpen
        onClose={vi.fn()}
        messages={[{ content: 'Internal roadmap detail.' }]}
      />
    );

    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'What is happening?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('accept the data-sharing notice');
    expect(mocks.askAgent).not.toHaveBeenCalled();
  });

  it('remembers a verified key per account in this browser and requires fresh data consent', async () => {
    const props = {
      onClose: vi.fn(),
      messages: [] as { content: string }[],
    };
    const { rerender } = render(<TeamChatAssistant isOpen {...props} />);
    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'personal-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Remember OpenRouter key in this browser' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));

    await screen.findByText('OpenRouter key verified');
    expect(mocks.verifyKey).toHaveBeenCalledWith('personal-key');
    expect(localStorage.getItem('pf_team_chat_openrouter_key:user-1')).toBe('personal-key');

    rerender(<TeamChatAssistant isOpen={false} {...props} />);
    rerender(<TeamChatAssistant isOpen {...props} />);
    await screen.findByText('Saved OpenRouter key loaded; test again if it no longer works');
    expect(screen.getByRole('checkbox', { name: 'Remember OpenRouter key in this browser' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' })).not.toBeChecked();
  });

  it('shows actionable guidance when OpenRouter rejects a key', async () => {
    mocks.verifyKey.mockRejectedValue(new Error('HTTP 401 (Unauthorized)'));
    render(<TeamChatAssistant isOpen onClose={vi.fn()} messages={[]} />);
    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'invalid-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('OpenRouter rejected this key');
  });

  it('hands explicit code-edit requests to Code Studio without applying edits', async () => {
    render(<TeamChatAssistant isOpen onClose={vi.fn()} messages={[]} />);
    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    await screen.findByText('OpenRouter key verified');
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'Please fix the bug in the login component' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Continue in Code Studio' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/code?assistantHandoff=1');
    expect(mocks.askAgent).not.toHaveBeenCalled();
    expect(consumeTeamChatCodeHandoff('user-1')).toMatchObject({
      prompt: 'Please fix the bug in the login component',
      apiKey: 'user-owned-test-key',
    });
  });

  it('answers capability questions with supported features instead of a limitation list', async () => {
    render(<TeamChatAssistant isOpen onClose={vi.fn()} messages={[]} />);
    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'What can you do?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    expect(await screen.findByText(/answer questions using the project and task information/i)).toBeInTheDocument();
    expect(screen.getByText(/prepare a task draft for you to review and confirm/i)).toBeInTheDocument();
    expect(mocks.askAgent).not.toHaveBeenCalled();
  });

  it('immediately offers the Code Studio workflow for code-edit requests', async () => {
    render(<TeamChatAssistant isOpen onClose={vi.fn()} messages={[]} />);
    await screen.findByText('1 accessible project · 0 recent tasks');
    fireEvent.change(screen.getByLabelText('OpenRouter API key'), {
      target: { value: 'user-owned-test-key' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Allow sending chat data to OpenRouter' }));
    fireEvent.click(screen.getByRole('button', { name: /Test & connect/ }));
    await screen.findByText('OpenRouter key verified');
    fireEvent.change(screen.getByLabelText('Ask the team chat assistant'), {
      target: { value: 'Please fix the bug in the login component' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send question to assistant' }));

    expect(await screen.findByText(/I can help prepare that change in Code Studio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue in Code Studio' })).toBeInTheDocument();
    expect(mocks.askAgent).not.toHaveBeenCalled();
  });
});
