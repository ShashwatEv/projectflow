begin;

alter table public.project_members enable row level security;
revoke all on table public.project_members from public, anon, authenticated;
grant select on table public.project_members to authenticated;

create or replace function public.can_view_project_members(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $function$
  select auth.uid() is not null
    and (
      public.is_super_admin()
      or exists (
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

revoke all on function public.can_view_project_members(uuid) from public, anon;
grant execute on function public.can_view_project_members(uuid) to authenticated;

drop policy if exists project_members_invite_access_read on public.project_members;
create policy project_members_invite_access_read
on public.project_members
for select to authenticated
using (
  user_id = auth.uid()
  or public.can_view_project_members(project_id)
);

create table if not exists public.project_invite_codes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code_hash text not null unique check (code_hash ~ '^[0-9a-f]{64}$'),
  role text not null default 'viewer' check (role = 'viewer'),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  constraint project_invite_redemption_pair_check check (
    (redeemed_by is null and redeemed_at is null)
    or (redeemed_by is not null and redeemed_at is not null)
  )
);

create index if not exists project_invite_codes_project_created_idx
  on public.project_invite_codes(project_id, created_at desc);

alter table public.project_invite_codes enable row level security;
alter table public.project_invite_codes force row level security;
revoke all on table public.project_invite_codes from public, anon, authenticated;

create or replace function public.create_project_invite_code(
  p_project_id uuid,
  p_code_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  invite_project_name text;
  invite_expires_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Sign in to create an invite code';
  end if;

  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid invite code hash';
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
        and lower(pm.role) in ('owner', 'editor')
    )
  ) then
    raise exception 'You do not have permission to invite members to this project';
  end if;

  select p.name
  into invite_project_name
  from public.projects p
  where p.id = p_project_id;

  if invite_project_name is null then
    raise exception 'Project not found';
  end if;

  invite_expires_at := now() + interval '7 days';
  insert into public.project_invite_codes (
    project_id, code_hash, role, created_by, expires_at
  )
  values (
    p_project_id, p_code_hash, 'viewer', auth.uid(), invite_expires_at
  );

  return jsonb_build_object(
    'project_name', invite_project_name,
    'role', 'viewer',
    'expires_at', invite_expires_at
  );
end;
$function$;

create or replace function public.redeem_project_invite_code(p_code_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  invite public.project_invite_codes%rowtype;
  invite_project_name text;
begin
  if auth.uid() is null then
    raise exception 'Sign in to redeem a project invite';
  end if;

  if p_code_hash is null or p_code_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid or expired invite code';
  end if;

  select *
  into invite
  from public.project_invite_codes i
  where i.code_hash = p_code_hash
    and i.redeemed_at is null
    and i.expires_at > now()
  for update;

  if not found then
    raise exception 'Invalid, expired, or already used invite code';
  end if;

  if exists (
    select 1
    from public.project_members pm
    where pm.project_id = invite.project_id
      and pm.user_id = auth.uid()
  ) then
    raise exception 'You already have access to this project';
  end if;

  insert into public.project_members(project_id, user_id, role)
  values (invite.project_id, auth.uid(), invite.role);

  update public.project_invite_codes
  set redeemed_by = auth.uid(),
      redeemed_at = now()
  where id = invite.id;

  select p.name
  into invite_project_name
  from public.projects p
  where p.id = invite.project_id;

  return jsonb_build_object(
    'project_id', invite.project_id,
    'project_name', invite_project_name,
    'role', invite.role
  );
end;
$function$;

revoke all on function public.create_project_invite_code(uuid, text) from public, anon;
revoke all on function public.redeem_project_invite_code(text) from public, anon;
grant execute on function public.create_project_invite_code(uuid, text) to authenticated;
grant execute on function public.redeem_project_invite_code(text) to authenticated;

commit;
