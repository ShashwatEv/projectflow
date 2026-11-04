create table if not exists public.workspace_channels (
  id text primary key check (id !~ '^dm_'),
  name text not null,
  description text not null default '',
  is_private boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.workspace_channels (id, name, description)
values
  ('room_1', 'general', 'Company-wide discussion and updates'),
  ('room_dev', 'development', 'Tech stack, architecture and bug tracking'),
  ('room_design', 'design', 'UI and UX specs, Figma boards and creative work'),
  ('room_random', 'random', 'Coffee chats, memes and watercooler conversations')
on conflict (id) do nothing;

create index if not exists messages_room_created_at_idx
  on public.messages (room_id, created_at desc);

create table if not exists public.workspace_channel_members (
  channel_id text not null references public.workspace_channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists public.workspace_channel_reads (
  channel_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists public.workspace_channel_preferences (
  channel_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  wallpaper text check (wallpaper in ('whatsapp', 'telegram', 'subtle-grid', 'dots', 'gradient', 'minimal', 'cyberpunk')),
  is_muted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists public.user_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  new_comments boolean not null default true,
  project_invites boolean not null default false,
  mentions boolean not null default true,
  task_reminders boolean not null default true,
  digest_frequency text not null default 'off' check (digest_frequency in ('off', 'daily', 'weekly')),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (length(trim(content)) > 0),
  mentioned_user_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_comments_task_created_idx
  on public.task_comments (task_id, created_at);

create table if not exists public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task_activity_project_created_idx
  on public.task_activity (project_id, created_at desc);

create or replace function public.record_task_comment_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  related_project_id uuid;
begin
  select project_id into related_project_id
  from public.tasks
  where id = new.task_id;

  insert into public.task_activity (task_id, project_id, user_id, action, details)
  values (
    new.task_id,
    related_project_id,
    auth.uid(),
    'commented',
    jsonb_build_object('comment_id', new.id)
  );
  return new;
end;
$$;

drop trigger if exists projectflow_task_comment_activity on public.task_comments;
create trigger projectflow_task_comment_activity
after insert on public.task_comments
for each row execute function public.record_task_comment_activity();

create or replace function public.record_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed_fields jsonb := '{}'::jsonb;
  activity_action text;
begin
  if tg_op = 'INSERT' then
    activity_action := 'created';
  else
    if old.status is distinct from new.status then
      changed_fields := changed_fields || jsonb_build_object('status', jsonb_build_object('from', old.status, 'to', new.status));
    end if;
    if old.title is distinct from new.title then
      changed_fields := changed_fields || jsonb_build_object('title', jsonb_build_object('from', old.title, 'to', new.title));
    end if;
    if old.priority is distinct from new.priority then
      changed_fields := changed_fields || jsonb_build_object('priority', jsonb_build_object('from', old.priority, 'to', new.priority));
    end if;
    if old.due_date is distinct from new.due_date then
      changed_fields := changed_fields || jsonb_build_object('due_date', jsonb_build_object('from', old.due_date, 'to', new.due_date));
    end if;
    if old.project_id is distinct from new.project_id then
      changed_fields := changed_fields || jsonb_build_object('project_id', jsonb_build_object('from', old.project_id, 'to', new.project_id));
    end if;
    if changed_fields = '{}'::jsonb then
      return new;
    end if;
    activity_action := 'updated';
  end if;

  insert into public.task_activity (task_id, project_id, user_id, action, details)
  values (new.id, new.project_id, auth.uid(), activity_action, changed_fields);
  return new;
end;
$$;

drop trigger if exists projectflow_task_activity on public.tasks;
create trigger projectflow_task_activity
after insert or update on public.tasks
for each row execute function public.record_task_activity();

create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  due_date date,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'complete')),
  owner_id uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_milestones_project_due_idx
  on public.project_milestones (project_id, due_date);

create table if not exists public.project_activity (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists project_activity_project_created_idx
  on public.project_activity (project_id, created_at desc);

create or replace function public.record_project_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed_fields jsonb := '{}'::jsonb;
  activity_action text;
begin
  if tg_op = 'INSERT' then
    activity_action := 'project_created';
  else
    if old.name is distinct from new.name then
      changed_fields := changed_fields || jsonb_build_object('name', jsonb_build_object('from', old.name, 'to', new.name));
    end if;
    if old.status is distinct from new.status then
      changed_fields := changed_fields || jsonb_build_object('status', jsonb_build_object('from', old.status, 'to', new.status));
    end if;
    if changed_fields = '{}'::jsonb then
      return new;
    end if;
    activity_action := 'project_updated';
  end if;

  insert into public.project_activity (project_id, user_id, action, details)
  values (new.id, auth.uid(), activity_action, changed_fields);
  return new;
end;
$$;

create or replace function public.record_milestone_activity()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  milestone_project_id uuid;
  milestone_title text;
  activity_action text;
  activity_details jsonb;
begin
  if tg_op = 'DELETE' then
    milestone_project_id := old.project_id;
    milestone_title := old.title;
    activity_action := 'milestone_deleted';
    activity_details := jsonb_build_object('title', old.title);
    insert into public.project_activity (project_id, user_id, action, details)
    values (milestone_project_id, auth.uid(), activity_action, activity_details);
    return old;
  end if;

  if tg_op = 'INSERT' then
    activity_action := 'milestone_created';
    activity_details := jsonb_build_object('title', new.title);
  else
    if old.title is not distinct from new.title and old.status is not distinct from new.status
      and old.due_date is not distinct from new.due_date then
      return new;
    end if;
    activity_action := 'milestone_updated';
    activity_details := jsonb_build_object('title', new.title, 'status', new.status, 'due_date', new.due_date);
  end if;

  insert into public.project_activity (project_id, user_id, action, details)
  values (new.project_id, auth.uid(), activity_action, activity_details);
  return new;
end;
$$;

drop trigger if exists projectflow_project_activity on public.projects;
create trigger projectflow_project_activity
after insert or update on public.projects
for each row execute function public.record_project_activity();

drop trigger if exists projectflow_milestone_activity on public.project_milestones;
create trigger projectflow_milestone_activity
after insert or update or delete on public.project_milestones
for each row execute function public.record_milestone_activity();

create table if not exists public.user_setup_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_steps text[] not null default '{}',
  dismissed_at timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.can_access_workspace_channel(channel_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.workspace_channels c
    where c.id = channel_id
      and (
        not c.is_private
        or c.created_by = auth.uid()
        or exists (
          select 1 from public.workspace_channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        )
      )
  )
  or (
    channel_id like 'dm_%'
    and (
      split_part(channel_id, '_', 2) = auth.uid()::text
      or split_part(channel_id, '_', 3) = auth.uid()::text
    )
  );
$$;

create or replace function public.is_workspace_channel_owner(channel_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.workspace_channels c
    where c.id = channel_id and c.created_by = auth.uid()
  );
$$;

create or replace function public.workspace_unread_counts()
returns table (room_id text, unread_count bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.room_id, count(*)::bigint
  from public.messages m
  left join public.workspace_channel_reads r
    on r.channel_id = m.room_id and r.user_id = auth.uid()
  where m.user_id <> auth.uid()
    and m.created_at > coalesce(r.last_read_at, 'epoch'::timestamptz)
    and public.can_access_workspace_channel(m.room_id)
  group by m.room_id;
$$;

create or replace function public.workspace_channel_previews()
returns table (room_id text, last_message text, last_message_at timestamptz)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select distinct on (m.room_id) m.room_id, m.content, m.created_at
  from public.messages m
  where public.can_access_workspace_channel(m.room_id)
  order by m.room_id, m.created_at desc;
$$;

alter table public.workspace_channels enable row level security;
alter table public.workspace_channel_members enable row level security;
alter table public.workspace_channel_reads enable row level security;
alter table public.workspace_channel_preferences enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_activity enable row level security;
alter table public.project_milestones enable row level security;
alter table public.project_activity enable row level security;
alter table public.user_setup_progress enable row level security;

drop policy if exists workspace_channels_read_access on public.workspace_channels;
create policy workspace_channels_read_access on public.workspace_channels
for select to authenticated using (public.can_access_workspace_channel(id));
drop policy if exists workspace_channels_insert_owner on public.workspace_channels;
create policy workspace_channels_insert_owner on public.workspace_channels
for insert to authenticated with check (created_by = auth.uid());
drop policy if exists workspace_channels_update_owner on public.workspace_channels;
create policy workspace_channels_update_owner on public.workspace_channels
for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists workspace_channels_delete_owner on public.workspace_channels;
create policy workspace_channels_delete_owner on public.workspace_channels
for delete to authenticated using (created_by = auth.uid());

drop policy if exists workspace_channel_members_read_access on public.workspace_channel_members;
create policy workspace_channel_members_read_access on public.workspace_channel_members
for select to authenticated
using (user_id = auth.uid() or public.is_workspace_channel_owner(channel_id));
drop policy if exists workspace_channel_members_insert_access on public.workspace_channel_members;
create policy workspace_channel_members_insert_access on public.workspace_channel_members
for insert to authenticated
with check (
  public.is_workspace_channel_owner(channel_id)
  or (user_id = auth.uid() and public.can_access_workspace_channel(channel_id))
);
drop policy if exists workspace_channel_members_delete_access on public.workspace_channel_members;
create policy workspace_channel_members_delete_access on public.workspace_channel_members
for delete to authenticated
using (user_id = auth.uid() or public.is_workspace_channel_owner(channel_id));

drop policy if exists workspace_channel_reads_own on public.workspace_channel_reads;
create policy workspace_channel_reads_own on public.workspace_channel_reads
for all to authenticated
using (user_id = auth.uid() and public.can_access_workspace_channel(channel_id))
with check (user_id = auth.uid() and public.can_access_workspace_channel(channel_id));

drop policy if exists workspace_channel_preferences_own on public.workspace_channel_preferences;
create policy workspace_channel_preferences_own on public.workspace_channel_preferences
for all to authenticated
using (user_id = auth.uid() and public.can_access_workspace_channel(channel_id))
with check (user_id = auth.uid() and public.can_access_workspace_channel(channel_id));

drop policy if exists user_notification_preferences_own on public.user_notification_preferences;
create policy user_notification_preferences_own on public.user_notification_preferences
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists task_comments_read_authenticated on public.task_comments;
create policy task_comments_read_authenticated on public.task_comments
for select to authenticated using (exists (select 1 from public.tasks t where t.id = task_id));
drop policy if exists task_comments_insert_authenticated on public.task_comments;
create policy task_comments_insert_authenticated on public.task_comments
for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id));
drop policy if exists task_comments_update_own on public.task_comments;
create policy task_comments_update_own on public.task_comments
for update to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (select 1 from public.tasks t where t.id = task_id)
);
drop policy if exists task_comments_delete_own on public.task_comments;
create policy task_comments_delete_own on public.task_comments
for delete to authenticated using (user_id = auth.uid());

drop policy if exists task_activity_read_authenticated on public.task_activity;
create policy task_activity_read_authenticated on public.task_activity
for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id));

