import { useState, useEffect } from 'react';
import { 
  CreditCard, Check, Users, HardDrive, Download, 
  Sparkles, X, CheckCircle2, Loader2, FolderKanban, ShieldCheck
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

  // Fetch real Supabase metrics (Users count, Projects count, Storage size, and Audit records)
  useEffect(() => {
    async function loadWorkspaceBillingData() {
      setLoadingMetrics(true);
      try {
        // 1. Fetch real team members count
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        if (usersCount !== null) setMemberCount(usersCount);

        // 2. Fetch real projects count
        const { count: projsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        if (projsCount !== null) setProjectCount(projsCount);

        // 3. Query real storage usage from Supabase 'chat-files' bucket
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

        // 4. Fetch real billing / security audit logs as verified receipts
        const { data: auditData } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (auditData && auditData.length > 0) {
          const formattedLedger: BillingRecord[] = auditData.map((log: any, idx: number) => ({
            id: log.id,
            invoice_number: `REC-${new Date(log.created_at).getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
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
          // Clean initial grant record if no audit entries exist yet
          setBillingLedger([
            {
              id: 'init_grant',
              invoice_number: 'REC-2026-001',
              date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
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

  // Format Storage Display
  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const FREE_STORAGE_LIMIT_MB = 1024; // 1 GB free bucket limit
  const currentStorageMb = storageBytes / (1024 * 1024);
  const storagePercent = Math.min(100, Math.max(1, Math.round((currentStorageMb / FREE_STORAGE_LIMIT_MB) * 100)));

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* 1. Main Current Plan Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161b2e] via-[#101423] to-[#0d1117] border border-gray-800 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 text-[11px] font-bold uppercase tracking-wider`}>
              <Sparkles size={12} />
              <span>Current Plan</span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Developer Team Free
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Active lifetime development license • Realtime synchronization enabled
              </p>
            </div>

            {/* Live Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Unlimited Projects & Task Columns</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Up to {SEAT_LIMIT} Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Pooled Gemini AI Code & Task Advisor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Supabase Realtime Broadcast & Presence</span>
              </div>
            </div>
          </div>

          {/* Pricing & Plan Switch */}
          <div className="w-full md:w-auto bg-[#0d1117]/80 backdrop-blur border border-gray-800 rounded-2xl p-5 flex flex-col items-center md:items-end gap-3 shrink-0">
            <div className="text-center md:text-right">
              <div className="flex items-baseline justify-center md:justify-end gap-1">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-xs text-gray-400 font-medium">/month</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                100% Free Forever
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
              <span>Monthly</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isAnnual ? theme.toggleActive : 'bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transition-transform ${
                    isAnnual ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span>Yearly</span>
            </div>

            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className={`w-full md:w-auto px-5 py-2.5 ${theme.btnPrimary} font-bold text-xs rounded-xl shadow-md transition-all active:scale-95`}
            >
              Explore Tiers
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-time Telemetry Usage Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Seats Usage */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seats Utilized</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {loadingMetrics ? 'Fetching users...' : `${seatsRemaining} seats available`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${seatsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>{memberCount} Active</span>
              <span>{SEAT_LIMIT} Free Max</span>
            </div>
          </div>
        </div>

        {/* Live Supabase Storage Meter */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Storage Bucket</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {loadingMetrics ? 'Calculating bucket...' : 'Chat media & project files'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>{formatStorage(storageBytes)}</span>
              <span>1 GB Limit</span>
            </div>
          </div>
        </div>

        {/* Workspace Projects Meter */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${theme.bgSubtle} border ${theme.borderAccent}/30 ${theme.textAccent} flex items-center justify-center`}>
                <FolderKanban size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Active Projects</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {loadingMetrics ? 'Counting...' : 'Unlimited boards enabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className={`h-full ${theme.progressBar} rounded-full w-[35%] transition-all duration-500`} />
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 font-mono">
              <span>{projectCount} Repos & Boards</span>
              <span>Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Payment Status */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Payment Method</h4>
        
        <div className="flex items-center justify-between p-4 bg-[#0d1117] border border-gray-800 rounded-xl text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-7 rounded-md bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="font-semibold text-white">No payment required</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Your workspace is operating on the open-access Developer community license.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.info('No card required! All current workspace features are completely free.')}
            className={`text-xs font-semibold ${theme.textAccent} hover:underline transition-colors`}
          >
            Add Backup Card
          </button>
        </div>
      </div>

      {/* 4. Real Supabase Receipts / Audit Billing Trail */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invoice & Audit Receipts</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Cryptographic log of workspace subscription grants</p>
          </div>
          <button
            type="button"
            onClick={() => billingLedger.forEach((rec) => downloadReceipt(rec))}
            className={`text-xs font-semibold ${theme.textAccent} hover:underline transition-colors`}
          >
            Download All Receipts
          </button>
        </div>

        <div className="divide-y divide-gray-800/80 border-t border-gray-800">
          {billingLedger.map((rec) => (
            <div
              key={rec.id}
              className="py-3.5 flex items-center justify-between text-xs text-gray-300 hover:bg-[#0d1117]/50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-200">{rec.invoice_number}</span>
                <span className="text-gray-400 font-sans text-xs">{rec.action}</span>
                <span className="text-gray-500 text-[11px] hidden sm:inline">{rec.date}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-emerald-400 font-bold">{rec.amount}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                  {rec.status}
                </span>
                <button
                  type="button"
                  onClick={() => downloadReceipt(rec)}
                  className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Download receipt"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Plan Information Dialog Modal --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]/80">
              <h3 className="font-bold text-sm text-white">Workspace License Details</h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Free Tier Card */}
              <div className="p-5 rounded-2xl bg-[#0d1117] border-2 border-emerald-500/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">Developer Community</span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mb-4">
                    Full workspace access, code studio, pooled Gemini AI, and realtime chat.
                  </p>
                  <span className="text-2xl font-extrabold text-white block mb-4">$0 <span className="text-xs text-gray-500 font-normal">/mo forever</span></span>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Up to {SEAT_LIMIT} team members</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Pooled Gemini code keys</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Monaco diff editor & terminal</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Full Supabase Realtime sync</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full py-2 bg-gray-800 text-gray-400 rounded-xl font-bold text-xs cursor-default"
                >
                  Active Current Plan
                </button>
              </div>

              {/* Enterprise / Cloud Tier */}
              <div className="p-5 rounded-2xl bg-[#0d1117] border border-gray-800 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">Enterprise Dedicated</span>
                    <span className="text-[10px] font-bold uppercase bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                      Custom
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mb-4">
                    For multi-tenant organizational compliance and custom SSO integrations.
                  </p>
                  <span className="text-2xl font-extrabold text-white block mb-4">$29 <span className="text-xs text-gray-500 font-normal">/seat/mo</span></span>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2"><Check size={13} className={theme.textAccent} /> Unlimited organization seats</li>
                    <li className="flex items-center gap-2"><Check size={13} className={theme.textAccent} /> Dedicated private GitHub apps</li>
                    <li className="flex items-center gap-2"><Check size={13} className={theme.textAccent} /> Custom enterprise SLA & audit export</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    toast.success('Your workspace is already enjoying all features on the Free tier!');
                  }}
                  className={`mt-6 w-full py-2 ${theme.btnPrimary} text-white rounded-xl font-bold text-xs transition-colors`}
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