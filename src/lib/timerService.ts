import { supabase } from './supabaseClient';
import { toast } from 'sonner';

export async function startTaskTimer(taskId: string, taskTitle: string) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const { error } = await supabase
      .from('active_timers')
      .upsert({
        user_id: authData.user.id,
        task_id: taskId,
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) throw error;

    toast.success(`Tracking started for "${taskTitle}"`);
    // Reload or dispatch a custom event so HeaderTaskTimer refreshes immediately
    window.dispatchEvent(new Event('active-timer-started'));
  } catch (err: any) {
    toast.error('Failed to start timer');
  }
}