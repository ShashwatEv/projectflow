import { describe, expect, it } from 'vitest';
import { isRecordInTeamScope } from '../teamScope';
import { ALL_TEAMS_SCOPE } from '../../context/WorkspaceContext';

describe('isRecordInTeamScope', () => {
  it('allows all records when an org admin views all teams scope', () => {
    expect(
      isRecordInTeamScope(
        { team_id: 'team-b', organization_id: 'org-1' },
        { selectedTeamId: ALL_TEAMS_SCOPE, canViewAllTeams: true }
      )
    ).toBe(true);
  });

  it('matches only the selected team when a specific team is active', () => {
    expect(
      isRecordInTeamScope(
        { team_id: 'team-a', organization_id: 'org-1' },
        { selectedTeamId: 'team-a', canViewAllTeams: false }
      )
    ).toBe(true);

    expect(
      isRecordInTeamScope(
        { team_id: 'team-b', organization_id: 'org-1' },
        { selectedTeamId: 'team-a', canViewAllTeams: false }
      )
    ).toBe(false);
  });

  it('respects includeUnassigned for owned records without a team_id', () => {
    expect(
      isRecordInTeamScope(
        { team_id: null, organization_id: 'org-1' },
        { selectedTeamId: 'team-a', canViewAllTeams: false, includeUnassigned: true }
      )
    ).toBe(true);

    expect(
      isRecordInTeamScope(
        { team_id: null, organization_id: 'org-1' },
        { selectedTeamId: 'team-a', canViewAllTeams: false, includeUnassigned: false }
      )
    ).toBe(false);
  });
});