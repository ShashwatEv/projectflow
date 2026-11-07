import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamChatAssistant from '../TeamChatAssistant';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
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

describe('TeamChatAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    await screen.findByText('1 accessible projects · 0 recent tasks');
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

    await screen.findByText('1 accessible projects · 0 recent tasks');
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
});
