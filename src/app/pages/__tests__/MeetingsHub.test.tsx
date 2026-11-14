import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MeetingsHub from '../MeetingsHub';

const { mockFrom, mockRpc } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

interface MockResult {
  data: unknown;
  error: null;
}

interface MockQuery {
  select: () => MockQuery;
  order: () => MockQuery;
  limit: () => MockQuery;
  then: (
    onfulfilled?: (value: MockResult) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) => Promise<unknown>;
}

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: { from: mockFrom, rpc: mockRpc },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: '00000000-0000-4000-8000-000000000001' } }),
}));

function CurrentRoute() {
  const location = useLocation();
  return <div data-testid="current-route">{location.pathname + location.search}</div>;
}

describe('MeetingsHub', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockRpc.mockResolvedValue({
      data: [{
        id: 'meeting-id',
        project_id: 'project-id',
        title: 'Planning',
        ended_at: null,
      }],
      error: null,
    });
    mockFrom.mockImplementation((table: string) => {
      const result: MockResult = {
        data: table === 'projects'
          ? [{ id: 'project-id', name: 'Launch project' }]
          : [{
              id: 'meeting-id',
              project_id: 'project-id',
              title: 'Planning',
              created_by: '00000000-0000-4000-8000-000000000001',
              created_at: '2026-11-14T06:00:00.000Z',
              ended_at: null,
              invite_code: 'ABCD1234EFGH5678',
            }],
        error: null,
      };
      const builder = {} as MockQuery;
      builder.select = vi.fn(() => builder);
      builder.order = vi.fn(() => builder);
      builder.limit = vi.fn(() => builder);
      builder.then = (onfulfilled, onrejected) =>
        Promise.resolve(result).then(onfulfilled, onrejected);
      return builder;
    });
  });

  it('finds a meeting from a pasted code and opens its project room', async () => {
    render(
      <MemoryRouter initialEntries={['/meetings']}>
        <Routes>
          <Route path="/meetings" element={<MeetingsHub />} />
          <Route path="/projects/:id/meetings" element={<CurrentRoute />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(await screen.findByRole('textbox', { name: 'Meeting code' }), {
      target: { value: 'abcd-1234 efgh-5678' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Find meeting' }));

    expect(await screen.findByTestId('current-route')).toHaveTextContent(
      '/projects/project-id/meetings?join=meeting-id'
    );
    expect(mockRpc).toHaveBeenCalledWith('find_project_meeting_by_code', {
      p_code: 'ABCD1234EFGH5678',
    });
  });
});
