import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ModernTask } from '../app/components/ModernTaskCard';

export interface SandboxTask extends ModernTask {
  isDemo?: boolean;
}

interface OnboardingSandboxContextType {
  isSandboxActive: boolean;
  canMutateDatabase: boolean;
  sandboxTasks: SandboxTask[];
  activeStepIndex: number;
  isTourOpen: boolean;
  startTour: () => void;
  closeTour: () => void;
  setTourStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateSandboxTaskStatus: (taskId: string, targetStatus: string) => void;
  addSandboxTask: (task: Partial<SandboxTask>) => void;
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

const OnboardingSandboxContext = createContext<OnboardingSandboxContextType | undefined>(undefined);

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

export const OnboardingSandboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  
  // Real database write authority requires: Root Admin OR (Verified Email + 2FA Enabled)
  const canMutateDatabase = isSuperAdmin || Boolean((user?.is_verified || user?.email_verified) && user?.is_2fa_enabled);

  // Initialize sandbox active state
  const [isSandboxActive, setIsSandboxActive] = useState<boolean>(() => {
    if (isSuperAdmin) return false;
    return !canMutateDatabase;
  });

  const [sandboxTasks, setSandboxTasks] = useState<SandboxTask[]>(() => {
    const saved = localStorage.getItem('pf_sandbox_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_TASKS;
  });

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isSuperAdmin) {
      setIsSandboxActive(false);
      return;
    }
    setIsSandboxActive(!canMutateDatabase);
  }, [canMutateDatabase, isSuperAdmin]);

  useEffect(() => {
    localStorage.setItem('pf_sandbox_tasks', JSON.stringify(sandboxTasks));
  }, [sandboxTasks]);

  const updateSandboxTaskStatus = (taskId: string, targetStatus: string) => {
    setSandboxTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, tags: [...t.tags.filter((tag) => tag !== 'To Do' && tag !== 'Done'), targetStatus] } : t))
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

  const startTour = () => {
    setActiveStepIndex(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
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
      await supabase.from('users').update({
        onboarding_completed: true,
        onboarding_sandbox_cleared: true,
      }).eq('id', user.id);

      setIsSandboxActive(false);
      localStorage.removeItem('pf_sandbox_tasks');
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
        startTour,
        closeTour,
        setTourStep,
        nextStep,
        prevStep,
        updateSandboxTaskStatus,
        addSandboxTask,
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