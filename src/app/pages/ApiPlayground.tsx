import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Terminal, Play, Clock, Database, Copy, Check, Plus, 
  Trash2, RefreshCw, Send, Lock, ShieldAlert 
} from 'lucide-react';
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
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/todos/1');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('headers');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true },
  ]);
  const [bodyContent, setBodyContent] = useState<string>('{\n  "title": "New Task via ProjectFlow",\n  "completed": false\n}');
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

  // Dispatch API Request with verification gate check on mutating HTTP verbs
  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) {
      toast.error('Please specify a valid URL');
      return;
    }

    // Security Gate: Disallow outbound mutating methods for unverified users
    if (!isVerified && method !== 'GET') {
      toast.error('Identity Verification Required', {
        description: `Unverified accounts can only execute GET requests. Verify your email to send ${method} requests and custom payloads.`,
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
        // Plain text response fallback
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
        statusText: 'Failed to fetch',
        timeMs: Math.round(endTime - startTime),
        sizeKb: 0,
        headers: {},
        data: `// Client Error: ${err.message || 'CORS restriction or network unreachable'}`,
        error: err.message,
      });
      toast.error('Network request failed. Verify CORS policies or URL accessibility.');
    } finally {
      setLoading(false);
    }
  };

  // Generate Snippets
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
            Dispatch HTTP requests, inspect headers, evaluate roundtrip latency, and simulate outbound webhooks.
          </p>
        </div>

        {/* Snippet Language Selectors */}
        <div className="flex items-center gap-2 bg-[#161b22] border border-gray-800 rounded-xl p-1">
          {(['curl', 'fetch', 'python'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedSnippetLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                selectedSnippetLang === lang
                  ? `${theme.btnPrimary} shadow-sm`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
          <button
            onClick={copySnippet}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white ml-1 transition-colors"
            title="Copy Snippet"
          >
            {copiedSnippet ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Main Request Dispatcher Bar */}
      <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row items-stretch gap-2.5">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as HttpMethod)}
          className={`bg-[#161b22] border border-gray-800 font-bold rounded-2xl px-4 py-3 text-xs outline-none cursor-pointer tracking-wider ${
            method === 'GET'
              ? 'text-emerald-400'
              : method === 'POST'
              ? 'text-blue-400'
              : method === 'DELETE'
              ? 'text-rose-400'
              : 'text-amber-400'
          }`}
        >
          <option value="GET" className="bg-[#161b22] text-white">GET</option>
          <option value="POST" className="bg-[#161b22] text-white">POST {!isVerified ? '🔒' : ''}</option>
          <option value="PUT" className="bg-[#161b22] text-white">PUT {!isVerified ? '🔒' : ''}</option>
          <option value="PATCH" className="bg-[#161b22] text-white">PATCH {!isVerified ? '🔒' : ''}</option>
          <option value="DELETE" className="bg-[#161b22] text-white">DELETE {!isVerified ? '🔒' : ''}</option>
        </select>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://api.example.com/v1/resource"
          className={`flex-1 bg-[#161b22] border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white font-mono outline-none ${theme.ringAccent} transition-colors`}
        />

        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-7 py-3 rounded-2xl ${theme.btnPrimary} font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50`}
        >
          {loading ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : !isVerified && method !== 'GET' ? (
            <Lock size={15} />
          ) : (
            <Send size={15} />
          )}
          <span>Send</span>
        </button>
      </form>

      {/* Unverified Method Notice */}
      {!isVerified && method !== 'GET' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs text-amber-400">
          <div className="flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>Mutating HTTP method selected. Outbound write requests require verified email credentials.</span>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="underline font-bold hover:text-amber-300 ml-2 shrink-0"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Request Config Tabs */}
        <div className="lg:col-span-6 bg-[#161b22] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'headers' ? `${theme.bgSubtle}${theme.textAccent}` : 'text-gray-400 hover:text-white'
              }`}
            >
              Headers ({headers.filter((h) => h.enabled).length})
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'body' ? `${theme.bgSubtle}${theme.textAccent}` : 'text-gray-400 hover:text-white'
              }`}
            >
              Body JSON
            </button>
          </div>

          {/* Headers Editor Tab */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                      className={`rounded ${theme.toggleActive} bg-[#0d1117] border-gray-700`}
                    />
                    <input
                      type="text"
                      placeholder="Header Key"
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                      className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                      className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeader(i)}
                      className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addHeader}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white pt-1"
              >
                <Plus size={13} className={theme.textAccent} />
                <span>Add Header</span>
              </button>
            </div>
          )}

          {/* Body JSON Tab */}
          {activeTab === 'body' && (
            <div className="h-72 rounded-2xl overflow-hidden border border-gray-800">
              <Editor
                height="100%"
                theme="vs-dark"
                language="json"
                value={bodyContent}
                onChange={(val) => setBodyContent(val || '')}
                options={{
                  fontSize: 12,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          )}
        </div>

        {/* Right Side: Response Telemetry & Data */}
        <div className="lg:col-span-6 bg-[#161b22] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Response</h3>
            
            {response && (
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className={`px-2 py-0.5 rounded-md font-bold ${
                  response.status && response.status >= 200 && response.status < 300
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'
                    : 'bg-rose-950/50 text-rose-400 border border-rose-800/60'
                }`}>
                  {response.status} {response.statusText}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {response.timeMs}ms
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Database size={12} /> {response.sizeKb}KB
                </span>
              </div>
            )}
          </div>

          <div className="h-72 rounded-2xl overflow-hidden border border-gray-800 bg-[#0d1117]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <RefreshCw size={24} className={`animate-spin ${theme.textAccent}`} />
                <p className="text-xs">Dispatching request...</p>
              </div>
            ) : response ? (
              <Editor
                height="100%"
                theme="vs-dark"
                language="json"
                value={response.data}
                options={{
                  readOnly: true,
                  fontSize: 12,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 p-6 text-center">
                <Terminal size={32} className="text-gray-600" />
                <p className="text-xs">Send a request to inspect response body, status headers, and roundtrip telemetry.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}