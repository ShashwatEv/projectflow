import { useState, useEffect } from 'react';
import { 
  CreditCard, Check, Users, HardDrive, Download, 
  ExternalLink, Sparkles, X, CheckCircle2, Loader2, ArrowUpRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount: string;
  status: 'PAID' | 'FREE';
}

export default function BillingSettings() {
  const [memberCount, setMemberCount] = useState<number>(1);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(true);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);

  // Invoices history (Free development receipts)
  const [invoices] = useState<Invoice[]>([
    {
      id: 'inv_1',
      invoice_number: 'INV-2026-001',
      date: 'Oct 01, 2026',
      amount: '$0.00',
      status: 'FREE',
    },
    {
      id: 'inv_0',
      invoice_number: 'INV-2026-WELCOME',
      date: 'Sep 15, 2026',
      amount: '$0.00',
      status: 'FREE',
    },
  ]);

  // Fetch real team members from Supabase to compute exact seat usage
  useEffect(() => {
    async function loadTeamCount() {
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          setMemberCount(count);
        }
      } catch (err) {
        console.warn('Could not fetch seat count:', err);
      } finally {
        setLoadingMembers(false);
      }
    }

    loadTeamCount();
  }, []);

  const SEAT_LIMIT = 5;
  const seatsRemaining = Math.max(0, SEAT_LIMIT - memberCount);
  const seatsPercent = Math.min(100, Math.round((memberCount / SEAT_LIMIT) * 100));

  const downloadInvoice = (invoice: Invoice) => {
    const receiptContent = `PROJECTFLOW INVOICE RECEIPT
=================================
Invoice: ${invoice.invoice_number}
Date: ${invoice.date}
Plan: Developer Free Team
Billed To: Workspace Admin
Amount: ${invoice.amount}
Status: COMPLETED (Zero Balance / Active Dev Tier)
=================================
Thank you for building with ProjectFlow!`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.invoice_number}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${invoice.invoice_number}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* 1. Main Current Plan Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#161b2e] via-[#101423] to-[#0d1117] border border-indigo-950/60 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Current Plan</span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Developer Team Free
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Active lifetime development license • No expiration date
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Unlimited Projects & Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Up to 5 Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Pooled Gemini AI (7,500 req/day)</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span>Realtime Supabase Presence</span>
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
                100% Free for Team
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
              <span>Monthly</span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isAnnual ? 'bg-orange-600' : 'bg-gray-700'
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
              className="w-full md:w-auto px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* 2. Usage Meters: Seats & Storage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seats Used */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seats Used</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {loadingMembers ? (
                    'Calculating team seats...'
                  ) : seatsRemaining > 0 ? (
                    `You have ${seatsRemaining} seat${seatsRemaining > 1 ? 's' : ''} remaining.`
                  ) : (
                    'Team seat limit reached.'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${seatsPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 font-mono">
              <span>{memberCount} Active Member{memberCount > 1 ? 's' : ''}</span>
              <span>{SEAT_LIMIT} Max Free Limit</span>
            </div>
          </div>
        </div>

        {/* Workspace Storage */}
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Storage Usage</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Chat attachments & project assets. Plenty of space left.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full w-[12%]" />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 font-mono">
              <span>620 MB Used</span>
              <span>5 GB Free Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Payment Method */}
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
                Your workspace is on the community open-tier license.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toast.info('No card required for the free developer tier!')}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            Add Backup Card
          </button>
        </div>
      </div>

      {/* 4. Invoice History */}
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Invoice History</h4>
          <button
            type="button"
            onClick={() => invoices.forEach(inv => downloadInvoice(inv))}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            Download All
          </button>
        </div>

        <div className="divide-y divide-gray-800/80 border-t border-gray-800">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="py-3 flex items-center justify-between text-xs text-gray-300 hover:bg-[#0d1117]/50 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-gray-200">{inv.invoice_number}</span>
                <span className="text-gray-500 text-[11px]">{inv.date}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-mono text-gray-300">{inv.amount}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                  {inv.status}
                </span>
                <button
                  type="button"
                  onClick={() => downloadInvoice(inv)}
                  className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                  title="Download receipt"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Change Plan Dialog Modal --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b22] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#0d1117]/60">
              <h3 className="font-bold text-sm text-white">Select a Workspace Plan</h3>
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
              <div className="p-5 rounded-2xl bg-[#0d1117] border-2 border-orange-500/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-white text-sm">Developer Free</span>
                    <span className="text-[10px] font-bold uppercase bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] mb-4">
                    Best for 5-person agile engineering teams and student projects.
                  </p>
                  <span className="text-2xl font-extrabold text-white block mb-4">$0 <span className="text-xs text-gray-500 font-normal">/mo</span></span>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Up to 5 team members</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Pooled Gemini code keys</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-emerald-400" /> Monaco web editor</li>
                  </ul>
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full py-2 bg-gray-800 text-gray-400 rounded-xl font-bold text-xs cursor-default"
                >
                  Current Plan
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
                    For multi-repo scaling, dedicated Ollama clusters, and custom SSO.
                  </p>
                  <span className="text-2xl font-extrabold text-white block mb-4">$29 <span className="text-xs text-gray-500 font-normal">/seat/mo</span></span>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2"><Check size={13} className="text-indigo-400" /> Unlimited seats & teams</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-indigo-400" /> Dedicated GitHub app hooks</li>
                    <li className="flex items-center gap-2"><Check size={13} className="text-indigo-400" /> Custom enterprise SLA</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlanModalOpen(false);
                    toast.success('Your workspace is already enjoying all features on the Free tier!');
                  }}
                  className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors"
                >
                  Upgrade Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}