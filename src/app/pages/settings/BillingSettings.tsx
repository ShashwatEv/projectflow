import { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Users,
  HardDrive,
  Download,
  Sparkles,
  X,
  FolderKanban,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

interface BillingRecord {
  id: string;
  invoice_number: string;
  date: string;
  action: string;
  amount: string;
  status: 'PAID' | 'FREE' | 'ACTIVE';
}

export default function BillingSettings() {
  const theme = useAccentTheme();

  const [memberCount, setMemberCount] = useState<number>(1);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [billingLedger, setBillingLedger] = useState<BillingRecord[]>([]);

  useEffect(() => {
    async function loadWorkspaceBillingData() {
      setLoadingMetrics(true);
      try {
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (usersCount !== null) setMemberCount(usersCount);

        const { count: projsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        if (projsCount !== null) setProjectCount(projsCount);

        const { data: storageFiles } = await supabase.storage
          .from('chat-files')
          .list('', { limit: 100 });

        if (storageFiles && storageFiles.length > 0) {
          const totalBytes = storageFiles.reduce(
            (acc, file) => acc + (file.metadata?.size || 0),
            0
          );
          setStorageBytes(totalBytes);
        }

        const { data: auditData } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (auditData && auditData.length > 0) {
          const formattedLedger: BillingRecord[] = auditData.map((log: any, idx: number) => ({
            id: log.id,
            invoice_number: `REC-${new Date(log.created_at).getFullYear()}-${String(
              idx + 1
            ).padStart(3, '0')}`,
            date: new Date(log.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            action: log.action || 'Workspace Verification',
            amount: '$0.00',
            status: 'FREE',
          }));
          setBillingLedger(formattedLedger);
        } else {
          setBillingLedger([
            {
              id: 'init_grant',
              invoice_number: 'REC-2026-001',
              date: new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              action: 'Community Lifetime Developer Grant',
              amount: '$0.00',
              status: 'FREE',
            },
          ]);
        }
      } catch (err) {
        console.warn('Error loading billing telemetry:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    loadWorkspaceBillingData();
  }, []);

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const FREE_STORAGE_LIMIT_MB = 1024;
  const currentStorageMb = storageBytes / (1024 * 1024);
  const storagePercent = Math.min(
    100,
    Math.max(1, Math.round((currentStorageMb / FREE_STORAGE_LIMIT_MB) * 100))
  );

  const SEAT_LIMIT = 10;
  const seatsRemaining = Math.max(0, SEAT_LIMIT - memberCount);
  const seatsPercent = Math.min(100, Math.round((memberCount / SEAT_LIMIT) * 100));

  const downloadReceipt = (record: BillingRecord) => {
    const receiptContent = `=========================================
PROJECTFLOW WORKSPACE RECEIPT
=========================================
Receipt Number: ${record.invoice_number}
Date:           ${record.date}
Activity:       ${record.action}
Plan:           Developer Community Team (100% Free)
Amount:         ${record.amount}
Status:         ${record.status} (Zero Balance / Active)
=========================================
Thank you for building with ProjectFlow!`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${record.invoice_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${record.invoice_number}`);
  };

  const planFeatures = [
    'Unlimited Projects & Task Columns',
    `Up to ${SEAT_LIMIT} Team Members`,
    'Pooled Gemini AI Code & Task Advisor',
    'Supabase Realtime Broadcast & Presence',
  ];

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* 1. Main Current Plan Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-[#ECEEFF] via-white to-indigo-50/70 p-6 shadow-sm dark:border-gray-800 dark:from-[#161b2e] dark:via-[#101423] dark:to-[#0d1117] dark:shadow-xl md:p-8">
        <div className="h-1 w-full bg-gradient-to-r from-[#4B74FF] via-indigo-500 to-violet-500 absolute inset-x-0 top-0" />
        <div className="flex flex-col items-start justify-between gap-6 pt-1 md:flex-row md:items-center">
          <div className="space-y-3">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
            >
              <Sparkles size={12} />
              <span>Current Plan</span>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Developer Team Free
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Active lifetime development license • Realtime synchronization enabled
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-2 pt-2 text-xs font-medium text-gray-700 dark:text-gray-300 sm:grid-cols-2">
              {planFeatures.map((feat) => (
                <div key={feat} className="flex items-center gap-2">
                  <Check size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Plan Switch */}
          <div className="flex w-full shrink-0 flex-col items-center gap-3 rounded-2xl border border-gray-200/90 bg-white/90 p-5 shadow-xs backdrop-blur dark:border-gray-800 dark:bg-[#0d1117]/80 md:w-auto md:items-end">
            <div className="text-center md:text-right">
              <div className="flex items-baseline justify-center gap-1 md:justify-end">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">$0</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">/month</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                100% Free Forever
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <span>Monthly</span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                aria-label="Toggle yearly billing view"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isAnnual ? theme.toggleActive : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                    isAnnual ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span>Yearly</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className={`w-full rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 md:w-auto ${theme.btnPrimary}`}
            >
              Explore Tiers
            </button>
          </div>
        </div>
      </section>

      {/* 2. Real-time Telemetry Usage Meters */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Seats Usage */}
        <div className="space-y-3 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200/80 bg-blue-50 text-[#4B74FF] dark:border-blue-500/20 dark:bg-blue-600/10 dark:text-blue-400">
                <Users size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Seats Utilized
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  {loadingMetrics ? 'Fetching users...' : `${seatsRemaining} seats available`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-[#4B74FF] transition-all duration-500 dark:bg-blue-500"
                style={{ width: `${seatsPercent}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
              <span>{memberCount} Active</span>
              <span>{SEAT_LIMIT} Free Max</span>
            </div>
          </div>
        </div>

        {/* Live Supabase Storage Meter */}
        <div className="space-y-3 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200/80 bg-purple-50 text-purple-600 dark:border-purple-500/20 dark:bg-purple-600/10 dark:text-purple-400">
                <HardDrive size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Storage Bucket
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  {loadingMetrics ? 'Calculating bucket...' : 'Chat media & project files'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500 dark:bg-purple-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
              <span>{formatStorage(storageBytes)}</span>
              <span>1 GB Limit</span>
            </div>
          </div>
        </div>

        {/* Workspace Projects Meter */}
        <div className="space-y-3 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${theme.bgSubtle} ${theme.borderAccent}/30 ${theme.textAccent}`}
              >
                <FolderKanban size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Active Projects
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  {loadingMetrics ? 'Counting...' : 'Unlimited boards enabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full w-[35%] rounded-full transition-all duration-500 ${theme.progressBar}`}
              />
            </div>
            <div className="flex justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
              <span>{projectCount} Repos & Boards</span>
              <span>Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Payment Status */}
      <section className="space-y-3 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
          Payment Method
        </h4>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-xs dark:border-gray-800 dark:bg-[#0d1117] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-7 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">No payment required</p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Your workspace is operating on the open-access Developer community license.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toast.info('No card required! All current workspace features are completely free.')
            }
            className={`text-left text-xs font-semibold hover:underline transition-colors sm:text-right ${theme.textAccent}`}
          >
            Add Backup Card
          </button>
        </div>
      </section>

      {/* 4. Real Supabase Receipts / Audit Billing Trail */}
      <section className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Invoice & Audit Receipts
            </h4>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              Cryptographic log of workspace subscription grants
            </p>
          </div>
          <button
            type="button"
            onClick={() => billingLedger.forEach((rec) => downloadReceipt(rec))}
            className={`text-left text-xs font-semibold hover:underline transition-colors sm:text-right ${theme.textAccent}`}
          >
            Download All Receipts
          </button>
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800/80 dark:border-gray-800">
          {billingLedger.map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between gap-3 rounded-xl px-2 py-3.5 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-[#0d1117]/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 font-mono text-gray-900 dark:text-gray-200">
                  {rec.invoice_number}
                </span>
                <span className="truncate font-sans text-xs text-gray-600 dark:text-gray-400">
                  {rec.action}
                </span>
                <span className="hidden shrink-0 text-[11px] text-gray-400 dark:text-gray-500 sm:inline">
                  {rec.date}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {rec.amount}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {rec.status}
                </span>
                <button
                  type="button"
                  onClick={() => downloadReceipt(rec)}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                  title="Download receipt"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Plan Information Dialog Modal --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200 dark:bg-black/75">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#161b22]">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/90 px-6 py-4 dark:border-gray-800 dark:bg-[#0d1117]/80">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Workspace License Details
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 text-xs md:grid-cols-2">
              {/* Free Tier Card */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-500/80 bg-gray-50/70 p-5 dark:bg-[#0d1117]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Developer Community
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-600/20 dark:text-emerald-400">
                      Active
                    </span>
                  </div>
                  <p className="mb-4 text-[11px] text-gray-600 dark:text-gray-400">
                    Full workspace access, code studio, pooled Gemini AI, and realtime chat.
                  </p>
                  <span className="mb-4 block text-2xl font-extrabold text-gray-900 dark:text-white">
                    $0{' '}
                    <span className="text-xs font-normal text-gray-500">/mo forever</span>
                  </span>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> Up to{' '}
                      {SEAT_LIMIT} team members
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> Pooled
                      Gemini code keys
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> Monaco
                      diff editor & terminal
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> Full
                      Supabase Realtime sync
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full cursor-default rounded-xl bg-gray-200 py-2 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                >
                  Active Current Plan
                </button>
              </div>

              {/* Enterprise / Cloud Tier */}
              <div className="flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-5 opacity-90 transition-opacity hover:opacity-100 dark:border-gray-800 dark:bg-[#0d1117]">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Enterprise Dedicated
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      Custom
                    </span>
                  </div>
                  <p className="mb-4 text-[11px] text-gray-600 dark:text-gray-400">
                    For multi-tenant organizational compliance and custom SSO integrations.
                  </p>
                  <span className="mb-4 block text-2xl font-extrabold text-gray-900 dark:text-white">
                    $29{' '}
                    <span className="text-xs font-normal text-gray-500">/seat/mo</span>
                  </span>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <Check size={13} className={theme.textAccent} /> Unlimited organization seats
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className={theme.textAccent} /> Dedicated private GitHub
                      apps
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={13} className={theme.textAccent} /> Custom enterprise SLA &
                      audit export
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    toast.success(
                      'Your workspace is already enjoying all features on the Free tier!'
                    );
                  }}
                  className={`mt-6 w-full rounded-xl py-2 text-xs font-bold text-white transition-colors ${theme.btnPrimary}`}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}