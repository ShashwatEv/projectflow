import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ModernTask } from '../app/components/ModernTaskCard';
import { isSuperAdmin } from '../lib/constants';

export interface SandboxTask extends ModernTask {
  isDemo?: boolean;
}

interface OnboardingSandboxContextType {
  isSandboxActive: boolean;
  canMutateDatabase: boolean;
  sandboxTasks: SandboxTask[];
  activeStepIndex: number;
  isTourOpen: boolean;
  isGuideOpen: boolean;
  guideSession: number;
  startTour: () => void;
  beginTour: () => void;
  closeGuide: () => void;
  closeTour: () => void;
  setTourStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateSandboxTaskStatus: (taskId: string, targetStatus: string) => void;
  addSandboxTask: (task: Partial<SandboxTask>) => void;
  seedStarterWorkspace: () => Promise<boolean>;
  promoteUserToLive: () => Promise<void>;
}

const DEFAULT_DEMO_TASKS: SandboxTask[] = [
  {
    id: 'demo-task-1',
    title: '👋 Welcome! Drag this task to "In Progress"',
    description: 'This is a temporary sandbox task. Your team will not see changes made here.',
    priority: 'high',
    assignees: [{ name: 'You', avatar: '/pfp.jpg' }],
    dueDate: 'Today',
    comments: 0,
    attachments: 0,
    tags: ['Sandbox', 'Tutorial'],
    isDemo: true,
  },
  {
    id: 'demo-task-2',
    title: 'Inspect Code Studio terminal outputs',
    description: 'Safe sandbox commands run in memory without touching real git repositories.',
    priority: 'medium',
    assignees: [{ name: 'You', avatar: '/pfp.jpg' }],
    dueDate: 'Tomorrow',
    comments: 0,
    attachments: 0,
    tags: ['Dev', 'Safe Mode'],
    isDemo: true,
  },
  {
    id: 'demo-task-3',
    title: 'Complete 2FA & identity verification',
    description: 'Promote your account to live database status to create real workspace projects.',
    priority: 'urgent',
    assignees: [{ name: 'Security Bot', avatar: '/pfp.jpg' }],
    dueDate: 'Sprint End',
    comments: 0,
    attachments: 0,
    tags: ['Verification'],
    isDemo: true,
  },
];

const STATUS_TAGS_TO_CLEAR = new Set([
  'todo',
  'inProgress',
  'in_progress',
  'review',
  'done',
  'To Do',
  'Done',
]);

function readSavedSandboxTasks(): SandboxTask[] {
  if (typeof window === 'undefined') return DEFAULT_DEMO_TASKS;
  try {
    const saved = localStorage.getItem('pf_sandbox_tasks');
    if (!saved) return DEFAULT_DEMO_TASKS;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as SandboxTask[]) : DEFAULT_DEMO_TASKS;
  } catch {
    return DEFAULT_DEMO_TASKS;
  }
}

const OnboardingSandboxContext = createContext<OnboardingSandboxContextType | undefined>(undefined);