drop policy if exists project_milestones_read_authenticated on public.project_milestones;
create policy project_milestones_read_authenticated on public.project_milestones
for select to authenticated
using (exists (select 1 from public.projects p where p.id = project_id));
drop policy if exists project_milestones_insert_authenticated on public.project_milestones;
create policy project_milestones_insert_authenticated on public.project_milestones
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (select 1 from public.projects p where p.id = project_id)
);
drop policy if exists project_milestones_update_authenticated on public.project_milestones;
create policy project_milestones_update_authenticated on public.project_milestones
for update to authenticated
using (
  created_by = auth.uid()
  or owner_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
)
with check (
  created_by = auth.uid()
  or owner_id = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);
drop policy if exists project_milestones_delete_authenticated on public.project_milestones;
create policy project_milestones_delete_authenticated on public.project_milestones
for delete to authenticated
using (
  created_by = auth.uid()
  or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid())
);

drop policy if exists project_activity_read_authenticated on public.project_activity;
create policy project_activity_read_authenticated on public.project_activity
for select to authenticated
using (exists (select 1 from public.projects p where p.id = project_id));

drop policy if exists user_setup_progress_own on public.user_setup_progress;
create policy user_setup_progress_own on public.user_setup_progress
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A restrictive policy makes private-channel access hold even if an older
-- permissive messages policy exists in the project database.
alter table public.messages enable row level security;
drop policy if exists projectflow_messages_channel_access on public.messages;
create policy projectflow_messages_channel_access on public.messages
as restrictive for all to authenticated
using (public.can_access_workspace_channel(room_id))
with check (public.can_access_workspace_channel(room_id));
drop policy if exists projectflow_messages_insert_own on public.messages;
create policy projectflow_messages_insert_own on public.messages
as restrictive for insert to authenticated
with check (user_id = auth.uid());
drop policy if exists projectflow_messages_update_own on public.messages;
create policy projectflow_messages_update_own on public.messages
as restrictive for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
drop policy if exists projectflow_messages_delete_own on public.messages;
create policy projectflow_messages_delete_own on public.messages
as restrictive for delete to authenticated
using (user_id = auth.uid());
drop policy if exists projectflow_messages_authenticated_access on public.messages;
create policy projectflow_messages_authenticated_access on public.messages
for all to authenticated
using (public.can_access_workspace_channel(room_id))
with check (public.can_access_workspace_channel(room_id));

