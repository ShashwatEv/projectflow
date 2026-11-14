import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectMeetings from '../ProjectMeetings';

const { mockFrom, mockRpc } = vi.hoisted(() => ({ mockFrom: vi.fn(), mockRpc: vi.fn() }));

interface MockResult {
  data: unknown;
  error: null;
}

interface MockQuery {
  select: () => MockQuery;
  eq: () => MockQuery;
  order: () => MockQuery;
  limit: () => MockQuery;
  maybeSingle: () => Promise<MockResult>;
  then: (
    onfulfilled?: (value: MockResult) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) => Promise<unknown>;
}

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Meeting member',
      avatar: '',
    },
  }),
}));

describe('ProjectMeetings', () => {
  beforeEach(() => {
    mockFrom.mockClear();
    mockRpc.mockReset();
    mockFrom.mockImplementation((table: string) => {
      const result: MockResult =
        table === 'projects'
          ? { data: { id: 'project-id', name: 'Launch project' }, error: null }
          : {
              data: [
                {
                  id: 'meeting-id',
                  project_id: 'project-id',
                  title: 'Planning',
                  created_by: '00000000-0000-4000-8000-000000000001',
                  created_at: '2026-11-14T06:00:00.000Z',
                  ended_at: null,
                },
              ],
              error: null,
            };
      const builder = {} as MockQuery;
      builder.select = vi.fn(() => builder);
      builder.eq = vi.fn(() => builder);
      builder.order = vi.fn(() => builder);
      builder.limit = vi.fn(() => builder);
      builder.maybeSingle = vi.fn(async () => result);
      builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
      return builder;
    });
  });

  it('requires explicit media consent before enabling the join action', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-id/meetings']}>
        <Routes>
          <Route path="/projects/:id/meetings" element={<ProjectMeetings />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Join meeting' }));
    const joinButton = screen.getByRole('button', { name: 'Join with devices' });
    expect(joinButton).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox', { name: /I consent to accessing my microphone and camera/i }));
    expect(joinButton).toBeEnabled();
  });

  it('opens the consent flow for a meeting selected from an invite link', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/project-id/meetings?join=meeting-id']}>
        <Routes>
          <Route path="/projects/:id/meetings" element={<ProjectMeetings />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Join Planning' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join with devices' })).toBeDisabled();
  });

  it('lets a signed-in non-member open a code-backed guest invite without loading project data', async () => {
    mockRpc.mockResolvedValue({
      data: [{
        id: 'meeting-id',
        title: 'Planning',
        created_at: '2026-11-14T06:00:00.000Z',
        ended_at: null,
      }],
      error: null,
    });

    render(
      <MemoryRouter initialEntries={['/meetings/guest/meeting-id?code=ABCD-1234-EFGH-5678']}>
        <Routes>
          <Route path="/meetings/guest/:id" element={<ProjectMeetings guestMode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Join Planning' })).toBeInTheDocument();
    expect(mockRpc).toHaveBeenCalledWith('find_project_meeting_by_code', {
      p_code: 'ABCD1234EFGH5678',
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
