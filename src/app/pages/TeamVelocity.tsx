import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitCommit, RefreshCw, GitPullRequest, 
  Lock, ArrowLeft, ArrowRight, Clock,
  ExternalLink, GitMerge, AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

interface CommitActivityPoint {
  date: string;
  commits: number;
  loggedHours: number;
}

interface HeatmapDay {
  dateStr: string;
  dayOfWeek: number;
  count: number;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface LiveCommit {
  sha: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  url: string;
}

interface LivePR {
  id: number;
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  state: 'open' | 'closed';
  merged: boolean;
  createdAt: string;
  url: string;
  draft: boolean;
}

export default function TeamVelocity() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);
  const is2FaEnabled = Boolean(user?.is_2fa_enabled || isSuperAdmin);
  const hasAccess = isVerified && is2FaEnabled;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [loading, setLoading] = useState<boolean>(true);

  // Strictly Live Data Containers
  const [rawCommitsByDate, setRawCommitsByDate] = useState<Record<string, number>>({});
  const [rawTimesheetsByDate, setRawTimesheetsByDate] = useState<Record<string, number>>({});
  const [timelineData, setTimelineData] = useState<CommitActivityPoint[]>([]);

  const [recentCommits, setRecentCommits] = useState<LiveCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<LivePR[]>([]);
  const [reviewTasksCount, setReviewTasksCount] = useState<number>(0);
  const [activeRepoName, setActiveRepoName] = useState<string>('');

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [tasksRes, timesheetsRes, projectsRes, auditRes] = await Promise.all([
        supabase.from('tasks').select('id, status, created_at'),
        supabase.from('timesheets').select('id, hours, date, created_at'),
        supabase.from('projects').select('name, github_repo'),
        supabase.from('audit_logs').select('action, created_at'),
      ]);

      const tasks = tasksRes.data || [];
      const timesheets = timesheetsRes.data || [];
      const projects = projectsRes.data || [];
      const auditLogs = auditRes.data || [];

      // 1. Live Timesheet Hours mapping
      const tsMap: Record<string, number> = {};
      timesheets.forEach((ts: any) => {
        const d = (ts.date || ts.created_at || '').slice(0, 10);
        if (d) {
          tsMap[d] = (tsMap[d] || 0) + (Number(ts.hours) || 0);
        }
      });
      setRawTimesheetsByDate(tsMap);

      // 2. Count live tasks in review
      const inReview = tasks.filter((t: any) => t.status === 'review').length;
      setReviewTasksCount(inReview);

      // 3. Detect Real Connected GitHub Repository
      const storedRepo = localStorage.getItem('pf_active_repo') || (projects.find((p: any) => p.github_repo)?.github_repo || '');
      const storedToken = localStorage.getItem('pf_github_token') || '';
      const commitCounts: Record<string, number> = {};
      setActiveRepoName(storedRepo);

      // 4. Fetch Live Commits & PRs from GitHub REST API
      if (storedRepo.includes('/')) {
        const [owner, repo] = storedRepo.split('/');
        const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
        if (storedToken.trim()) headers['Authorization'] = `token ${storedToken.trim()}`;

        try {
          // Fetch live git commits
          const ghRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
            { headers }
          );

          if (ghRes.ok) {
            const commitsJson = await ghRes.json();
            const parsedCommits: LiveCommit[] = [];

            commitsJson.forEach((c: any) => {
              const dateStr = c.commit?.committer?.date?.slice(0, 10);
              if (dateStr) {
                commitCounts[dateStr] = (commitCounts[dateStr] || 0) + 1;
              }

              parsedCommits.push({
                sha: c.sha?.slice(0, 7) || 'HEAD',
                message: c.commit?.message?.split('\n')[0] || 'Commit update',
                authorName: c.author?.login || c.commit?.author?.name || 'Developer',
                authorAvatar: c.author?.avatar_url || '/pfp.jpg',
                date: c.commit?.committer?.date || new Date().toISOString(),
                url: c.html_url || `https://github.com/${owner}/${repo}/commit/${c.sha}`,
              });
            });

            setRecentCommits(parsedCommits.slice(0, 6));
          }
        } catch (err) {
          console.warn('GitHub Commits sync:', err);
        }

        try {
          // Fetch live pull requests
          const prRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=10`,
            { headers }
          );

          if (prRes.ok) {
            const prsJson = await prRes.json();
            const parsedPRs: LivePR[] = prsJson.map((p: any) => ({
              id: p.id,
              number: p.number,
              title: p.title,
              author: p.user?.login || 'Collaborator',
              authorAvatar: p.user?.avatar_url || '/pfp.jpg',
              state: p.state,
              merged: Boolean(p.merged_at),
              createdAt: p.created_at,
              url: p.html_url,
              draft: Boolean(p.draft),
            }));

            setPullRequests(parsedPRs.slice(0, 4));
          }
        } catch (err) {
          console.warn('GitHub PRs sync:', err);
        }
      }

      // 5. Ingest Supabase Audit Trail Git Actions (Real logged pushes)
      auditLogs.forEach((a: any) => {
        if (a.action && /commit|push/i.test(a.action)) {
          const dateStr = a.created_at?.slice(0, 10);
          if (dateStr) {
            commitCounts[dateStr] = (commitCounts[dateStr] || 0) + 1;
          }
        }
      });

      setRawCommitsByDate(commitCounts);

      // 6. Real 7-day Line/Bar Chart Series
      const last7Days: string[] = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });

      const series: CommitActivityPoint[] = last7Days.map((dateKey) => {
        const dayHours = tsMap[dateKey] ?? 0;
        const dayCommits = commitCounts[dateKey] ?? 0;
        const shortDate = new Date(dateKey).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'numeric',
          day: 'numeric',
        });

        return {
          date: shortDate,
          loggedHours: Math.round(dayHours * 10) / 10,
          commits: dayCommits,
        };
      });

      setTimelineData(series);
    } catch (err) {
      console.error('Error fetching velocity telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchTelemetry();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  // Strictly Real 52-Week Matrix (Zero hardcoded Math.random)
  const { heatmapWeeks, monthLabels, totalYearContributions } = useMemo(() => {
    const isCurrent = selectedYear === currentYear;
    let endTarget = new Date(selectedYear, 11, 31);
    if (isCurrent) {
      endTarget = new Date();
    }

    const endDate = new Date(endTarget);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (52 * 7) + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: HeatmapDay[][] = [];
    const months: { label: string; colIndex: number }[] = [];
    let prevMonth = -1;
    let totalCount = 0;

    const curr = new Date(startDate);
    let col = 0;

    while (curr <= endDate) {
      const week: HeatmapDay[] = [];
      let monthRegisteredForCol = false;

      for (let day = 0; day < 7; day++) {
        const ymd: string = curr.toISOString().slice(0, 10);
        const dayMonth = curr.getMonth();

        if (dayMonth !== prevMonth && !monthRegisteredForCol) {
          months.push({
            label: curr.toLocaleDateString(undefined, { month: 'short' }),
            colIndex: col,
          });
          prevMonth = dayMonth;
          monthRegisteredForCol = true;
        }

        const commits = rawCommitsByDate[ymd] || 0;
        const hours = rawTimesheetsByDate[ymd] || 0;
        const actCount = commits + (hours > 0 ? 1 : 0);

        totalCount += actCount;

        // Level calculated purely on real activity
        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (actCount >= 5) level = 4;
        else if (actCount >= 3) level = 3;
        else if (actCount >= 2) level = 2;
        else if (actCount >= 1) level = 1;

        week.push({
          dateStr: ymd,
          dayOfWeek: day,
          count: actCount,
          hours: Math.round(hours * 10) / 10,
          level,
        });

        curr.setDate(curr.getDate() + 1);
      }

      weeks.push(week);
      col++;
    }

    return {
      heatmapWeeks: weeks,
      monthLabels: months,
      totalYearContributions: totalCount,
    };
  }, [selectedYear, rawCommitsByDate, rawTimesheetsByDate, currentYear]);

  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'just now';
  };

  if (!hasAccess) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => navigate('/retrospectives')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Retrospectives
        </button>

        <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock size={26} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Restricted: Advanced Velocity & Telemetry
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              Detailed commit cadence, multi-repo code churn, and activity telemetry require a verified identity badge and 2-Factor Authentication.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/settings')}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs text-white shadow-md transition-all active:scale-95`}
            >
              <span>Configure 2FA & Verify Email</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-[#0e4429] border-[#006d32]/40';
      case 2: return 'bg-[#006d32] border-[#26a641]/50';
      case 3: return 'bg-[#26a641] border-[#39d353]/60';
      case 4: return 'bg-[#39d353] border-[#39d353]';
      default: return 'bg-gray-100 dark:bg-[#161b22] border-gray-200/80 dark:border-gray-800';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <button
            onClick={() => navigate('/retrospectives')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Retrospectives
          </button>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <GitCommit size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Team Velocity & Contribution Telemetry
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                52-week activity matrices, real-time repository commit streams, and PR review turnaround metrics.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          title="Refresh Telemetry"
          className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-[#161b22] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 transition-colors shadow-xs"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* GitHub 52-Week Full Heatmap with Aligned Month Columns */}
      <div className="bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {totalYearContributions.toLocaleString()} contributions in {selectedYear}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeRepoName ? `Connected to ${activeRepoName}` : 'Pulls live data from your active GitHub repository and timesheet logs'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {[2026, 2025, 2024].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-white'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* 52-Week Full Matrix Wrapper */}
        <div className="bg-gray-50/50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 overflow-x-auto custom-scrollbar">
          <div className="w-fit min-w-[760px] mx-auto select-none space-y-2">
            
            {/* Aligned Month Header Row */}
            <div className="flex pl-8 gap-[3px] text-[10px] text-gray-400 font-mono h-4">
              {heatmapWeeks.map((_, colIdx) => {
                const match = monthLabels.find((m) => m.colIndex === colIdx);
                return (
                  <div key={colIdx} className="w-[11px] shrink-0 relative">
                    {match && (
                      <span className="absolute left-0 top-0 whitespace-nowrap">
                        {match.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Matrix Body with Weekday Labels on the Left */}
            <div className="flex items-start gap-2">
              <div className="flex flex-col justify-between text-[9px] text-gray-400 font-mono h-[95px] w-6 text-right leading-none shrink-0 py-0.5">
                <span></span>
                <span>Mon</span>
                <span></span>
                <span>Wed</span>
                <span></span>
                <span>Fri</span>
                <span></span>
              </div>

              {/* 52 Week Columns with Exact Alignment */}
              <div className="flex gap-[3px]">
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-[3px]">
                    {week.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        title={`${d.count} contributions on ${d.dateStr}${d.hours > 0 ? ` (${d.hours}h logged)` : ''}`}
                        className={`w-[11px] h-[11px] rounded-[2px] border transition-transform hover:scale-150 hover:z-20 cursor-pointer ${getLevelColor(d.level)}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Legend */}
            <div className="flex items-center justify-between pt-3 text-[11px] text-gray-400 border-t border-gray-200 dark:border-gray-800/80">
              <span className="text-xs text-gray-500">Live Workspace Activity</span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>Less</span>
                <span className={`w-2.5 h-2.5 rounded-[2px] border ${getLevelColor(0)}`} />
                <span className={`w-2.5 h-2.5 rounded-[2px] border ${getLevelColor(1)}`} />
                <span className={`w-2.5 h-2.5 rounded-[2px] border ${getLevelColor(2)}`} />
                <span className={`w-2.5 h-2.5 rounded-[2px] border ${getLevelColor(3)}`} />
                <span className={`w-2.5 h-2.5 rounded-[2px] border ${getLevelColor(4)}`} />
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Signal Stream: Live Git Commits (Left) & Active PR Pipeline (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-200 dark:border-gray-800/80">
          
          {/* Live Git Commit & Event Stream */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <GitCommit size={14} className="text-emerald-500" />
                <span>Live Repository Commits</span>
              </h4>
              <span className="text-[10px] font-mono text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                HEAD branch
              </span>
            </div>

            {recentCommits.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                No external commits captured yet. Connect your GitHub repository to stream real pushes.
              </div>
            ) : (
              <div className="space-y-2">
                {recentCommits.map((c) => (
                  <div
                    key={c.sha}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800/80 flex items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={c.authorAvatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-300 dark:border-gray-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">
                          {c.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                          <span>{c.authorName}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(c.date)}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300 hover:text-indigo-400 transition-colors shrink-0"
                    >
                      <span>{c.sha}</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Pull Request & Code Review Pipeline */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <GitPullRequest size={14} className="text-purple-400" />
                <span>Pull Request & Review Pipeline</span>
              </h4>
              <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                {reviewTasksCount} Tasks in Review
              </span>
            </div>

            {pullRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                {activeRepoName ? `No open pull requests found for ${activeRepoName}.` : 'No active pull requests.'}
              </div>
            ) : (
              <div className="space-y-2">
                {pullRequests.map((pr) => {
                  const hoursOld = Math.floor((Date.now() - new Date(pr.createdAt).getTime()) / 3600000);
                  const isStagnant = hoursOld > 24 && pr.state === 'open';

                  return (
                    <div
                      key={pr.id}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800/80 flex items-center justify-between gap-3 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-xl shrink-0 ${
                          pr.merged
                            ? 'bg-purple-500/10 text-purple-400'
                            : pr.state === 'open'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {pr.merged ? <GitMerge size={14} /> : <GitPullRequest size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">
                            #{pr.number} {pr.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                            <span>{pr.author}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(pr.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isStagnant && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Clock size={10} />
                            <span>&gt;24h</span>
                          </span>
                        )}
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white bg-white dark:bg-[#0d1117] border border-gray-200 dark:border-gray-700 transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Cadence Line & Bar Chart */}
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <GitCommit size={18} className="text-emerald-500" />
          <span>GitHub Commit Cadence vs. Logged Timesheet Hours</span>
        </h3>
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="loggedHours" fill="#6366f1" radius={[6, 6, 0, 0]} name="Logged Hours (h)" barSize={28} />
              <Line type="monotone" dataKey="commits" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="GitHub Commits" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}