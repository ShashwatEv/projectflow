import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectMeetings from '../ProjectMeetings';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

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
  supabase: { from: mockFrom },
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
});
