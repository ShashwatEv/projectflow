import { supabase } from './supabaseClient';
import { recordAuditLog } from './auditLogger';

export interface AutomationEventPayload {
  event: 'code_pushed' | 'task_created' | 'task_completed' | 'project_created';
  title: string;
  description: string;
  user?: string;
  metadata?: Record<string, any>;
}

export async function dispatchAutomation(payload: AutomationEventPayload) {
  try {
    // 1. Resolve true authenticated user identity
    let authorName = payload.user;
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || null;

    if (!authorName) {
      if (authData?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', authData.user.id)
          .maybeSingle();

        authorName =
          userProfile?.name ||
          authData.user.user_metadata?.full_name ||
          authData.user.email?.split('@')[0] ||
          'Authenticated Member';
      } else {
        authorName = 'Workspace Automation Service';
      }
    }

    // 2. Fetch matching active automation rules
    const { data: rules, error } = await supabase
      .from('automations')
      .select('*')
      .eq('status', 'active');

    if (error && error.code !== '42P01') {
      console.error('Error fetching automation rules:', error);
    }

    const nowIso = new Date().toISOString();

    // 3. Process matching trigger conditions
    if (rules && rules.length > 0) {
      for (const rule of rules) {
        const triggerLower = rule.trigger.toLowerCase();
        const eventLower = payload.event.replace('_', ' ').toLowerCase();

        if (
          triggerLower.includes(eventLower) ||
          triggerLower.includes('any') ||
          (payload.event === 'code_pushed' && triggerLower.includes('code'))
        ) {
          await supabase
            .from('automations')
            .update({ last_run: nowIso })
            .eq('id', rule.id);

          const recipientId = rule.user_id || currentUserId;
          if (recipientId) {
            await supabase.from('notifications').insert({
              user_id: recipientId,
              title: `Automation Fired: ${rule.title}`,
              message: `${payload.description} (Triggered by ${authorName})`,
              type: 'system',
              is_read: false,
            });
          }
        }
      }
    }

    // 4. Log event into the security & workspace audit ledger
    await recordAuditLog(
      `Triggered Automation Event: ${payload.title}`,
      'integrations',
      {
        event: payload.event,
        author: authorName,
        metadata: payload.metadata || {},
      }
    );
  } catch (err) {
    console.error('Failed to dispatch automation pipeline:', err);
  }
}