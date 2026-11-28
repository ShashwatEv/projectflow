import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MemoryRouter } from 'react-router-dom';
import { ModernTaskCard, buildTaskBranchName, type ModernTask } from '../ModernTaskCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(String(key), String(value));
    },
  };
}

describe('ModernTaskCard Open in Code Studio', () => {
  const originalLocalStorage = window.localStorage;
  let memoryStorage: Storage;

  beforeEach(() => {
    mockNavigate.mockReset();
    memoryStorage = createMemoryStorage();
    Object.defineProperty(window, 'localStorage', {
      value: memoryStorage,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  });

  it('navigates to /code with taskId, projectId, and generated branch slug', () => {
    const sampleTask: ModernTask = {
      id: 'abcdef12-3456-7890',
      title: 'Implement OAuth Callback',
      description: 'Handle PKCE exchange',
      priority: 'high',
      assignees: [],
      dueDate: 'Nov 30',
      comments: 0,
      attachments: 0,
      tags: ['auth'],
      projectId: 'proj-42',
      githubRepo: 'ShashwatEv/projectflow',
    };

    render(
      <MemoryRouter>
        <DndProvider backend={HTML5Backend}>
          <ModernTaskCard task={sampleTask} />
        </DndProvider>
      </MemoryRouter>
    );

    const codeBtn = screen.getByRole('button', {
      name: /Open Implement OAuth Callback in Code Studio/i,
    });
    fireEvent.click(codeBtn);

    const expectedBranch = buildTaskBranchName(sampleTask.id, sampleTask.title);
    expect(expectedBranch).toBe('feat/task-abcdef-implement-oauth-callback');
    expect(window.localStorage.getItem('pf_selected_project_id')).toBe('proj-42');
    expect(window.localStorage.getItem('pf_active_repo')).toBe('ShashwatEv/projectflow');
    expect(mockNavigate).toHaveBeenCalledWith(
      `/code?taskId=abcdef12-3456-7890&branch=${encodeURIComponent(expectedBranch)}&projectId=proj-42`
    );
  });
});