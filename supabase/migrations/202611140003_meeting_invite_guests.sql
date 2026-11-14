begin;

alter table public.project_meeting_participants
  add column if not exists is_invited_guest boolean not null default false;

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
      and (
        participant.is_invited_guest
        or public.projectflow_can_access_project(m.project_id)
      )
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
      and (
        (sender.user_id = auth.uid() and (
          sender.is_invited_guest
          or public.projectflow_can_access_project(m.project_id)
        ))
        or
        (recipient.user_id = auth.uid() and (
          recipient.is_invited_guest
          or public.projectflow_can_access_project(m.project_id)
        ))
      )
  );
end;
$function$;

drop function if exists public.find_project_meeting_by_code(text);
create function public.find_project_meeting_by_code(p_code text)
returns table (
  id uuid,
  title text,
  created_at timestamptz,
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
  select m.id, m.title, m.created_at, m.ended_at
  from public.project_meetings m
  where m.invite_code = normalized_code
    and m.ended_at is null;
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

  insert into public.project_meeting_participants(
    meeting_id, user_id, joined_at, left_at, is_invited_guest
  )
  values (p_meeting_id, auth.uid(), now(), null, false)
  on conflict (meeting_id, user_id) do update
    set joined_at = excluded.joined_at,
        left_at = null,
        is_invited_guest = false;
end;
$function$;

create or replace function public.join_project_meeting_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  normalized_code text := regexp_replace(upper(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g');
  meeting_id uuid;
  meeting_project_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join a meeting';
  end if;
  if char_length(normalized_code) <> 16 then
    raise exception 'Enter a valid meeting code';
  end if;

  select m.id, m.project_id
  into meeting_id, meeting_project_id
  from public.project_meetings m
  where m.invite_code = normalized_code
    and m.ended_at is null
  for update;

  if not found then
    raise exception 'Meeting not found or this invite has ended';
  end if;

  insert into public.project_meeting_participants(
    meeting_id, user_id, joined_at, left_at, is_invited_guest
  )
  values (
    meeting_id,
    auth.uid(),
    now(),
    null,
    not public.projectflow_can_access_project(meeting_project_id)
  )
  on conflict (meeting_id, user_id) do update
    set joined_at = excluded.joined_at,
        left_at = null,
        is_invited_guest = excluded.is_invited_guest;

  return meeting_id;
end;
$function$;

drop policy if exists projectflow_meeting_messages_active_participant_read
  on public.project_meeting_messages;
create policy projectflow_meeting_messages_active_participant_read
on public.project_meeting_messages
for select to authenticated
using (
  public.projectflow_can_access_meeting_room(
    'projectflow-meeting:' || project_meeting_messages.meeting_id::text
  )
);

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

  if not found then
    raise exception 'Meeting not found or you do not have access';
  end if;
  if not public.projectflow_can_access_project(meeting_project_id)
    and not exists (
      select 1
      from public.project_meeting_participants participant
      where participant.meeting_id = p_meeting_id
        and participant.user_id = auth.uid()
        and participant.left_at is null
        and participant.is_invited_guest
    ) then
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
revoke all on function public.join_project_meeting_by_code(text) from public, anon;
grant execute on function public.find_project_meeting_by_code(text) to authenticated;
grant execute on function public.join_project_meeting_by_code(text) to authenticated;

commit;
