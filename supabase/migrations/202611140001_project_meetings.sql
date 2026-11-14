begin;

create table if not exists public.project_meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists project_meetings_project_created_idx
  on public.project_meetings(project_id, created_at desc);

create table if not exists public.project_meeting_participants (
  meeting_id uuid not null references public.project_meetings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (meeting_id, user_id)
);

alter table public.project_meetings enable row level security;
alter table public.project_meeting_participants enable row level security;
revoke all on table public.project_meetings from public, anon, authenticated;
revoke all on table public.project_meeting_participants from public, anon, authenticated;
grant select on table public.project_meetings to authenticated;
grant select on table public.project_meeting_participants to authenticated;

create or replace function public.projectflow_can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select auth.uid() is not null
    and (
      public.is_super_admin()
      or
      exists (
        select 1
        from public.projects p
        where p.id = target_project_id
          and p.owner_id = auth.uid()
      )
      or exists (
        select 1
        from public.project_members pm
        where pm.project_id = target_project_id
          and pm.user_id = auth.uid()
      )
    );
$function$;

create or replace function public.projectflow_can_access_meeting(target_meeting_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select exists (
    select 1
    from public.project_meetings m
    where m.id = target_meeting_id
      and public.projectflow_can_access_project(m.project_id)
  );
$function$;

create or replace function public.projectflow_can_access_meeting_room(p_topic text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $function$
declare
  meeting_uuid uuid;
begin
  if auth.uid() is null
    or p_topic !~ '^projectflow-meeting:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  meeting_uuid := split_part(p_topic, ':', 2)::uuid;
  return exists (
    select 1
    from public.project_meetings m
    join public.project_meeting_participants participant
      on participant.meeting_id = m.id
      and participant.user_id = auth.uid()
      and participant.left_at is null
    where m.id = meeting_uuid
      and m.ended_at is null
      and public.projectflow_can_access_project(m.project_id)
  );
end;
$function$;

create or replace function public.projectflow_can_access_meeting_signal(
  p_topic text,
  p_is_sender boolean
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $function$
declare
  topic_parts text[];
  meeting_uuid uuid;
  sender_uuid uuid;
  recipient_uuid uuid;
begin
  if auth.uid() is null
    or p_topic !~ '^projectflow-meeting-signal:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  topic_parts := string_to_array(p_topic, ':');
  meeting_uuid := topic_parts[2]::uuid;
  sender_uuid := topic_parts[3]::uuid;
  recipient_uuid := topic_parts[4]::uuid;

  if sender_uuid = recipient_uuid
    or (p_is_sender and auth.uid() <> sender_uuid)
    or (not p_is_sender and auth.uid() not in (sender_uuid, recipient_uuid)) then
    return false;
  end if;

  return exists (
    select 1
    from public.project_meetings m
    join public.project_meeting_participants sender
      on sender.meeting_id = m.id
      and sender.user_id = sender_uuid
      and sender.left_at is null
    join public.project_meeting_participants recipient
      on recipient.meeting_id = m.id
      and recipient.user_id = recipient_uuid
      and recipient.left_at is null
    where m.id = meeting_uuid
      and m.ended_at is null
      and public.projectflow_can_access_project(m.project_id)
  );
end;
$function$;

drop policy if exists projectflow_meetings_project_read on public.project_meetings;
create policy projectflow_meetings_project_read
on public.project_meetings
for select to authenticated
using (public.projectflow_can_access_project(project_id));

drop policy if exists projectflow_meeting_participants_project_read on public.project_meeting_participants;
create policy projectflow_meeting_participants_project_read
on public.project_meeting_participants
for select to authenticated
using (public.projectflow_can_access_meeting(meeting_id));

create or replace function public.create_project_meeting(p_project_id uuid, p_title text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  meeting_id uuid;
  meeting_title text := btrim(coalesce(p_title, ''));
begin
  if auth.uid() is null then
    raise exception 'Sign in to create a meeting';
  end if;
  if not public.projectflow_can_access_project(p_project_id) then
    raise exception 'You do not have access to this project';
  end if;
  if char_length(meeting_title) not between 1 and 120 then
    raise exception 'Meeting titles must be between 1 and 120 characters';
  end if;

  insert into public.project_meetings(project_id, title, created_by)
  values (p_project_id, meeting_title, auth.uid())
  returning id into meeting_id;

  return meeting_id;
end;
$function$;

create or replace function public.join_project_meeting(p_meeting_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  meeting_project_id uuid;
  meeting_ended_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join a meeting';
  end if;

  select project_id, ended_at
  into meeting_project_id, meeting_ended_at
  from public.project_meetings
  where id = p_meeting_id
  for update;

  if not found or not public.projectflow_can_access_project(meeting_project_id) then
    raise exception 'Meeting not found or you do not have access';
  end if;
  if meeting_ended_at is not null then
    raise exception 'This meeting has ended';
  end if;

  insert into public.project_meeting_participants(meeting_id, user_id, joined_at, left_at)
  values (p_meeting_id, auth.uid(), now(), null)
  on conflict (meeting_id, user_id) do update
    set joined_at = excluded.joined_at,
        left_at = null;
end;
$function$;

create or replace function public.leave_project_meeting(p_meeting_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sign in to leave a meeting';
  end if;

  update public.project_meeting_participants
  set left_at = now()
  where meeting_id = p_meeting_id
    and user_id = auth.uid()
    and left_at is null;
end;
$function$;

create or replace function public.end_project_meeting(p_meeting_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sign in to end a meeting';
  end if;

  update public.project_meetings
  set ended_at = now()
  where id = p_meeting_id
    and created_by = auth.uid()
    and ended_at is null;

  if not found then
    raise exception 'Only the meeting creator can end an active meeting';
  end if;

  update public.project_meeting_participants
  set left_at = now()
  where meeting_id = p_meeting_id
    and left_at is null;
end;
$function$;

revoke all on function public.projectflow_can_access_project(uuid) from public, anon;
revoke all on function public.projectflow_can_access_meeting(uuid) from public, anon;
revoke all on function public.projectflow_can_access_meeting_room(text) from public, anon;
revoke all on function public.projectflow_can_access_meeting_signal(text, boolean) from public, anon;
revoke all on function public.create_project_meeting(uuid, text) from public, anon;
revoke all on function public.join_project_meeting(uuid) from public, anon;
revoke all on function public.leave_project_meeting(uuid) from public, anon;
revoke all on function public.end_project_meeting(uuid) from public, anon;
grant execute on function public.projectflow_can_access_project(uuid) to authenticated;
grant execute on function public.projectflow_can_access_meeting(uuid) to authenticated;
grant execute on function public.projectflow_can_access_meeting_room(text) to authenticated;
grant execute on function public.projectflow_can_access_meeting_signal(text, boolean) to authenticated;
grant execute on function public.create_project_meeting(uuid, text) to authenticated;
grant execute on function public.join_project_meeting(uuid) to authenticated;
grant execute on function public.leave_project_meeting(uuid) to authenticated;
grant execute on function public.end_project_meeting(uuid) to authenticated;

drop policy if exists projectflow_meeting_room_read on realtime.messages;
create policy projectflow_meeting_room_read
on realtime.messages
for select to authenticated
using (
  extension in ('broadcast', 'presence')
  and public.projectflow_can_access_meeting_room(realtime.topic())
);

drop policy if exists projectflow_meeting_room_send on realtime.messages;
create policy projectflow_meeting_room_send
on realtime.messages
for insert to authenticated
with check (
  extension in ('broadcast', 'presence')
  and public.projectflow_can_access_meeting_room(realtime.topic())
);

drop policy if exists projectflow_meeting_signal_read on realtime.messages;
create policy projectflow_meeting_signal_read
on realtime.messages
for select to authenticated
using (
  extension = 'broadcast'
  and public.projectflow_can_access_meeting_signal(realtime.topic(), false)
);

drop policy if exists projectflow_meeting_signal_send on realtime.messages;
create policy projectflow_meeting_signal_send
on realtime.messages
for insert to authenticated
with check (
  extension = 'broadcast'
  and public.projectflow_can_access_meeting_signal(realtime.topic(), true)
);

drop policy if exists projectflow_meeting_scope_guard on realtime.messages;
create policy projectflow_meeting_scope_guard
on realtime.messages
as restrictive
for all to authenticated
using (
  (
    realtime.topic() not like 'projectflow-meeting:%'
    and realtime.topic() not like 'projectflow-meeting-signal:%'
  )
  or (
    extension in ('broadcast', 'presence')
    and public.projectflow_can_access_meeting_room(realtime.topic())
  )
  or (
    extension = 'broadcast'
    and public.projectflow_can_access_meeting_signal(realtime.topic(), false)
  )
)
with check (
  (
    realtime.topic() not like 'projectflow-meeting:%'
    and realtime.topic() not like 'projectflow-meeting-signal:%'
  )
  or (
    extension in ('broadcast', 'presence')
    and public.projectflow_can_access_meeting_room(realtime.topic())
  )
  or (
    extension = 'broadcast'
    and public.projectflow_can_access_meeting_signal(realtime.topic(), true)
  )
);

commit;
