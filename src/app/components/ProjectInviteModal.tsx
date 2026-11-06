import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Loader2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { isSuperAdmin } from '../../lib/constants';

interface ProjectOption {
  id: string;
  name: string;
  owner_id: string | null;
}

interface ProjectInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: () => void;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function createInviteCode() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(8));
  let bitBuffer = 0;
  let bitsAvailable = 0;
  let code = '';

  for (const byte of randomBytes) {
    bitBuffer = (bitBuffer << 8) | byte;
    bitsAvailable += 8;
    while (bitsAvailable >= 5 && code.length < 12) {
      bitsAvailable -= 5;
      code += CODE_ALPHABET[(bitBuffer >>> bitsAvailable) & 31];
    }
  }

  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
}

async function hashInviteCode(code: string) {
  const normalizedCode = code.replace(/-/g, '').toUpperCase();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizedCode)
  );
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default function ProjectInviteModal({
  isOpen,
  onClose,
  onAccessGranted,
}: ProjectInviteModalProps) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const [mode, setMode] = useState<'create' | 'redeem'>('create');
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = isSuperAdmin(user?.email, user?.role);
  const selectedProject = useMemo(
    () => projects.find((project) => project.id === projectId),
    [projectId, projects]
  );

  useEffect(() => {
    if (!isOpen || !currentUserId) return;
    let active = true;

    async function loadProjects() {
      setLoadingProjects(true);
      try {
        const [{ data: projectRows, error: projectsError }, { data: memberships, error: membersError }] =
          await Promise.all([
            supabase.from('projects').select('id, name, owner_id').order('name'),
            supabase.from('project_members').select('project_id, role').eq('user_id', currentUserId),
          ]);

        if (projectsError) throw projectsError;
        if (membersError) throw membersError;
        if (!active) return;

        const editableProjectIds = new Set(
          (memberships || [])
            .filter((membership: { project_id: string; role: string }) =>
              ['owner', 'editor'].includes(membership.role.toLowerCase())
            )
            .map((membership: { project_id: string }) => membership.project_id)
        );
        const editableProjects = ((projectRows || []) as ProjectOption[]).filter(
          (project) => isAdmin || project.owner_id === currentUserId || editableProjectIds.has(project.id)
        );

        setProjects(editableProjects);
        setProjectId((current) =>
          editableProjects.some((project) => project.id === current)
            ? current
            : editableProjects[0]?.id || ''
        );
      } catch (error) {
        console.error('Could not load projects for invites:', error);
        toast.error('Could not load projects you can invite people to.');
      } finally {
        if (active) setLoadingProjects(false);
      }
    }

    void loadProjects();
    return () => {
      active = false;
    };
  }, [currentUserId, isAdmin, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setMode('create');
    setInviteCode('');
    setRedeemCode('');
    setExpiresAt(null);
    setCopied(false);
    onClose();
  };

  const handleCreateInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !user) return;

    setSubmitting(true);
    try {
      const code = createInviteCode();
      const codeHash = await hashInviteCode(code);
      const { data, error } = await supabase.rpc('create_project_invite_code', {
        p_project_id: projectId,
        p_code_hash: codeHash,
      });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      setInviteCode(code);
      setExpiresAt(result?.expires_at || null);
      toast.success(`Viewer invite created for ${result?.project_name || selectedProject?.name || 'project'}.`);
    } catch (error) {
      console.error('Could not create project invite:', error);
      toast.error(error instanceof Error ? error.message : 'Could not create invite code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeemInvite = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const codeHash = await hashInviteCode(redeemCode.trim());
      const { data, error } = await supabase.rpc('redeem_project_invite_code', {
        p_code_hash: codeHash,
      });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;
      toast.success(`You now have Viewer access to ${result?.project_name || 'the project'}.`);
      setRedeemCode('');
      onAccessGranted();
      handleClose();
    } catch (error) {
      console.error('Could not redeem project invite:', error);
      toast.error(error instanceof Error ? error.message : 'Invite code is invalid, expired, or already used.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied.');
    } catch (error) {
      console.error('Could not copy project invite code:', error);
      toast.error('Could not copy the code. Select and copy it manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-invite-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      >
        <header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-500" />
            <h2 id="project-invite-title" className="text-lg font-bold text-gray-900 dark:text-white">
              Project access
            </h2>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <X size={20} />
          </button>
        </header>

        <div className="grid grid-cols-2 gap-2 px-6 pt-5">
          <button
            type="button"
            onClick={() => setMode('create')}
            aria-pressed={mode === 'create'}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'create' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'}`}
          >
            Create invite code
          </button>
          <button
            type="button"
            onClick={() => setMode('redeem')}
            aria-pressed={mode === 'redeem'}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === 'redeem' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200'}`}
          >
            Enter invite code
          </button>
        </div>

        {mode === 'create' ? (
          <form onSubmit={handleCreateInvite} className="space-y-5 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create a single-use code for an existing ProjectFlow user. It grants Viewer access and expires after 7 days.
            </p>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</span>
              <select
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  setInviteCode('');
                  setExpiresAt(null);
                }}
                required
                disabled={loadingProjects || !projects.length}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {loadingProjects && <option value="">Loading projects…</option>}
                {!loadingProjects && !projects.length && <option value="">No projects you can invite to</option>}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </label>

            {inviteCode && (
              <div className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  Share this code with the existing user. It can only be used once.
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={inviteCode}
                    aria-label="Generated project invite code"
                    className="min-w-0 flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-center font-mono text-lg font-bold tracking-widest text-gray-900 dark:border-emerald-800 dark:bg-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void copyInviteCode()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                {expiresAt && (
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Expires {new Date(expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loadingProjects || !projectId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {inviteCode ? 'Generate another code' : 'Generate invite code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRedeemInvite} className="space-y-5 p-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Paste a code shared by a project teammate. You must be signed in to the account that should receive access.
            </p>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Invite code</span>
              <input
                autoFocus
                required
                minLength={14}
                maxLength={14}
                value={redeemCode}
                onChange={(event) => setRedeemCode(event.target.value.toUpperCase())}
                placeholder="ABCD-EFGH-JKLM"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-gray-900 outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || redeemCode.replace(/-/g, '').length !== 12}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Redeem code
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
