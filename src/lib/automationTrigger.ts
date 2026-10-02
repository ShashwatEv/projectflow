import { supabase } from './supabaseClient';

export interface WebhookPayload {
  event: 'task_created' | 'task_completed' | 'code_pushed';
  title: string;
  description: string;
  user?: string;
}

export async function dispatchAutomation(payload: WebhookPayload) {
  try {
    const { data: automations, error } = await supabase
      .from('automations')
      .select('webhook_url')
      .eq('is_active', true)
      .eq('event_type', payload.event);

    if (error || !automations || automations.length === 0) return;

    for (const auto of automations) {
      if (!auto.webhook_url) continue;

      const body = {
        content: `**[ProjectFlow Alert] ${payload.title}**\n${payload.description}\n_Triggered by: ${payload.user || 'Member'}_`,
      };

      await fetch(auto.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch((err) => console.warn('Webhook dispatch failed:', err));
    }
  } catch (err) {
    console.error('Automation error:', err);
  }
}