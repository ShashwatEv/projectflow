import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

export type OrgRole = 'org_admin' | 'member';
export type TeamRole = 'team_manager' | 'member';

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  role: OrgRole;
}

export interface TeamItem {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  role: TeamRole;
}

export const ALL_TEAMS_SCOPE = 'all' as const;
export type TeamScopeId = typeof ALL_TEAMS_SCOPE | string;

interface WorkspaceContextValue {
  loading: boolean;
  error: string | null;
  organizations: OrganizationItem[];
  activeOrganization: OrganizationItem | null;
  setActiveOrganizationId: (orgId: string) => void;
  teams: TeamItem[];
  selectedTeamId: TeamScopeId;
  setSelectedTeamId: (teamId: TeamScopeId) => void;
  activeTeam: TeamItem | null;
  isOrgAdmin: boolean;
  canViewAllTeams: boolean;
  canManageTeam: (teamId: string | null | undefined) => boolean;
  refreshWorkspace: () => Promise<void>;
}

interface OrgMembershipRow {
  role?: string | null;
  organizations?:
    | { id?: string | null; name?: string | null; slug?: string | null }
    | Array<{ id?: string | null; name?: string | null; slug?: string | null }>
    | null;
}

interface TeamRow {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string | null;
}

interface TeamMembershipRow {
  team_id: string;
  role?: string | null;
}

interface PostgrestErrorLike {
  message?: string;
}

interface QueryResultLike<T> {
  data: T[] | null;
  error: PostgrestErrorLike | null;
}

interface FilterBuilderLike<T> extends PromiseLike<QueryResultLike<T>> {
  order: (column: string, options?: { ascending?: boolean }) => PromiseLike<QueryResultLike<T>>;
}

interface SelectBuilderLike<T> {
  eq: (column: string, value: string) => FilterBuilderLike<T>;
}

interface UntypedSupabaseClient {
  from: <T>(relation: string) => {
    select: (columns: string) => SelectBuilderLike<T>;
  };
}

