import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Check,
  Users,
  HardDrive,
  Download,
  Sparkles,
  X,
  FolderKanban,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { toast } from 'sonner';

type PlanId = 'free' | 'pro' | 'growth';

interface PlanTier {
  id: PlanId;
  name: string;
  badge: string;
  description: string;
  monthlyUsd: number;
  yearlyUsd: number;
  monthlyInr: number;
  yearlyInr: number;
  seatLimit: number;
  storageLimitMb: number;
  features: string[];
}

interface BillingRecord {
  id: string;
  invoice_number: string;
  date: string;
  action: string;
  amount: string;
  status: 'PAID' | 'FREE' | 'ACTIVE';
}

const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Starter Free',
    badge: 'Starter',
    description: 'For individuals and small teams testing ProjectFlow boards and chat.',
    monthlyUsd: 0,
    yearlyUsd: 0,
    monthlyInr: 0,
    yearlyInr: 0,
    seatLimit: 5,
    storageLimitMb: 250,
    features: [
      'Up to 5 team members',
      'Up to 5 active projects',
      '250 MB file & chat storage',
      'Realtime boards & team messaging',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Team',
    badge: 'Most Popular',
    description: 'Reasonable team pricing with unlimited projects, Code Studio, and AI tools.',
    monthlyUsd: 6,
    yearlyUsd: 5,
    monthlyInr: 499,
    yearlyInr: 399,
    seatLimit: 50,
    storageLimitMb: 10240,
    features: [
      'Unlimited projects & workflow boards',
      'Up to 50 team seats',
      '10 GB storage bucket',
      'AI Code & Task Advisor + Monaco Studio',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Studio',
    badge: 'Scale',
    description: 'For growing engineering orgs needing high storage and audit exports.',
    monthlyUsd: 12,
    yearlyUsd: 10,
    monthlyInr: 999,
    yearlyInr: 799,
    seatLimit: 250,
    storageLimitMb: 102400,
    features: [
      'Everything in Pro Team',
      'Up to 250 team seats',
      '100 GB media & artifact storage',
      'Audit log exports & priority support',
    ],
  },
];