export const OnboardingSandboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const seedingRef = useRef(false);

  const isAdminUser = isSuperAdmin(user?.email, user?.role);

  // Real database write authority requires: Root Admin OR (Verified Email + 2FA Enabled)
  const canMutateDatabase =
    isAdminUser || Boolean((user?.is_verified || user?.email_verified) && user?.is_2fa_enabled);

  // Initialize sandbox active state - admins are never restricted to sandbox
  const [isSandboxActive, setIsSandboxActive] = useState<boolean>(() => {
    if (isAdminUser) return false;
    return !canMutateDatabase;
  });

  const [sandboxTasks, setSandboxTasks] = useState<SandboxTask[]>(readSavedSandboxTasks);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [guideSession, setGuideSession] = useState<number>(0);

  useEffect(() => {
    if (isAdminUser) {
      setIsSandboxActive(false);
      return;
    }
    setIsSandboxActive(!canMutateDatabase);
  }, [canMutateDatabase, isAdminUser]);

  useEffect(() => {
    try {
      localStorage.setItem('pf_sandbox_tasks', JSON.stringify(sandboxTasks));
    } catch {
      // Ignore storage quota restrictions
    }
  }, [sandboxTasks]);

  const updateSandboxTaskStatus = (taskId: string, targetStatus: string) => {
    setSandboxTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              tags: [...t.tags.filter((tag) => !STATUS_TAGS_TO_CLEAR.has(tag)), targetStatus],
            }
          : t
      )
    );
  };

  const addSandboxTask = (task: Partial<SandboxTask>) => {
    const newTask: SandboxTask = {
      id: `demo-${Date.now()}`,
      title: task.title || 'Untitled Sandbox Draft',
      description: task.description || 'Temporary draft task.',
      priority: task.priority || 'medium',
      assignees: [{ name: 'You', avatar: '/pfp.jpg' }],
      dueDate: 'Today',
      comments: 0,
      attachments: 0,
      tags: ['Sandbox Draft'],
      isDemo: true,
    };
    setSandboxTasks((prev) => [newTask, ...prev]);
  };

  const seedStarterWorkspace = useCallback(async (): Promise<boolean> => {
    if (!user?.id || seedingRef.current) return false;

    const seedFlagKey = `pf_starter_seeded_${user.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(seedFlagKey) === 'true') {
      return false;
    }

    seedingRef.current = true;
    try {
      const { count, error: countError } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id);

      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        localStorage.setItem(seedFlagKey, 'true');
        return false;
      }

      const { data: createdProject, error: projError } = await supabase
        .from('projects')
        .insert({
          name: 'Starter Launchpad',
          description: 'Sample workspace project with starter tasks to explore boards, sprints, and Code Studio.',
          owner_id: user.id,
          status: 'active',
          progress: 25,
        })
        .select('id')
        .single();

      if (projError || !createdProject?.id) throw projError;

      const projectId = createdProject.id;
      const now = Date.now();
      const dayMs = 86_400_000;

      const { error: tasksError } = await supabase.from('tasks').insert([
        {
          title: 'Connect your GitHub repository in Project Settings',
          description: 'Link an owner/repo slug to browse branches, inspect Monaco diffs, and open PRs.',
          status: 'todo',
          priority: 'high',
          project_id: projectId,
          assigned_to: user.id,
          due_date: new Date(now + 2 * dayMs).toISOString(),
        },
        {
          title: 'Open a task in Code Studio and test a feature branch',
          description: 'Use the code icon on any task card to launch Code Studio with a pre-formatted branch.',
          status: 'in_progress',
          priority: 'medium',
          project_id: projectId,
          assigned_to: user.id,
          due_date: new Date(now + 4 * dayMs).toISOString(),
        },
        {
          title: 'Invite teammates and configure workspace notifications',
          description: 'Add collaborators from the Team Directory and review alert channels.',
          status: 'review',
          priority: 'low',
          project_id: projectId,
          assigned_to: user.id,
          due_date: new Date(now + 6 * dayMs).toISOString(),
        },
      ]);

      if (tasksError) throw tasksError;

      localStorage.setItem(seedFlagKey, 'true');
      localStorage.setItem('pf_selected_project_id', projectId);
      return true;
    } catch (err) {
      console.error('Failed to seed starter workspace:', err);
      return false;
    } finally {
      seedingRef.current = false;
    }
  }, [user?.id]);

  const startTour = () => {
    setActiveStepIndex(0);
    setIsTourOpen(false);
    setIsGuideOpen(true);
    setGuideSession((current) => current + 1);
  };

  const beginTour = () => {
    setIsGuideOpen(false);
    setActiveStepIndex(0);
    setIsTourOpen(true);
  };

  const closeGuide = () => {
    setIsGuideOpen(false);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    setIsGuideOpen(false);
  };

  const setTourStep = (index: number) => {
    setActiveStepIndex(index);
  };

  const nextStep = () => {
    setActiveStepIndex((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStepIndex((prev) => Math.max(0, prev - 1));
  };

  const promoteUserToLive = async () => {
    if (!user?.id) return;
    try {
      await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          onboarding_sandbox_cleared: true,
        })
        .eq('id', user.id);

      setIsSandboxActive(false);
      localStorage.removeItem('pf_sandbox_tasks');
      await seedStarterWorkspace();
    } catch (err) {
      console.error('Failed to clear sandbox mode:', err);
    }
  };

  return (
    <OnboardingSandboxContext.Provider
      value={{
        isSandboxActive,
        canMutateDatabase,
        sandboxTasks,
        activeStepIndex,
        isTourOpen,
        isGuideOpen,
        guideSession,
        startTour,
        beginTour,
        closeGuide,
        closeTour,
        setTourStep,
        nextStep,
        prevStep,
        updateSandboxTaskStatus,
        addSandboxTask,
        seedStarterWorkspace,
        promoteUserToLive,
      }}
    >
      {children}
    </OnboardingSandboxContext.Provider>
  );
};

export function useOnboardingSandbox() {
  const ctx = useContext(OnboardingSandboxContext);
  if (!ctx) {
    throw new Error('useOnboardingSandbox must be used within an OnboardingSandboxProvider');
  }
  return ctx;
}