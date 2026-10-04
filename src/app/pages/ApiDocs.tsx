import { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Search, Copy, Check, Terminal, 
  ExternalLink, Code2, Layers, Loader2, X, Trash2, Database 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface ApiEndpoint {
  id: string;
  project_id?: string;
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  category: string;
  status_code: number;
  headers: any[];
  request_body: any;
  response_body: any;
}

export default function ApiDocs() {
  const theme = useAccentTheme();
  const { user } = useAuth();

  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Endpoint Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formMethod, setFormMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [formPath, setFormPath] = useState('');
  const [formCategory, setFormCategory] = useState('Core Services');
  const [formDescription, setFormDescription] = useState('');
  const [formStatusCode, setFormStatusCode] = useState(200);
  const [formReqBody, setFormReqBody] = useState('{}');
  const [formResBody, setFormResBody] = useState('{\n  "success": true\n}');
  const [submitting, setSubmitting] = useState(false);

  const fetchEndpoints = async () => {
    try {
      const { data, error } = await supabase
        .from('api_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEndpoints(data as ApiEndpoint[]);
      }
    } catch (err) {
      console.error('Error fetching API docs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();

    const channel = supabase
      .channel('api_docs_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'api_endpoints' }, () => {
        fetchEndpoints();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let parsedReq = {};
      let parsedRes = {};
      try {
        parsedReq = JSON.parse(formReqBody);
      } catch {
        // Fallback to empty object
      }
      try {
        parsedRes = JSON.parse(formResBody);
      } catch {
        parsedRes = { message: 'Invalid JSON payload' };
      }

      const { error } = await supabase.from('api_endpoints').insert({
        title: formTitle.trim(),
        method: formMethod,
        path: formPath.trim(),
        category: formCategory.trim(),
        description: formDescription.trim(),
        status_code: Number(formStatusCode),
        request_body: parsedReq,
        response_body: parsedRes,
      });

      if (error) throw error;

      toast.success('API schema cataloged successfully!');
      setIsModalOpen(false);
      setFormTitle('');
      setFormPath('');
      setFormDescription('');
      fetchEndpoints();
    } catch (err: any) {
      toast.error(err.message || 'Failed to catalog endpoint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    try {
      const { error } = await supabase.from('api_endpoints').delete().eq('id', id);
      if (error) throw error;
      setEndpoints((prev) => prev.filter((item) => item.id !== id));
      toast.success('Endpoint removed from catalog');
    } catch {
      toast.error('Failed to remove endpoint');
    }
  };

  const copyCurl = (ep: ApiEndpoint) => {
    const curlCommand = `curl -X ${ep.method} "https://api.projectflow.internal${ep.path}" \\
  -H "Content-Type: application/json"${ep.method !== 'GET' ? ` \\\n  -d '${JSON.stringify(ep.request_body)}'` : ''}`;

    navigator.clipboard.writeText(curlCommand);
    setCopiedId(ep.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('cURL command copied!');
  };

  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    POST: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    PUT: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    PATCH: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    DELETE: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
  };

  const categories = ['ALL', ...Array.from(new Set(endpoints.map((e) => e.category || 'General')))];

  const filtered = endpoints.filter((ep) => {
    const matchesSearch = 
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = selectedMethod === 'ALL' || ep.method === selectedMethod;
    const matchesCategory = selectedCategory === 'ALL' || ep.category === selectedCategory;
    return matchesSearch && matchesMethod && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-2xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                API Docs & Schema Catalog
              </h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect workspace schemas, payloads, and contract definitions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95`}
        >
          <Plus size={16} />
          <span>Catalog Endpoint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <div className="md:col-span-6 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search endpoints by title or path (/api/v1/...)"
            className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none font-bold"
          >
            <option value="ALL">All HTTP Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Endpoints List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-3">
          <Loader2 className={`animate-spin ${theme.textAccent}`} size={32} />
          <p className="text-xs text-gray-400">Loading API schemas from Supabase...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#161b22] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <Terminal size={36} className="mx-auto text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No endpoints found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Click "Catalog Endpoint" above to publish your first endpoint documentation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ep) => (
            <div
              key={ep.id}
              className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4 group"
            >
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-extrabold border ${methodColors[ep.method] || methodColors.GET}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                    {ep.path}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                    {ep.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCurl(ep)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#0d1117] dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-[11px] font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {copiedId === ep.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>cURL</span>
                  </button>

                  <button
                    onClick={() => handleDeleteEndpoint(ep.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                    title="Remove endpoint"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                {ep.description || 'No description provided for this endpoint contract.'}
              </p>

              {/* Request & Response JSON Viewers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                {/* Request Payload */}
                <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Code2 size={12} className={theme.textAccent} /> Request Schema Body
                  </span>
                  <pre className="text-[11px] font-mono text-gray-700 dark:text-gray-300 overflow-x-auto p-2 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 custom-scrollbar max-h-40">
                    {JSON.stringify(ep.request_body, null, 2)}
                  </pre>
                </div>

                {/* Response Payload */}
                <div className="bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Database size={12} className="text-emerald-500" /> Response Expected ({ep.status_code})
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">200 OK</span>
                  </div>
                  <pre className="text-[11px] font-mono text-gray-700 dark:text-gray-300 overflow-x-auto p-2 bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 custom-scrollbar max-h-40">
                    {JSON.stringify(ep.response_body, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Catalog New Endpoint */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Catalog API Endpoint</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateEndpoint} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Method *</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono font-bold"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-gray-400 font-semibold mb-1">Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="/api/v1/auth/verify"
                    value={formPath}
                    onChange={(e) => setFormPath(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Endpoint Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify User OTP Signature"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Auth, Tasks, Webhooks"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explains what this endpoint performs..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Request JSON</label>
                  <textarea
                    rows={3}
                    value={formReqBody}
                    onChange={(e) => setFormReqBody(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-2 font-mono text-[11px] text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 font-semibold mb-1">Response JSON</label>
                  <textarea
                    rows={3}
                    value={formResBody}
                    onChange={(e) => setFormResBody(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-gray-800 rounded-xl p-2 font-mono text-[11px] text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl ${theme.btnPrimary} font-bold text-white transition-all`}
                >
                  {submitting ? 'Saving...' : 'Publish Schema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}