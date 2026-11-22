import { ALL_TEAMS_SCOPE, type TeamScopeId } from '../context/WorkspaceContext';

export interface TeamScopedRecord {
  team_id?: string | null;
  organization_id?: string | null;
}

export interface ScopeFilterOptions {
  selectedTeamId: TeamScopeId;
  canViewAllTeams: boolean;
  includeUnassigned?: boolean;
}

export function isRecordInTeamScope(
  record: TeamScopedRecord,
  { selectedTeamId, canViewAllTeams, includeUnassigned = false }: ScopeFilterOptions
): boolean {
  if (selectedTeamId === ALL_TEAMS_SCOPE) {
    if (canViewAllTeams) return true;
    return includeUnassigned ? !record.team_id : Boolean(record.team_id);
  }

  if (record.team_id === selectedTeamId) {
    return true;
  }

  return includeUnassigned && !record.team_id;
}

export function filterRecordsByTeamScope<T extends TeamScopedRecord>(
  records: readonly T[],
  options: ScopeFilterOptions
): T[] {
  return records.filter((record) => isRecordInTeamScope(record, options));
}

export function resolveDefaultTeamIdForCreation(
  selectedTeamId: TeamScopeId,
  fallbackTeamId?: string | null
): string | null {
  if (selectedTeamId !== ALL_TEAMS_SCOPE) {
    return selectedTeamId;
  }
  return fallbackTeamId || null;
}