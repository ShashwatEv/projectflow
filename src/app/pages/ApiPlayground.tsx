import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Terminal, Play, Clock, Copy, Check, Plus, 
  Trash2, Send, Loader2, GitPullRequest, GitCommit, Webhook 
} from 'lucide-react';
import { recordAuditLog } from '../../lib/auditLogger';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

const SUPER_ADMIN_EMAIL = 'shashwatop69@gmail.com';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HeaderItem {
  key: string;
  value: string;
  enabled: boolean;
}

interface ResponseState {
  status: number | null;
  statusText: string;
  timeMs: number | null;
  sizeKb: number | null;
  headers: Record<string, string>;
  data: string;
  error?: string;
}

export default function ApiPlayground() {
  const navigate = useNavigate();
  const theme = useAccentTheme();
  const { user } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
  const isVerified = Boolean(user?.is_verified || isSuperAdmin);

  // Request State
  const [method, setMethod] = useState<HttpMethod>('POST');
  const [url, setUrl] = useState<string>('https://api.github.com/repos/org/projectflow/hooks');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('body');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'X-GitHub-Event', value: 'pull_request', enabled: true },
    { key: 'X-Hub-Signature-256', value: 'sha256=d3b07384d113edec49eaa6238ad5ff00', enabled: true },
  ]);
  const [bodyContent, setBodyContent] = useState<string>(
    JSON.stringify(
      {
        action: 'closed',
        pull_request: {
          number: 42,
          title: 'feat: automated delivery pipeline (closes #task-1)',
          merged: true,
          head: { ref: 'feature/pipeline' },
          base: { ref: 'main' },
        },
        repository: { full_name: 'org/projectflow' },
        sender: { login: user?.name || 'shashwat-dev' },
      },
      null,
      2
    )
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Response State
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [selectedSnippetLang, setSelectedSnippetLang] = useState<'curl' | 'fetch' | 'python'>('curl');

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof HeaderItem, val: any) => {
    setHeaders((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  // Preset Scenario Ingestion
  const loadPreset = (type: 'github_pr' | 'github_push' | 'sample_get') => {
    if (type === 'github_pr') {
      setMethod('POST');
      setUrl('https://api.projectflow.internal/webhooks/github');
      setHeaders([
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'X-GitHub-Event', value: 'pull_request', enabled: true },
      ]);
      setBodyContent(
        JSON.stringify(
          {
            event: 'pull_request.closed',
            action: 'merged',
            pull_request: {
              number: 108,
              title: 'fix(core): resolve blocker task and sync sprint state',
              merged: true,
              merged_at: new Date().toISOString(),
            },
            commits: [
              { message: 'fix: complete sprint dependencies (resolves all open blockers)' }
            ]
          },
          null,
          2
        )
      );
      toast.info('Loaded GitHub Pull Request Merged payload preset');
    } else if (type === 'github_push') {
      setMethod('POST');
      setUrl('https://api.projectflow.internal/webhooks/github');
      setHeaders([
        { key: 'Content-Type', value: 'application/json', enabled: true },
        { key: 'X-GitHub-Event', value: 'push', enabled: true },
      ]);
      setBodyContent(
        JSON.stringify(
          {
            event: 'push',
            ref: 'refs/heads/main',
            head_commit: {
              id: 'a89c201',
              message: 'feat: production release ready for deployment',
              timestamp: new Date().toISOString(),
            },
          },
          null,
          2
        )
      );
      toast.info('Loaded GitHub Push event preset');
    } else {
      setMethod('GET');
      setUrl('https://jsonplaceholder.typicode.com/todos/1');
      setHeaders([{ key: 'Accept', value: 'application/json', enabled: true }]);
      setBodyContent('');
      toast.info('Loaded GET diagnostic preset');
    }
  };

  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      toast.error('Please specify a valid URL');
      return;
    }

    if (!isVerified && method !== 'GET') {
      toast.error('Identity Verification Required', {
        description: `Unverified accounts can only execute GET diagnostic requests. Verify your email to dispatch ${method} calls.`,
        action: {
          label: 'Verify Now',
          onClick: () => navigate('/settings'),
        },
      });
      return;
    }

    setLoading(true);
    setResponse(null);
    const startTime = performance.now();

    // 1. Simulate internal workspace webhook handling
    if (url.includes('api.projectflow.internal')) {
      await new Promise((r) => setTimeout(r, 450));
      const endTime = performance.now();

      await recordAuditLog('Executed webhook simulation dispatch', 'integrations', {
        method,
        target: url,
      });

      const simulatedResponse: ResponseState = {
        status: 200,
        statusText: 'OK',
        timeMs: Math.round(endTime - startTime),
        sizeKb: 0.85,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'x-projectflow-delivered': 'true',
        },
        data: JSON.stringify(
          {
            delivered: true,
            status: 'success',
            action: 'Automated tasks updated and audit event registered',
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
      };

      setResponse(simulatedResponse);
      toast.success('Internal webhook simulation delivered successfully!');
      setLoading(false);
      return;
    }

    // 2. Real external HTTP fetch
    try {
      const activeHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.enabled && h.key.trim()) {
          activeHeaders[h.key.trim()] = h.value;
        }
      });

      const options: RequestInit = {
        method,
        headers: activeHeaders,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyContent.trim()) {
        options.body = bodyContent;
      }

      const res = await fetch(url.trim(), options);
      const endTime = performance.now();
      const elapsedMs = Math.round(endTime - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      const textData = await res.text();
      let formatted = textData;
      try {
        formatted = JSON.stringify(JSON.parse(textData), null, 2);
      } catch {
        // Raw text fallback
      }

      const sizeKb = parseFloat((new Blob([textData]).size / 1024).toFixed(2));

      setResponse({
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        timeMs: elapsedMs,
        sizeKb,
        headers: resHeaders,
        data: formatted,
      });

      if (res.ok) {
        toast.success(`${method} ${res.status} ${res.statusText}`);
      } else {
        toast.warning(`Server responded with ${res.status}`);
      }
    } catch (err: any) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'Network Failure',
        timeMs: Math.round(endTime - startTime),
        sizeKb: 0,
        headers: {},
        data: `// Network or CORS Error: ${err.message || 'Host unreachable'}`,
        error: err.message,
      });
      toast.error('Network request failed. Check CORS constraints or endpoint validity.');
    } finally {
      setLoading(false);
    }
  };

  const generateSnippet = () => {
    const activeHeaders: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.enabled && h.key.trim()) activeHeaders[h.key.trim()] = h.value;
    });

    if (selectedSnippetLang === 'curl') {
      let code = `curl -X ${method} "${url}"`;
      Object.entries(activeHeaders).forEach(([k, v]) => {
        code += ` \\\n  -H "${k}: ${v}"`;
      });
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyContent) {
        code += ` \\\n  -d '${bodyContent.replace(/'/g, "'\\''")}'`;
      }
      return code;
    }

    if (selectedSnippetLang === 'fetch') {
      return `fetch("${url}", {
  method: "${method}",
  headers: ${JSON.stringify(activeHeaders, null, 2)},
  ${['POST', 'PUT', 'PATCH'].includes(method) ? `body: JSON.stringify(${bodyContent || '{}'})` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data));`;
    }

    if (selectedSnippetLang === 'python') {
      return `import requests

url = "${url}"
headers = ${JSON.stringify(activeHeaders, null, 2)}
${['POST', 'PUT', 'PATCH'].includes(method) ? `payload = ${bodyContent || '{}'}` : ''}

response = requests.${method.toLowerCase()}(url, headers=headers${['POST', 'PUT', 'PATCH'].includes(method) ? ', json=payload' : ''})
print(response.status_code)
print(response.json())`;
    }

    return '';
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(generateSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    toast.success('Snippet copied to clipboard!');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-gray-200 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${theme.bgSubtle} ${theme.textAccent} border ${theme.borderAccent}/30 shadow-sm`}>
              <Terminal size={22} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">API Console & Webhook Tester</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch HTTP calls, test webhook payloads, and simulate GitHub repository automation triggers.
          </p>
        </div>

        {/* Snippet Language Selector & Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadPreset('github_pr')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold transition-all"
          >
            <GitPullRequest size={13} />
            <span>PR Event</span>
          </button>
          <button
            onClick={() => loadPreset('github_push')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all"
          >
            <GitCommit size={13} />
            <span>Push Event</span>
          </button>
          <button
            onClick={() => loadPreset('sample_get')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
          >
            <Webhook size={13} />
            <span>GET Sample</span>
          </button>
        </div>
      </div>

      {/* Main Request Form */}
      <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
        {/* Method & URL Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="bg-[#0d1117] text-white font-mono font-bold text-xs border border-gray-700 rounded-2xl px-3.5 py-2.5 outline-none focus:border-indigo-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.github.com/... or internal webhook"
            className="flex-1 bg-[#0d1117] text-white font-mono text-xs border border-gray-700 rounded-2xl px-4 py-2.5 outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleSendRequest}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl ${theme.btnPrimary} text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            <span>Send</span>
          </button>
        </div>

        {/* Tabs for Headers & Body */}
        <div className="flex gap-2 border-b border-gray-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'body'
                ? 'bg-[#0d1117] text-white border border-gray-700'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Request Body (JSON)
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'headers'
                ? 'bg-[#0d1117] text-white border border-gray-700'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Headers ({headers.length})
          </button>
        </div>

        {/* Tab Body */}
        {activeTab === 'body' && (
          <div className="h-56 rounded-2xl overflow-hidden border border-gray-800 bg-[#0d1117]">
            <Editor
              height="100%"
              theme="vs-dark"
              language="json"
              value={bodyContent}
              onChange={(val) => setBodyContent(val || '')}
              options={{
                fontSize: 12,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>
        )}

        {/* Tab Headers */}
        {activeTab === 'headers' && (
          <div className="space-y-2 text-xs max-h-56 overflow-y-auto custom-scrollbar">
            {headers.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                  className="rounded border-gray-700"
                />
                <input
                  type="text"
                  placeholder="Header Name"
                  value={h.key}
                  onChange={(e) => updateHeader(i, 'key', e.target.value)}
                  className="w-1/3 bg-[#0d1117] text-white border border-gray-700 rounded-xl px-3 py-1.5 font-mono text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Header Value"
                  value={h.value}
                  onChange={(e) => updateHeader(i, 'value', e.target.value)}
                  className="flex-1 bg-[#0d1117] text-white border border-gray-700 rounded-xl px-3 py-1.5 font-mono text-xs outline-none"
                />
                <button
                  onClick={() => removeHeader(i)}
                  className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            <button
              onClick={addHeader}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs mt-2"
            >
              <Plus size={12} />
              <span>Add Header</span>
            </button>
          </div>
        )}
      </div>

      {/* Code Snippet & Live Response Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Generator */}
        <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-300">Generated Integration Snippet</span>
            <div className="flex items-center gap-2">
              <div className="flex bg-[#0d1117] rounded-xl p-0.5 border border-gray-700 text-[10px] font-mono">
                {(['curl', 'fetch', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedSnippetLang(lang)}
                    className={`px-2 py-0.5 rounded-lg capitalize ${
                      selectedSnippetLang === lang ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                onClick={copySnippet}
                className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                title="Copy snippet"
              >
                {copiedSnippet ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <pre className="flex-1 bg-[#0d1117] p-3.5 rounded-2xl border border-gray-800 font-mono text-[11px] text-gray-300 overflow-x-auto custom-scrollbar">
            {generateSnippet()}
          </pre>
        </div>

        {/* Live Response Output */}
        <div className="bg-[#161b22] border border-gray-800 rounded-3xl p-5 shadow-xl space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-300">HTTP Response Body</span>
            {response && (
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className={`font-bold px-2 py-0.5 rounded-lg ${
                  response.status && response.status < 300 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {response.status} {response.statusText}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {response.timeMs}ms
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[160px] bg-[#0d1117] rounded-2xl border border-gray-800 overflow-hidden">
            {response ? (
              <pre className="p-3.5 font-mono text-[11px] text-gray-300 overflow-x-auto custom-scrollbar max-h-72">
                {response.data}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 space-y-2">
                <Send size={24} className="opacity-40" />
                <p className="text-xs">Send a request to inspect latency, headers, and payload results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}