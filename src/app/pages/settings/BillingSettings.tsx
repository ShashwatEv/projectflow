import { useState } from 'react';
import { 
  CreditCard, CheckCircle2, Download, Zap, AlertCircle, 
  Loader2, Shield, Users, HardDrive 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function BillingSettings() {
  const { user } = useAuth();
  
  // --- State for Interactivity ---
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  
  // Mock Data mimicking a real app state
  const currentPlan = {
    name: "Pro Team",
    price: billingCycle === 'monthly' ? 29 : 290,
    interval: billingCycle === 'monthly' ? '/mo' : '/yr',
    nextBilling: billingCycle === 'monthly' ? 'Feb 12, 2026' : 'Jan 12, 2027',
    features: ['Unlimited Projects', '5 Team Members', '1TB Storage', 'Priority Support']
  };

  // --- Handlers ---
  const handleDownloadInvoice = (id: string) => {
    // Simulate a download delay
    const btn = document.getElementById(`btn-${id}`);
    if(btn) btn.innerHTML = '...';
    
    setTimeout(() => {
        alert(`Downloading Invoice ${id} for ${user?.name || 'User'}...`);
        if(btn) btn.innerHTML = ''; // Reset (in a real app, you'd use state)
    }, 800);
  };

  const handleUpdatePlan = () => {
    setIsUpdating(true);
    setTimeout(() => {
        setIsUpdating(false);
        alert('Plan updated successfully!');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your plan, payment details, and invoices.</p>
      </div>

      {/* --- PLAN CARD --- */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-1 shadow-xl overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                
                {/* Plan Info */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            Current Plan
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                                Year Applied (-20%)
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{currentPlan.name}</h2>
                    <p className="text-indigo-200 text-sm mb-6">Renews on {currentPlan.nextBilling}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {currentPlan.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle2 size={16} className="text-emerald-400" /> {feat}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing & Actions */}
                <div className="bg-white/5 rounded-xl p-6 min-w-[200px] border border-white/10 text-center">
                    <p className="text-3xl font-bold">${currentPlan.price}<span className="text-sm text-gray-400 font-normal">{currentPlan.interval}</span></p>
                    
                    {/* Toggle Cycle */}
                    <div className="flex items-center justify-center gap-3 my-4 text-xs font-medium">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}
                        >Monthly</button>
                        <div className="w-8 h-4 bg-gray-700 rounded-full relative cursor-pointer" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${billingCycle === 'yearly' ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                        <button 
                             onClick={() => setBillingCycle('yearly')}
                             className={`transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}
                        >Yearly</button>
                    </div>

                    <button 
                        onClick={handleUpdatePlan}
                        disabled={isUpdating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Change Plan'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- USAGE STATS (The "Relatable" Part) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Users size={20} /></div>
                 <div>
                     <h4 className="font-bold text-gray-900 dark:text-white">Seats Used</h4>
                     <p className="text-xs text-gray-500">You have 1 seat remaining.</p>
                 </div>
             </div>
             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
             </div>
             <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                 <span>4 Users</span>
                 <span>5 Limit</span>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><HardDrive size={20} /></div>
                 <div>
                     <h4 className="font-bold text-gray-900 dark:text-white">Storage</h4>
                     <p className="text-xs text-gray-500">Plenty of space left.</p>
                 </div>
             </div>
             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
             </div>
             <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                 <span>450 GB</span>
                 <span>1 TB</span>
             </div>
          </div>
      </div>

      {/* --- PAYMENT METHOD --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        
        {!showCardForm ? (
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-16 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                        <CreditCard size={24} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/2028</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCardForm(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                    Edit
                </button>
            </div>
        ) : (
            <form className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                        <input type="text" placeholder="123" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCardForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                    <button type="button" onClick={() => { setShowCardForm(false); alert('Card updated!'); }} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Card</button>
                </div>
            </form>
        )}
      </div>

      {/* --- INVOICES --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoice History</h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Download All</button>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                <th className="pb-3 font-medium pl-2">Invoice</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium text-right">Status</th>
                <th className="pb-3 font-medium"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[1, 2, 3].map((i) => (
                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 pl-2 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <FileTextIcon /> INV-2024-00{i}
                        </div>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">Jan {12 - i}, 2026</td>
                    <td className="py-3 text-gray-900 dark:text-white font-mono">$29.00</td>
                    <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            Paid
                        </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                    <button 
                        id={`btn-INV-00${i}`}
                        onClick={() => handleDownloadInvoice(`INV-00${i}`)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all" 
                        title="Download PDF"
                    >
                        <Download size={16} />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
    )
}