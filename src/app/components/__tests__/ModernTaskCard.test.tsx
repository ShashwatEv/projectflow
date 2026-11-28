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

describe('ModernTaskCard Open in Code Studio', () => {
  let store: Map<string, string>;
  let getItemSpy: ReturnType<typeof vi.spyOn<Storage, 'getItem'>>;
  let setItemSpy: ReturnType<typeof vi.spyOn<Storage, 'setItem'>>;

  beforeEach(() => {
    mockNavigate.mockReset();
    store = new Map<string, string>();
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      return store.has(key) ? store.get(key)! : null;
    });
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      store.set(key, String(value));
    });
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
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
    expect(localStorage.getItem('pf_selected_project_id')).toBe('proj-42');
    expect(localStorage.getItem('pf_active_repo')).toBe('ShashwatEv/projectflow');
    expect(mockNavigate).toHaveBeenCalledWith(
      `/code?taskId=abcdef12-3456-7890&branch=${encodeURIComponent(expectedBranch)}&projectId=proj-42`
    );
  });
});