alter table public.message_reactions enable row level security;
drop policy if exists projectflow_reactions_channel_access on public.message_reactions;
create policy projectflow_reactions_channel_access on public.message_reactions
as restrictive for all to authenticated
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.can_access_workspace_channel(m.room_id)
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.messages m
    where m.id = message_id and public.can_access_workspace_channel(m.room_id)
  )
);
drop policy if exists projectflow_reactions_own_delete on public.message_reactions;
create policy projectflow_reactions_own_delete on public.message_reactions
as restrictive for delete to authenticated
using (user_id = auth.uid());
drop policy if exists projectflow_reactions_authenticated_access on public.message_reactions;
create policy projectflow_reactions_authenticated_access on public.message_reactions
for all to authenticated
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id and public.can_access_workspace_channel(m.room_id)
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.messages m
    where m.id = message_id and public.can_access_workspace_channel(m.room_id)
  )
);

grant select, insert, update, delete on public.workspace_channels to authenticated;
grant select, insert, delete on public.workspace_channel_members to authenticated;
grant select, insert, update on public.workspace_channel_reads to authenticated;
grant select, insert, update on public.workspace_channel_preferences to authenticated;
grant select, insert, update on public.user_notification_preferences to authenticated;
grant select, insert, update, delete on public.task_comments to authenticated;
grant select on public.task_activity to authenticated;
grant select, insert, update, delete on public.project_milestones to authenticated;
grant select on public.project_activity to authenticated;
grant select, insert, update on public.user_setup_progress to authenticated;
revoke all on function public.can_access_workspace_channel(text) from public;
revoke all on function public.is_workspace_channel_owner(text) from public;
revoke all on function public.workspace_unread_counts() from public;
revoke all on function public.workspace_channel_previews() from public;
revoke all on function public.record_task_activity() from public;
revoke all on function public.record_task_comment_activity() from public;
revoke all on function public.record_project_activity() from public;
revoke all on function public.record_milestone_activity() from public;
grant execute on function public.can_access_workspace_channel(text) to authenticated;
grant execute on function public.is_workspace_channel_owner(text) to authenticated;
grant execute on function public.workspace_unread_counts() to authenticated;
grant execute on function public.workspace_channel_previews() to authenticated;
