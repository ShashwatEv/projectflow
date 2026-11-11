import { describe, expect, it } from 'vitest';
import { buildBurndownData } from '../analyticsUtils';

describe('buildBurndownData', () => {
  const now = new Date(2026, 10, 11, 12);

  it('uses the selected range for daily labels and tracks dated scope and work', () => {
    const points = buildBurndownData(
      [
        { created_at: '2026-11-05T10:00:00', estimate_hours: 10 },
        { created_at: '2026-11-07T10:00:00', estimate_hours: 5 },
      ],
      [
        { date: '2026-11-06', hours: 2 },
        { date: '2026-11-11', hours: 3 },
      ],
      '7',
      now
    );

    expect(points).toHaveLength(7);
    expect(points[0]).toMatchObject({ date: '2026-11-05', ideal: 15, actual: 10 });
    expect(points[1]).toMatchObject({ date: '2026-11-06', actual: 8 });
    expect(points[2]).toMatchObject({ date: '2026-11-07', actual: 13 });
    expect(points[points.length - 1]).toMatchObject({ date: '2026-11-11', ideal: 0, actual: 10 });
  });

  it('changes the timeline length for 30- and 90-day selections', () => {
    expect(buildBurndownData([], [], '30', now)).toHaveLength(30);
    expect(buildBurndownData([], [], '90', now)).toHaveLength(90);
  });

  it('uses available historical data for all time and caps chart resolution', () => {
    const points = buildBurndownData(
      [{ created_at: '2026-01-01T10:00:00', estimate_hours: 12 }],
      [{ date: '2026-01-08', hours: 4 }],
      'all',
      now
    );

    expect(points.length).toBeLessThanOrEqual(91);
    expect(points[0]?.date).toBe('2026-01-01');
    expect(points[points.length - 1]).toMatchObject({ date: '2026-11-11', ideal: 0, actual: 8 });
    expect(points[0]?.day).not.toBe('Day 1');
  });
});
