export type AnalyticsRange = '7' | '30' | '90' | 'all';

export interface BurndownTask {
  created_at?: string | null;
  estimate_hours?: number | null;
}

export interface BurndownTimesheet {
  date?: string | null;
  created_at?: string | null;
  hours: number;
}

export interface BurndownPoint {
  date: string;
  day: string;
  ideal: number;
  actual: number;
}

function toLocalDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const parsed = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function roundHours(hours: number) {
  return Math.round(hours * 10) / 10;
}

export function getAnalyticsRangeStart(
  range: AnalyticsRange,
  dates: Array<string | null | undefined>,
  now = new Date()
) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range !== 'all') {
    const start = new Date(today);
    start.setDate(start.getDate() - Number(range) + 1);
    return start;
  }

  const earliestDate = dates
    .map(toLocalDate)
    .filter((date): date is Date => date !== null && date <= today)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  return earliestDate || today;
}

export function buildBurndownData(
  tasks: BurndownTask[],
  timesheets: BurndownTimesheet[],
  range: AnalyticsRange,
  now = new Date()
): BurndownPoint[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDates = tasks.map((task) => task.created_at);
  const timesheetDates = timesheets.map((entry) => entry.date || entry.created_at);
  const start = getAnalyticsRangeStart(range, [...taskDates, ...timesheetDates], now);
  const durationDays = Math.max(0, daysBetween(start, today));
  const stepDays = Math.max(1, Math.ceil(durationDays / 89));

  const datedTasks = tasks
    .map((task) => ({
      date: toLocalDate(task.created_at),
      hours: Number(task.estimate_hours) || 3,
    }))
    .filter((task): task is { date: Date; hours: number } =>
      task.date !== null && task.date >= start && task.date <= today
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const datedTimesheets = timesheets
    .map((entry) => ({
      date: toLocalDate(entry.date || entry.created_at),
      hours: Number(entry.hours) || 0,
    }))
    .filter((entry): entry is { date: Date; hours: number } =>
      entry.date !== null && entry.date >= start && entry.date <= today
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const totalScopeHours = datedTasks.reduce((sum, task) => sum + task.hours, 0);
  const points: BurndownPoint[] = [];
  let taskIndex = 0;
  let timesheetIndex = 0;
  let addedScopeHours = 0;
  let loggedHours = 0;

  for (let offset = 0; offset <= durationDays; offset += stepDays) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);

    let task = datedTasks[taskIndex];
    while (task && task.date <= date) {
      addedScopeHours += task.hours;
      taskIndex += 1;
      task = datedTasks[taskIndex];
    }

    let timesheet = datedTimesheets[timesheetIndex];
    while (timesheet && timesheet.date <= date) {
      loggedHours += timesheet.hours;
      timesheetIndex += 1;
      timesheet = datedTimesheets[timesheetIndex];
    }

    const progress = durationDays === 0 ? 1 : offset / durationDays;
    points.push({
      date: toDateKey(date),
      day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ideal: roundHours(totalScopeHours * (1 - progress)),
      actual: roundHours(Math.max(0, addedScopeHours - loggedHours)),
    });
  }

  const lastPoint = points[points.length - 1];
  if (!lastPoint || lastPoint.date !== toDateKey(today)) {
    let task = datedTasks[taskIndex];
    while (task) {
      addedScopeHours += task.hours;
      taskIndex += 1;
      task = datedTasks[taskIndex];
    }
    let timesheet = datedTimesheets[timesheetIndex];
    while (timesheet) {
      loggedHours += timesheet.hours;
      timesheetIndex += 1;
      timesheet = datedTimesheets[timesheetIndex];
    }
    points.push({
      date: toDateKey(today),
      day: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ideal: 0,
      actual: roundHours(Math.max(0, addedScopeHours - loggedHours)),
    });
  }

  return points;
}
