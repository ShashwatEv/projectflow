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

commit;