const ORG_STORAGE_KEY = 'pf_active_org_id_v1';
const TEAM_STORAGE_KEY = 'pf_active_team_scope_v1';

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredValue(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStoredValue(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
}

async function selectEqRows<T>(
  relation: string,
  columns: string,
  eqColumn: string,
  eqValue: string,
  orderBy?: { column: string; ascending: boolean }
): Promise<T[]> {
  const client = supabase as unknown as UntypedSupabaseClient;
  const builder = client.from<T>(relation).select(columns).eq(eqColumn, eqValue);
  const response = orderBy
    ? await builder.order(orderBy.column, { ascending: orderBy.ascending })
    : await builder;

  if (response.error) {
    throw new Error(response.error.message || `Failed to query ${relation}`);
  }
  return response.data ?? [];
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<string | null>(() =>
    readStoredValue(ORG_STORAGE_KEY)
  );
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeamId, setSelectedTeamIdState] = useState<TeamScopeId>(
    () => readStoredValue(TEAM_STORAGE_KEY) || ALL_TEAMS_SCOPE
  );

  const setActiveOrganizationId = useCallback((orgId: string) => {
    setActiveOrganizationIdState(orgId);
    writeStoredValue(ORG_STORAGE_KEY, orgId);
  }, []);

  const setSelectedTeamId = useCallback((teamId: TeamScopeId) => {
    setSelectedTeamIdState(teamId);
    writeStoredValue(TEAM_STORAGE_KEY, teamId);
  }, []);

  const refreshWorkspace = useCallback(async () => {
    if (!user?.id) {
      setOrganizations([]);
      setTeams([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orgMemberships = await selectEqRows<OrgMembershipRow>(
        'organization_members',
        'role, organizations ( id, name, slug )',
        'user_id',
        user.id
      );

      const parsedOrgs: OrganizationItem[] = [];
      for (const row of orgMemberships) {
        const rawOrg = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
        if (rawOrg && typeof rawOrg.id === 'string') {
          parsedOrgs.push({
            id: rawOrg.id,
            name: String(rawOrg.name || 'Workspace'),
            slug: String(rawOrg.slug || ''),
            role: row.role === 'org_admin' ? 'org_admin' : 'member',
          });
        }
      }

      setOrganizations(parsedOrgs);

      const resolvedOrgId =
        parsedOrgs.find((o) => o.id === activeOrganizationId)?.id || parsedOrgs[0]?.id || null;

      if (resolvedOrgId !== activeOrganizationId) {
        setActiveOrganizationIdState(resolvedOrgId);
        writeStoredValue(ORG_STORAGE_KEY, resolvedOrgId);
      }

      if (!resolvedOrgId) {
        setTeams([]);
        setLoading(false);
        return;
      }

      const currentOrg = parsedOrgs.find((o) => o.id === resolvedOrgId);
      const userIsOrgAdmin = currentOrg?.role === 'org_admin';

      const [orgTeams, teamMemberships] = await Promise.all([
        selectEqRows<TeamRow>(
          'teams',
          'id, organization_id, name, slug, description',
          'organization_id',
          resolvedOrgId,
          { column: 'name', ascending: true }
        ),
        selectEqRows<TeamMembershipRow>('team_members', 'team_id, role', 'user_id', user.id),
      ]);

      const roleByTeamId = new Map<string, TeamRole>();
      for (const tm of teamMemberships) {
        if (typeof tm.team_id === 'string') {
          roleByTeamId.set(tm.team_id, tm.role === 'team_manager' ? 'team_manager' : 'member');
        }
      }

      const accessibleTeams: TeamItem[] = orgTeams
        .filter((t) => userIsOrgAdmin || roleByTeamId.has(t.id))
        .map((t) => ({
          id: t.id,
          organization_id: t.organization_id,
          name: t.name,
          slug: t.slug,
          description: t.description ?? null,
          role: roleByTeamId.get(t.id) || 'member',
        }));

      setTeams(accessibleTeams);

      const nextScope: TeamScopeId =
        selectedTeamId === ALL_TEAMS_SCOPE && userIsOrgAdmin
          ? ALL_TEAMS_SCOPE
          : accessibleTeams.some((t) => t.id === selectedTeamId)
          ? selectedTeamId
          : userIsOrgAdmin
          ? ALL_TEAMS_SCOPE
          : accessibleTeams[0]?.id || ALL_TEAMS_SCOPE;

      if (nextScope !== selectedTeamId) {
        setSelectedTeamIdState(nextScope);
        writeStoredValue(TEAM_STORAGE_KEY, nextScope);
      }
    } catch (err) {
      console.error('Could not load workspace teams:', err);
      setError(err instanceof Error ? err.message : 'Could not load workspace teams.');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [activeOrganizationId, selectedTeamId, user?.id]);

  useEffect(() => {
    void refreshWorkspace();
  }, [refreshWorkspace]);

  const activeOrganization = useMemo(
    () => organizations.find((o) => o.id === activeOrganizationId) || organizations[0] || null,
    [activeOrganizationId, organizations]
  );

  const isOrgAdmin = activeOrganization?.role === 'org_admin';
  const canViewAllTeams = Boolean(isOrgAdmin);

  const activeTeam = useMemo(
    () =>
      selectedTeamId === ALL_TEAMS_SCOPE
        ? null
        : teams.find((t) => t.id === selectedTeamId) || null,
    [selectedTeamId, teams]
  );

  const canManageTeam = useCallback(
    (teamId: string | null | undefined) => {
      if (isOrgAdmin) return true;
      if (!teamId) return false;
      return teams.some((t) => t.id === teamId && t.role === 'team_manager');
    },
    [isOrgAdmin, teams]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        loading,
        error,
        organizations,
        activeOrganization,
        setActiveOrganizationId,
        teams,
        selectedTeamId,
        setSelectedTeamId,
        activeTeam,
        isOrgAdmin,
        canViewAllTeams,
        canManageTeam,
        refreshWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}