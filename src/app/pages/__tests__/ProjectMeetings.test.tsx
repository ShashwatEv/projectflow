import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '../../../context/ThemeContext';
import { MeetingProvider } from '../../../context/MeetingContext';
import ProjectMeetings from '../ProjectMeetings';

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const broadcastHandlers = new Map<string, (args: { payload: unknown }) => void>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockChannel: Record<string, any> = {
  on: vi.fn((_type: string, filter: { event?: string }, cb: (args: { payload: unknown }) => void) => {
    if (filter?.event) {
      broadcastHandlers.set(filter.event, cb);
    }
    return mockChannel;
  }),
  subscribe: vi.fn((cb?: (status: string) => void) => {
    cb?.('SUBSCRIBED');
    return mockChannel;
  }),
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
    user: { id: '11111111-1111-4111-8111-111111111199', name: 'Test User', role: 'Member', avatar: '' },
    session: null,
  }),
}));

const sampleMeeting = {
  id: '11111111-1111-4111-8111-111111111111',
  project_id: '22222222-2222-4222-8222-222222222222',
  title: 'Sprint Sync',
  created_by: '11111111-1111-4111-8111-111111111199',
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
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
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
    broadcastHandlers.clear();
    window.sessionStorage.clear();

    class MockMediaStream {
      private tracks: MediaStreamTrack[] = [];
      addTrack(track: MediaStreamTrack) {
        this.tracks.push(track);
      }
      removeTrack(track: MediaStreamTrack) {
        this.tracks = this.tracks.filter((t) => t !== track);
      }
      getTracks() {
        return this.tracks;
      }
      getAudioTracks() {
        return this.tracks.filter((t) => t.kind === 'audio');
      }
      getVideoTracks() {
        return this.tracks.filter((t) => t.kind === 'video');
      }
    }

    class MockPointerEvent extends MouseEvent {
      pointerId: number;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
      }
    }

    Object.defineProperty(globalThis, 'MediaStream', {
      configurable: true,
      writable: true,
      value: MockMediaStream,
    });

    Object.defineProperty(globalThis, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: MockPointerEvent,
    });

    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('No media device in test')),
        enumerateDevices: vi.fn().mockResolvedValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    Object.defineProperty(globalThis.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      writable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    Object.defineProperty(globalThis.HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    Object.defineProperty(globalThis.HTMLElement.prototype, 'hasPointerCapture', {
      configurable: true,
      writable: true,
      value: vi.fn(() => false),
    });

    Object.defineProperty(globalThis.HTMLElement.prototype, 'releasePointerCapture', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

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

    mockRpc.mockImplementation((fn: string) => {
      if (fn === 'join_project_meeting') {
        return Promise.resolve({ data: sampleMeeting.id, error: null });
      }
      if (fn === 'projectflow_can_access_meeting_room') {
        return Promise.resolve({ data: true, error: null });
      }
      if (fn === 'leave_project_meeting') {
        return Promise.resolve({ data: null, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });
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

  it('supports creating and voting on a live poll during an active meeting', async () => {
    renderProjectMeetings(
      `/projects/${sampleMeeting.project_id}/meetings?join=${sampleMeeting.id}`
    );

    const joinButton = await screen.findByRole('button', { name: /join with devices/i });
    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      fireEvent.click(joinButton);
    });

    const pollsButton = await screen.findByRole('button', { name: /live polls/i });
    fireEvent.click(pollsButton);

    fireEvent.click(screen.getByRole('button', { name: /create poll/i }));
    fireEvent.change(screen.getByPlaceholderText(/ask a question/i), {
      target: { value: 'Ship v1.3 today?' },
    });
    fireEvent.change(screen.getByPlaceholderText(/option 1/i), {
      target: { value: 'Yes' },
    });
    fireEvent.change(screen.getByPlaceholderText(/option 2/i), {
      target: { value: 'Wait' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /launch poll/i }));
    });

    const yesOptionButton = await screen.findByRole('button', { name: /yes/i });
    await act(async () => {
      fireEvent.click(yesOptionButton);
    });

    expect(screen.getByText(/100% \(1\)/i)).toBeInTheDocument();
  });

  it('minimizes into a draggable miniplayer across routes and restores on expand', async () => {
    renderProjectMeetings(
      `/projects/${sampleMeeting.project_id}/meetings?join=${sampleMeeting.id}`
    );

    const joinButton = await screen.findByRole('button', { name: /join with devices/i });
    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
      fireEvent.click(joinButton);
    });

    const miniplayerLink = await screen.findByRole('link', { name: /miniplayer/i });
    fireEvent.click(miniplayerLink);

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    const miniplayer = screen.getByRole('complementary', { name: /active meeting miniplayer/i });
    expect(miniplayer).toBeInTheDocument();

    fireEvent(
      miniplayer,
      new PointerEvent('pointerdown', {
        pointerId: 1,
        button: 0,
        buttons: 1,
        clientX: 50,
        clientY: 200,
        bubbles: true,
      })
    );
    fireEvent(
      miniplayer,
      new PointerEvent('pointermove', {
        pointerId: 1,
        button: 0,
        buttons: 1,
        clientX: 170,
        clientY: 320,
        bubbles: true,
      })
    );
    fireEvent(
      miniplayer,
      new PointerEvent('pointerup', {
        pointerId: 1,
        button: 0,
        buttons: 0,
        clientX: 170,
        clientY: 320,
        bubbles: true,
      })
    );

    await waitFor(() => {
      expect(miniplayer.style.left).toBe('120px');
      expect(miniplayer.style.top).toBe('120px');
    });

    fireEvent.click(screen.getByRole('button', { name: /expand/i }));
    expect(
      await screen.findByRole('heading', { name: sampleMeeting.title })
    ).toBeInTheDocument();
  });
});