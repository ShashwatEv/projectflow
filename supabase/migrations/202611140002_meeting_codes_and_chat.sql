begin;

alter table public.project_meetings
  add column if not exists invite_code text;

update public.project_meetings
set invite_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
where invite_code is null;

alter table public.project_meetings
  alter column invite_code set default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16)),
  alter column invite_code set not null;

create unique index if not exists project_meetings_invite_code_uidx
  on public.project_meetings(invite_code);

create table if not exists public.project_meeting_messages (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.project_meetings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists project_meeting_messages_meeting_created_idx
  on public.project_meeting_messages(meeting_id, created_at);

alter table public.project_meeting_messages enable row level security;
revoke all on table public.project_meeting_messages from public, anon, authenticated;
grant select on table public.project_meeting_messages to authenticated;

drop policy if exists projectflow_meeting_messages_active_participant_read
  on public.project_meeting_messages;
create policy projectflow_meeting_messages_active_participant_read
on public.project_meeting_messages
for select to authenticated
using (
  exists (
    select 1
    from public.project_meetings m
    join public.project_meeting_participants participant
      on participant.meeting_id = m.id
      and participant.user_id = auth.uid()
      and participant.left_at is null
    where m.id = project_meeting_messages.meeting_id
      and m.ended_at is null
      and public.projectflow_can_access_project(m.project_id)
  )
);

create or replace function public.find_project_meeting_by_code(p_code text)
returns table (
  id uuid,
  project_id uuid,
  title text,
  ended_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $function$
declare
  normalized_code text := regexp_replace(upper(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g');
begin
  if auth.uid() is null or char_length(normalized_code) <> 16 then
    return;
  end if;

  return query
  select m.id, m.project_id, m.title, m.ended_at
  from public.project_meetings m
  where m.invite_code = normalized_code
    and m.ended_at is null
    and public.projectflow_can_access_project(m.project_id);
end;
$function$;

create or replace function public.send_project_meeting_message(
  p_meeting_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  meeting_project_id uuid;
  message_body text := btrim(coalesce(p_body, ''));
  message_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to send a meeting message';
  end if;
  if char_length(message_body) not between 1 and 2000 then
    raise exception 'Meeting messages must be between 1 and 2000 characters';
  end if;

  select m.project_id
  into meeting_project_id
  from public.project_meetings m
  where m.id = p_meeting_id
    and m.ended_at is null;

  if not found or not public.projectflow_can_access_project(meeting_project_id) then
    raise exception 'Meeting not found or you do not have access';
  end if;
  if not exists (
    select 1
    from public.project_meeting_participants participant
    where participant.meeting_id = p_meeting_id
      and participant.user_id = auth.uid()
      and participant.left_at is null
  ) then
    raise exception 'Join the meeting before sending messages';
  end if;

  insert into public.project_meeting_messages(meeting_id, user_id, body)
  values (p_meeting_id, auth.uid(), message_body)
  returning id into message_id;

  return message_id;
end;
$function$;

revoke all on function public.find_project_meeting_by_code(text) from public, anon;
revoke all on function public.send_project_meeting_message(uuid, text) from public, anon;
grant execute on function public.find_project_meeting_by_code(text) to authenticated;
grant execute on function public.send_project_meeting_message(uuid, text) to authenticated;

commit;
