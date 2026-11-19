import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';
import { MeetingProvider } from '../../../context/MeetingContext';
import ProjectMeetings from '../ProjectMeetings';

const mockFrom = vi.fn();
const mockRpc = vi.fn();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChannel: Record<string, any> = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(() => mockChannel),
  track: vi.fn().mockResolvedValue('ok'),
  untrack: vi.fn().mockResolvedValue('ok'),
  send: vi.fn().mockResolvedValue('ok'),
  presenceState: vi.fn(() => ({})),
};

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', role: 'Member', avatar: '' },
    session: null,
  }),
}));

const sampleMeeting = {
  id: '11111111-1111-4111-8111-111111111111',
  project_id: '22222222-2222-4222-8222-222222222222',
  title: 'Sprint Sync',
  created_by: 'user-1',
  created_at: '2026-11-19T10:00:00.000Z',
  ended_at: null,
  invite_code: 'ABCD1234EF567890',
};

function renderProjectMeetings(route: string, guestMode = false) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <MeetingProvider>
          <Routes>
            <Route path="/projects/:id/meetings" element={<ProjectMeetings />} />
            <Route
              path="/meetings/guest/:id"
              element={<ProjectMeetings guestMode={guestMode} />}
            />
          </Routes>
        </MeetingProvider>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('ProjectMeetings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: { id: sampleMeeting.project_id, name: 'Core Platform' },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'project_meetings') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [sampleMeeting], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'project_meeting_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      };
    });
    mockRpc.mockResolvedValue({ data: null, error: null });
  });

  it('requires explicit media consent before enabling the join action', async () => {
    renderProjectMeetings(
      `/projects/${sampleMeeting.project_id}/meetings?join=${sampleMeeting.id}`
    );

    const joinButton = await screen.findByRole('button', { name: /join with devices/i });
    expect(joinButton).toBeDisabled();

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(joinButton).toBeEnabled();
  });

  it('opens the consent flow for a meeting selected from an invite link', async () => {
    renderProjectMeetings(
      `/projects/${sampleMeeting.project_id}/meetings?join=${sampleMeeting.id}`
    );

    expect(
      await screen.findByRole('heading', { name: new RegExp(`join ${sampleMeeting.title}`, 'i') })
    ).toBeInTheDocument();
  });

  it('lets a signed-in non-member open a code-backed guest invite without loading project data', async () => {
    mockRpc.mockImplementation((fn: string) => {
      if (fn === 'find_project_meeting_by_code') {
        return Promise.resolve({
          data: {
            id: sampleMeeting.id,
            title: sampleMeeting.title,
            created_at: sampleMeeting.created_at,
            ended_at: null,
          },
          error: null,
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    renderProjectMeetings(
      `/meetings/guest/${sampleMeeting.id}?code=ABCD-1234-EF56-7890`,
      true
    );

    expect(
      await screen.findByRole('heading', { name: new RegExp(`join ${sampleMeeting.title}`, 'i') })
    ).toBeInTheDocument();
    expect(mockFrom).not.toHaveBeenCalledWith('projects');
  });
});