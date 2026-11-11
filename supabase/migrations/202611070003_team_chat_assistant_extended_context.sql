begin;

create or replace function public.team_chat_assistant_extended_context()
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
      select p.id, p.name
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
    accessible_tasks as (
      select t.id, t.project_id, t.title
      from public.tasks t
      join accessible_projects p on p.id = t.project_id
      order by t.created_at desc
      limit 100
    ),
    recent_comments as (
      select
        t.title as task_title,
        left(tc.content, 700) as content,
        tc.created_at
      from public.task_comments tc
      join accessible_tasks t on t.id = tc.task_id
      order by tc.created_at desc
      limit 30
    ),
    recent_milestones as (
      select
        p.name as project_name,
        m.title,
        left(m.description, 500) as description,
        m.due_date,
        m.status
      from public.project_milestones m
      join accessible_projects p on p.id = m.project_id
      order by m.due_date asc nulls last, m.created_at desc
      limit 30
    )
    select jsonb_build_object(
      'task_comments',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'task_title', c.task_title,
              'content', c.content,
              'created_at', c.created_at
            ) order by c.created_at desc
          )
          from recent_comments c
        ),
        '[]'::jsonb
      ),
      'milestones',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'project_name', m.project_name,
              'title', m.title,
              'description', m.description,
              'due_date', m.due_date,
              'status', m.status
            ) order by m.due_date asc nulls last
          )
          from recent_milestones m
        ),
        '[]'::jsonb
      )
    )
  );
end;
$function$;

revoke all on function public.team_chat_assistant_extended_context() from public, anon;
grant execute on function public.team_chat_assistant_extended_context() to authenticated;

commit;
