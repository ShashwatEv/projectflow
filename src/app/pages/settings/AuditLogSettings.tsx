import { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, Filter, Search, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAccentTheme } from '../../../lib/useAccentTheme';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  created_at: string;
  details: any;
  users?: { name?: string; email?: string };
}

export default function AuditLogSettings() {
  const theme = useAccentTheme();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('audit_logs')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false })
        .limit(40);

      setLogs((data as AuditLog[]) || []);
      setLoading(false);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Audit Trail</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cryptographic ledger tracking authentication, permission shifts, and security actions.
          </p>
        </div>

        <input
          type="text"
          placeholder="Filter logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent}`}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={24} className={`animate-spin ${theme.textAccent}`} />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-400 bg-gray-50 dark:bg-[#0d1117] rounded-2xl border border-gray-200 dark:border-gray-800">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {log.category}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white font-sans text-xs">
                  {log.action}
                </span>
                <span className="text-[11px] text-gray-400 font-sans">
                  by {log.users?.name || log.users?.email || 'System'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <Clock size={12} />
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}