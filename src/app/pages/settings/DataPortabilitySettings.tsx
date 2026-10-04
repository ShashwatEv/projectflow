import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Upload, Database, CheckCircle2, 
  Loader2, Lock, ShieldAlert, ArrowRight 
} from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { recordAuditLog } from '../../../lib/auditLogger';
import { useAccentTheme } from '../../../lib/useAccentTheme';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

// Allowed technical roles for code/data migration
const ALLOWED_MIGRATION_ROLES = ['Admin', 'Developer', 'Tech Lead', 'Engineer', 'Manager'];

export default function DataPortabilitySettings() {
  const theme = useAccentTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ count: number; project: string } | null>(null);

  // Authorization Gates
  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase();
  const isVerified = Boolean(user?.is_verified || user?.email_verified || isSuperAdmin);
  const hasAllowedRole = isSuperAdmin || ALLOWED_MIGRATION_ROLES.some(
    (role) => role.toLowerCase() === (user?.role || '').toLowerCase()
  );

  const canAccess = isSuperAdmin || (isVerified && hasAllowedRole);

  // If user lacks permissions or is unverified (and not the Root Admin)
  if (!canAccess) {
    return (
      <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-2xl mx-auto text-center space-y-4 animate-in fade-in">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <Lock size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Data Portability Restricted
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
            Workspace data export and ticket batch ingestion require a verified account with an authorized engineering role ({ALLOWED_MIGRATION_ROLES.join(', ')}).
          </p>
        </div>

        {!isVerified && (
          <div className="pt-2">
            <button
              onClick={() => {
                const verificationTab = document.getElementById('tab-verification');
                if (verificationTab) verificationTab.click();
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
            >
              <ShieldAlert size={15} />
              <span>Verify Your Account Now</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 1. Export entire workspace to JSON
  const handleExportWorkspace = async () => {
    setExporting(true);
    try {
      const [projectsRes, tasksRes, timesheetsRes, auditRes] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('tasks').select('*'),
        supabase.from('timesheets').select('*'),
        supabase.from('audit_logs').select('*').limit(200),
      ]);

      const exportPayload = {
        meta: {
          workspace: 'ProjectFlow Enterprise',
          exportedAt: new Date().toISOString(),
          version: '2.0.0',
          exportedBy: isSuperAdmin ? 'Root Owner' : user?.email,
        },
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        timesheets: timesheetsRes.data || [],
        auditLogs: auditRes.data || [],
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `projectflow_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      await recordAuditLog('Workspace data snapshot exported', 'security', {
        projectsCount: exportPayload.projects.length,
        tasksCount: exportPayload.tasks.length,
      });

      toast.success('Workspace snapshot exported successfully!');
    } catch {
      toast.error('Failed to export workspace data');
    } finally {
      setExporting(false);
    }
  };

  // 2. Import tasks from JSON or CSV
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const rawContent = evt.target?.result as string;
        let tasksToInsert: any[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(rawContent);
          const rawTasks = Array.isArray(parsed) ? parsed : parsed.tasks || [];
          tasksToInsert = rawTasks.map((t: any) => ({
            title: t.title || t.name || 'Imported Task',
            description: t.description || 'Imported from external backup',
            priority: (t.priority?.toLowerCase() || 'medium'),
            status: (t.status || 'todo'),
          }));
        } else if (file.name.endsWith('.csv')) {
          const lines = rawContent.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length > 0 && lines[0]) {
            const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
            const titleIdx = header.indexOf('title') !== -1 ? header.indexOf('title') : 0;
            const descIdx = header.indexOf('description');

            for (let i = 1; i < lines.length; i++) {
              const currentLine = lines[i];
              if (!currentLine) continue;

              const cols = currentLine.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
              const titleVal = cols[titleIdx];

              if (titleVal) {
                const descVal = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : 'Imported via CSV batch';
                tasksToInsert.push({
                  title: titleVal,
                  description: descVal,
                  priority: 'medium',
                  status: 'todo',
                });
              }
            }
          }
        }

        if (tasksToInsert.length === 0) {
          toast.warning('No valid tasks identified in file');
          setImporting(false);
          return;
        }

        const { data: authData } = await supabase.auth.getUser();
        const stampedTasks = tasksToInsert.map((t) => ({
          ...t,
          assigned_to: authData?.user?.id || null,
        }));

        const { error } = await supabase.from('tasks').insert(stampedTasks);
        if (error) throw error;

        await recordAuditLog(`Imported ${stampedTasks.length} tasks from ${file.name}`, 'tasks');
        setImportSummary({ count: stampedTasks.length, project: file.name });
        toast.success(`Successfully imported ${stampedTasks.length} tasks!`);
      } catch (err: any) {
        toast.error(err.message || 'Error parsing imported file');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-2 text-indigo-500">
          <Database size={22} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Data Portability</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Export full backups of your agile boards, sprint timesheets, and audit records, or import tasks from Jira, Linear, and GitHub.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Download size={20} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Export Workspace Backup</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Downloads a complete JSON package including your projects, Kanban task states, timesheets, and audit trails.
            </p>
          </div>

          <button
            type="button"
            disabled={exporting}
            onClick={handleExportWorkspace}
            className={`w-full py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50`}
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>{exporting ? 'Generating JSON...' : 'Export Backup (.json)'}</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Upload size={20} />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Import Tasks & Backups</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Upload tasks directly into your board from Jira/GitHub issue CSV files or previous ProjectFlow JSON dumps.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,.csv"
            className="hidden"
          />

          <button
            type="button"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-2xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            <span>{importing ? 'Processing File...' : 'Upload JSON or CSV'}</span>
          </button>
        </div>
      </div>

      {importSummary && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-xs">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>
            Successfully imported <strong>{importSummary.count}</strong> tickets from <code>{importSummary.project}</code> directly to your board.
          </span>
        </div>
      )}
    </div>
  );
}