export default function BillingSettings() {
  const theme = useAccentTheme();
  const { user } = useAuth();

  const [memberCount, setMemberCount] = useState<number>(1);
  const [projectCount, setProjectCount] = useState<number>(0);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  const [activePlanId, setActivePlanId] = useState<PlanId>('free');
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [billableSeats, setBillableSeats] = useState<number>(3);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanTier | null>(null);
  const [processingCheckout, setProcessingCheckout] = useState<boolean>(false);
  const [billingLedger, setBillingLedger] = useState<BillingRecord[]>([]);

  const loadWorkspaceBillingData = useCallback(async () => {
    setLoadingMetrics(true);
    try {
      const [usersRes, projsRes, storageRes, subRes, invoicesRes, auditRes] =
        await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.storage.from('chat-files').list('', { limit: 100 }),
          user?.id
            ? (supabase as unknown as {
              from: (rel: string) => {
                select: (cols: string) => {
                  eq: (col: string, val: string) => {
                    maybeSingle: () => Promise<{
                      data: Record<string, unknown> | null;
                      error: unknown;
                    }>;
                  };
                };
              };
            })
              .from('workspace_subscriptions')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          user?.id
            ? (supabase as unknown as {
              from: (rel: string) => {
                select: (cols: string) => {
                  eq: (col: string, val: string) => {
                    order: (
                      col: string,
                      opts: { ascending: boolean }
                    ) => {
                      limit: (n: number) => Promise<{
                        data: Array<Record<string, unknown>> | null;
                        error: unknown;
                      }>;
                    };
                  };
                };
              };
            })
              .from('billing_invoices')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10)
            : Promise.resolve({ data: null, error: null }),
          supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

      const activeMembers = usersRes.count ?? 1;
      setMemberCount(activeMembers);
      setBillableSeats((prev) => Math.max(prev, activeMembers, 1));

      if (projsRes.count !== null) setProjectCount(projsRes.count);

      if (storageRes.data && storageRes.data.length > 0) {
        const totalBytes = storageRes.data.reduce(
          (acc, file) => acc + (file.metadata?.size || 0),
          0
        );
        setStorageBytes(totalBytes);
      }

      const subRow = subRes.data;
      if (subRow && typeof subRow.plan_tier === 'string') {
        const tier = subRow.plan_tier as PlanId;
        if (PLAN_TIERS.some((p) => p.id === tier)) {
          setActivePlanId(tier);
        }
        if (subRow.billing_cycle === 'yearly') setIsAnnual(true);
        if (subRow.billing_cycle === 'monthly') setIsAnnual(false);
        if (typeof subRow.seats_purchased === 'number' && subRow.seats_purchased > 0) {
          setBillableSeats(subRow.seats_purchased);
        }
      }

      if (invoicesRes.data && invoicesRes.data.length > 0) {
        const dbInvoices: BillingRecord[] = invoicesRes.data.map((inv, idx) => ({
          id: String(inv.id || `inv_${idx}`),
          invoice_number:
            typeof inv.invoice_number === 'string'
              ? inv.invoice_number
              : `INV-2026-${String(idx + 1).padStart(3, '0')}`,
          date: inv.created_at
            ? new Date(String(inv.created_at)).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            : new Date().toLocaleDateString(),
          action:
            typeof inv.plan_name === 'string'
              ? `${inv.plan_name} Subscription`
              : 'Plan Subscription',
          amount: typeof inv.amount_label === 'string' ? inv.amount_label : '$0.00',
          status: inv.status === 'PAID' ? 'PAID' : 'ACTIVE',
        }));
        setBillingLedger(dbInvoices);
      } else if (auditRes.data && auditRes.data.length > 0) {
        const formattedLedger: BillingRecord[] = auditRes.data.map((log: any, idx: number) => ({
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
            action: 'Starter Free Workspace Grant',
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
  }, [user?.id]);

  useEffect(() => {
    void loadWorkspaceBillingData();
  }, [loadWorkspaceBillingData]);

  const activePlan =
    PLAN_TIERS.find((p) => p.id === activePlanId) ?? PLAN_TIERS[0]!;

  const formatUnitPrice = (plan: PlanTier) => {
    if (plan.id === 'free') return currency === 'INR' ? '₹0' : '$0';
    if (currency === 'INR') {
      return `₹${isAnnual ? plan.yearlyInr : plan.monthlyInr}`;
    }
    return `$${isAnnual ? plan.yearlyUsd : plan.monthlyUsd}`;
  };

  const computePlanTotalLabel = (plan: PlanTier, seats: number) => {
    if (plan.id === 'free') return currency === 'INR' ? '₹0' : '$0.00';
    const unit =
      currency === 'INR'
        ? isAnnual
          ? plan.yearlyInr
          : plan.monthlyInr
        : isAnnual
          ? plan.yearlyUsd
          : plan.monthlyUsd;
    const multiplier = isAnnual ? 12 : 1;
    const total = unit * Math.max(1, seats) * multiplier;
    return currency === 'INR'
      ? `₹${total.toLocaleString('en-IN')}`
      : `$${total.toFixed(2)}`;
  };

  const formatStorage = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(2)} MB`;
  };

  const currentStorageMb = storageBytes / (1024 * 1024);
  const storagePercent = Math.min(
    100,
    Math.max(1, Math.round((currentStorageMb / activePlan.storageLimitMb) * 100))
  );

  const seatsRemaining = Math.max(0, activePlan.seatLimit - memberCount);
  const seatsPercent = Math.min(100, Math.round((memberCount / activePlan.seatLimit) * 100));

  const downloadReceipt = (record: BillingRecord) => {
    const receiptContent = `=========================================
PROJECTFLOW WORKSPACE RECEIPT
=========================================
Receipt Number: ${record.invoice_number}
Date:           ${record.date}
Activity:       ${record.action}
Plan:           ${activePlan.name} (${isAnnual ? 'Annual' : 'Monthly'})
Amount:         ${record.amount}
Status:         ${record.status}
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

  const handleConfirmPlan = async (plan: PlanTier) => {
    setProcessingCheckout(true);
    try {
      // Optional: when your Edge Function is deployed, redirect to hosted checkout:
      // const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      //   body: { planId: plan.id, billingCycle: isAnnual ? 'yearly' : 'monthly', seats: billableSeats, currency },
      // });
      // if (error) throw error;
      // if (data?.checkoutUrl) { window.location.href = data.checkoutUrl; return; }

      const totalLabel = computePlanTotalLabel(plan, billableSeats);
      const invoiceNumber = `INV-2026-${String(Math.floor(100 + Math.random() * 900))}`;

      if (user?.id) {
        const dbClient = supabase as unknown as {
          from: (rel: string) => {
            upsert: (
              row: Record<string, unknown>,
              opts: { onConflict: string }
            ) => Promise<{ error: { message?: string } | null }>;
            insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
          };
        };

        await dbClient
          .from('workspace_subscriptions')
          .upsert(
            {
              user_id: user.id,
              plan_tier: plan.id,
              billing_cycle: isAnnual ? 'yearly' : 'monthly',
              seats_purchased: plan.id === 'free' ? 5 : billableSeats,
              storage_limit_mb: plan.storageLimitMb,
              status: 'active',
            },
            { onConflict: 'user_id' }
          );

        if (plan.id !== 'free') {
          await dbClient.from('billing_invoices').insert({
            user_id: user.id,
            invoice_number: invoiceNumber,
            plan_name: `${plan.name} (${billableSeats} seats, ${isAnnual ? 'Yearly' : 'Monthly'})`,
            amount_label: totalLabel,
            status: 'PAID',
          });
        }
      }

      setActivePlanId(plan.id);
      setCheckoutPlan(null);
      setIsPlanModalOpen(false);
      await loadWorkspaceBillingData();
      toast.success(`Switched workspace to ${plan.name}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to update subscription';
      toast.error(msg);
    } finally {
      setProcessingCheckout(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-300">
      {/* 1. Main Current Plan Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-[#ECEEFF] via-white to-indigo-50/70 p-6 shadow-sm dark:border-gray-800 dark:from-[#161b2e] dark:via-[#101423] dark:to-[#0d1117] dark:shadow-xl md:p-8">
        <div className="h-1 w-full bg-gradient-to-r from-[#4B74FF] via-indigo-500 to-violet-500 absolute inset-x-0 top-0" />
        <div className="flex flex-col items-start justify-between gap-6 pt-1 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
              >
                <Sparkles size={12} />
                <span>Current Plan</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrency((c) => (c === 'USD' ? 'INR' : 'USD'))}
                className="rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-gray-700 transition-colors hover:bg-white dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200"
                title="Switch display currency"
              >
                {currency === 'USD' ? 'USD ($)' : 'INR (₹)'}
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                {activePlan.name}
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {activePlan.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-2 pt-2 text-xs font-medium text-gray-700 dark:text-gray-300 sm:grid-cols-2">
              {activePlan.features.map((feat) => (
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
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {formatUnitPrice(activePlan)}
                </span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {activePlan.id === 'free' ? '/month' : '/seat/mo'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                {activePlan.id === 'free'
                  ? 'Free Starter Tier'
                  : isAnnual
                    ? 'Billed Annually (~17-20% off)'
                    : 'Billed Monthly'}
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
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isAnnual ? theme.toggleActive : 'bg-gray-300 dark:bg-gray-700'
                  }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${isAnnual ? 'translate-x-4' : 'translate-x-0'
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
              Manage & Compare Plans
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
              <span>{activePlan.seatLimit} Max</span>
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
              <span>
                {activePlan.storageLimitMb >= 1024
                  ? `${(activePlan.storageLimitMb / 1024).toFixed(0)} GB Limit`
                  : `${activePlan.storageLimitMb} MB Limit`}
              </span>
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
                  {loadingMetrics
                    ? 'Counting...'
                    : activePlan.id === 'free'
                      ? 'Up to 5 on Free tier'
                      : 'Unlimited boards enabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
                style={{
                  width: `${activePlan.id === 'free'
                      ? Math.min(100, Math.round((projectCount / 5) * 100))
                      : 35
                    }%`,
                }}
              />
            </div>
            <div className="flex justify-between font-mono text-[11px] text-gray-500 dark:text-gray-400">
              <span>{projectCount} Repos & Boards</span>
              <span>{activePlan.id === 'free' ? '5 Free Max' : 'Unlimited'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Payment Method & Checkout Gateway Status */}
      <section className="space-y-3 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
          Payment Gateway & Billing Method
        </h4>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-xs dark:border-gray-800 dark:bg-[#0d1117] sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-8 w-11 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {activePlan.id === 'free'
                  ? 'Free plan active — no card charged'
                  : `${activePlan.name} (${billableSeats} seats)`}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                Connect Razorpay (UPI / Cards) or Stripe / Lemon Squeezy via Supabase Edge Functions for live checkout.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className={`text-left text-xs font-semibold hover:underline transition-colors sm:text-right ${theme.textAccent}`}
          >
            {activePlan.id === 'free' ? 'Upgrade Plan' : 'Change Plan / Seats'}
          </button>
        </div>
      </section>

      {/* 4. Invoices & Billing Receipts */}
      <section className="space-y-4 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-[#161b22]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Invoice & Audit Receipts
            </h4>
            <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
              Workspace billing invoices and grant records
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

      {/* --- Plan Comparison & Seat Calculator Modal --- */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-200 dark:bg-black/75">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#161b22]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/90 px-6 py-4 dark:border-gray-800 dark:bg-[#0d1117]/80">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Choose a Workspace Plan
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Transparent per-seat pricing with annual billing savings
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <span>Seats:</span>
                  <input
                    type="number"
                    min={Math.max(1, memberCount)}
                    max={250}
                    value={billableSeats}
                    onChange={(e) =>
                      setBillableSeats(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutPlan(null);
                    setIsPlanModalOpen(false);
                  }}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {checkoutPlan ? (
              <div className="space-y-5 p-6 text-xs">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0d1117]">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {checkoutPlan.name} ({isAnnual ? 'Yearly' : 'Monthly'})
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {checkoutPlan.id === 'free'
                        ? 'Starter plan — no charge'
                        : `${billableSeats} seats × ${formatUnitPrice(checkoutPlan)}/seat/mo${isAnnual ? ' × 12 months' : ''
                        }`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                      {computePlanTotalLabel(checkoutPlan, billableSeats)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {checkoutPlan.id === 'free'
                        ? 'Free'
                        : isAnnual
                          ? 'Billed once per year'
                          : 'Billed monthly'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                  <ShieldCheck size={15} className="shrink-0 text-emerald-500" />
                  <span>
                    Subscription state saves to Supabase. Wire `create-checkout-session` Edge Function to launch hosted Razorpay/Stripe checkout.
                  </span>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutPlan(null)}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={processingCheckout}
                    onClick={() => void handleConfirmPlan(checkoutPlan)}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-60 ${theme.btnPrimary}`}
                  >
                    {processingCheckout && <Loader2 size={14} className="animate-spin" />}
                    <span>
                      {processingCheckout
                        ? 'Updating...'
                        : checkoutPlan.id === 'free'
                          ? 'Activate Free Plan'
                          : `Confirm Plan (${computePlanTotalLabel(checkoutPlan, billableSeats)})`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 p-6 text-xs md:grid-cols-3">
                {PLAN_TIERS.map((plan) => {
                  const isCurrent = activePlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={`flex flex-col justify-between rounded-2xl border p-5 ${isCurrent
                          ? 'border-emerald-500/80 bg-gray-50/70 dark:bg-[#0d1117]'
                          : 'border-gray-200/90 bg-white dark:border-gray-800 dark:bg-[#0d1117]'
                        }`}
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {plan.name}
                          </span>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {isCurrent ? 'Active' : plan.badge}
                          </span>
                        </div>
                        <p className="mb-4 text-[11px] text-gray-600 dark:text-gray-400">
                          {plan.description}
                        </p>
                        <div className="mb-1 flex items-baseline gap-1">
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {formatUnitPrice(plan)}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {plan.id === 'free' ? '/mo' : '/seat/mo'}
                          </span>
                        </div>
                        <p className="mb-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                          Est. {isAnnual ? 'annual' : 'monthly'}:{' '}
                          {computePlanTotalLabel(plan, billableSeats)}
                        </p>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          {plan.features.map((feat) => (
                            <li key={feat} className="flex items-start gap-2">
                              <Check
                                size={13}
                                className={`mt-0.5 shrink-0 ${theme.textAccent}`}
                              />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setCheckoutPlan(plan)}
                        className={`mt-6 w-full rounded-xl py-2 text-xs font-bold transition-colors ${isCurrent
                            ? 'cursor-default bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                            : `text-white ${theme.btnPrimary}`
                          }`}
                      >
                        {isCurrent
                          ? 'Current Plan'
                          : plan.id === 'free'
                            ? 'Switch to Free'
                            : `Select ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}