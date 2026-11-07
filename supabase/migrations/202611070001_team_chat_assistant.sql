begin;

create or replace function public.team_chat_assistant_context()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $function$
begin
  if auth.uid() is null then
    raise exception 'Sign in to load team-chat assistant context';
  end if;

  return (
    with accessible_projects as (
      select
        p.id,
        p.name,
        p.owner_id,
        (
          public.is_super_admin()
          or p.owner_id = auth.uid()
          or exists (
            select 1
            from public.project_members pm
            where pm.project_id = p.id
              and pm.user_id = auth.uid()
              and lower(coalesce(pm.role, '')) in ('owner', 'editor', 'admin')
          )
        ) as can_create_task
      from public.projects p
      where public.is_super_admin()
        or p.owner_id = auth.uid()
        or exists (
          select 1
          from public.project_members pm
          where pm.project_id = p.id
            and pm.user_id = auth.uid()
        )
    ),
    recent_tasks as (
      select
        t.id,
        t.project_id,
        t.title,
        t.status,
        t.priority,
        t.due_date,
        t.created_at
      from public.tasks t
      join accessible_projects p on p.id = t.project_id
      order by t.created_at desc
      limit 100
    )
    select jsonb_build_object(
      'projects',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', p.id,
              'name', p.name,
              'key', null,
              'status', null,
              'can_create_task', p.can_create_task
            ) order by p.name
          )
          from accessible_projects p
        ),
        '[]'::jsonb
      ),
      'tasks',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'project_id', t.project_id,
              'title', t.title,
              'status', t.status,
              'priority', t.priority,
              'due_date', t.due_date
            ) order by t.created_at desc
          )
          from recent_tasks t
        ),
        '[]'::jsonb
      )
    )
  );
end;
$function$;

revoke all on function public.team_chat_assistant_context() from public, anon;
grant execute on function public.team_chat_assistant_context() to authenticated;

create or replace function public.create_chat_task(
  p_project_id uuid,
  p_title text,
  p_description text default null,
  p_priority text default 'medium'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  created_task_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in to create a task';
  end if;

  if p_title is null or length(trim(p_title)) = 0 or length(trim(p_title)) > 180 then
    raise exception 'Task title must be between 1 and 180 characters';
  end if;

  if p_description is not null and length(trim(p_description)) > 2000 then
    raise exception 'Task description must not exceed 2000 characters';
  end if;

  if p_priority is null or p_priority not in ('low', 'medium', 'high') then
    raise exception 'Invalid task priority';
  end if;

  if not (
    public.is_super_admin()
    or exists (
      select 1
      from public.projects p
      where p.id = p_project_id
        and p.owner_id = auth.uid()
    )
    or exists (
      select 1
      from public.project_members pm
      where pm.project_id = p_project_id
        and pm.user_id = auth.uid()
        and lower(pm.role) in ('owner', 'editor', 'admin')
    )
  ) then
    raise exception 'You do not have permission to create tasks in this project';
  end if;

  insert into public.tasks (
    project_id,
    title,
    description,
    status,
    priority,
    assigned_to
  )
  values (
    p_project_id,
    trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''),
    'todo',
    p_priority,
    auth.uid()
  )
  returning id into created_task_id;

  return created_task_id;
end;
$function$;

revoke all on function public.create_chat_task(uuid, text, text, text) from public, anon;
grant execute on function public.create_chat_task(uuid, text, text, text) to authenticated;

commit;
