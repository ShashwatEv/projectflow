import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModernHeader } from '../../components/ModernHeader';

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockRemoveChannel = vi.fn();
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
};

vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    channel: vi.fn(() => mockChannel),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', role: 'Member', avatar: '/pfp.jpg' },
    signOut: vi.fn(),
  }),
}));

vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

vi.mock('../HeaderTaskTimer', () => ({
  default: () => <div data-testid="header-task-timer" />,
}));

function setupMocks(unreadNotifCount: number, roomUnreads: Array<{ room_id: string; unread_count: number }>) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'notifications') {
      return {
        select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
          if (opts?.head) {
            return {
              eq: () => ({
                eq: () => Promise.resolve({ count: unreadNotifCount, error: null }),
              }),
            };
          }
          return {
            eq: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          };
        },
      };
    }
    return {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    };
  });

  mockRpc.mockResolvedValue({ data: roomUnreads, error: null });
}

describe('ModernHeader unread badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides the badge when unread notifications and unread messages are both 0', async () => {
    setupMocks(0, []);

    render(
      <MemoryRouter>
        <ModernHeader />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('workspace_unread_counts');
    });

    expect(screen.queryByTestId('header-unread-badge')).toBeNull();
  });

  it('displays the combined count of unread notifications and unread workspace messages', async () => {
    setupMocks(1, [
      { room_id: 'room_1', unread_count: 2 },
      { room_id: 'room_2', unread_count: 1 },
    ]);

    render(
      <MemoryRouter>
        <ModernHeader />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('header-unread-badge')).toHaveTextContent('4');
    });
  });
});