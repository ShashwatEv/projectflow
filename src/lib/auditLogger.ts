import { supabase } from './supabaseClient';

export async function recordAuditLog(action: string, category: 'security' | 'projects' | 'integrations' | 'tasks' = 'security', details: Record<string, any> = {}) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    await supabase.from('audit_logs').insert({
      user_id: authData.user.id,
      action,
      category,
      details,
    });
  } catch (err) {
    console.error('Failed to dispatch audit entry:', err);
  }
}