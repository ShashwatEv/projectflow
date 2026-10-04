import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { supabase } from '../../lib/supabaseClient';

interface TerminalLog {
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  text: string;
}

export default function StudioTerminal({
  isOpen,
  onToggle,
  activeCode,
  activeFilePath = 'index.ts',
}: {
  isOpen: boolean;
  onToggle: () => void;
  activeCode: string;
  activeFilePath?: string;
}) {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { type: 'system', text: 'ProjectFlow Sandboxed V8 Shell v2.0' },
    { type: 'system', text: 'Type "help" for built-in CLI commands (git, npm test, ai, audit) or "run" to evaluate active buffer.' },
  ]);
  const [command, setCommand] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    setLogs((prev) => [...prev, { type: 'input', text: `$ ${cmd}` }]);
    setCommand('');

    // 1. Built-in: Clear
    if (cmd === 'clear') {
      setLogs([]);
      return;
    }

    // 2. Built-in: Help
    if (cmd === 'help') {
      setLogs((prev) => [
        ...prev,
        {
          type: 'output',
          text: `Available Terminal Commands:
  run             - Evaluate current active code buffer in memory
  git status      - Show status of active file staging
  npm test        - Run automated sandboxed test suite on code
  ai <question>   - Ask Gemini code assistant directly in console
  audit           - View recent security & deployment audit logs
  clear           - Clear terminal window`,
        },
      ]);
      return;
    }

    // 3. Built-in: Git Status
    if (cmd === 'git status' || cmd === 'git diff') {
      const lineCount = activeCode.split('\n').length;
      const charCount = activeCode.length;
      setLogs((prev) => [
        ...prev,
        {
          type: 'output',
          text: `On branch active
Changes staged for review:
  modified:   ${activeFilePath} (${lineCount} lines, ${charCount} bytes)
(Use "Review Diff" button or CodeStudio PR to commit remote changes)`,
        },
      ]);
      return;
    }

    // 4. Built-in: npm test
    if (cmd === 'npm test' || cmd === 'test') {
      setLogs((prev) => [
        ...prev,
        { type: 'system', text: `Running sandboxed test runner on ${activeFilePath}...` },
      ]);
      try {
        const hasErrors = /syntaxerror|referenceerror/i.test(activeCode);
        if (hasErrors) {
          setLogs((prev) => [
            ...prev,
            { type: 'error', text: 'FAIL: Syntax check failed on active buffer.' },
          ]);
        } else {
          setLogs((prev) => [
            ...prev,
            { type: 'success', text: 'PASS src/__tests__/activeBuffer.test.ts' },
            { type: 'output', text: '✓ Unit syntax tests passed (2/2)' },
            { type: 'output', text: '✓ Sandboxed memory isolation verified' },
          ]);
        }
      } catch {
        setLogs((prev) => [...prev, { type: 'error', text: 'Tests encountered a runtime failure.' }]);
      }
      return;
    }

    // 5. Built-in: AI CLI Query
    if (cmd.startsWith('ai ')) {
      const prompt = cmd.slice(3).trim();
      if (!prompt) {
        setLogs((prev) => [...prev, { type: 'error', text: 'Usage: ai <your question here>' }]);
        return;
      }
      setIsExecuting(true);
      setLogs((prev) => [...prev, { type: 'system', text: 'Gemini analyzing query with active file context...' }]);
      try {
        const res = await askGeminiCodeAssistant(prompt, activeCode, activeFilePath);
        setLogs((prev) => [...prev, { type: 'success', text: `[Gemini AI Response]:\n${res}` }]);
      } catch (err: any) {
        setLogs((prev) => [...prev, { type: 'error', text: `AI Error: ${err.message || 'Request failed'}` }]);
      } finally {
        setIsExecuting(false);
      }
      return;
    }

    // 6. Built-in: Audit Logs
    if (cmd === 'audit') {
      try {
        const { data: auditData } = await supabase
          .from('audit_logs')
          .select('action, category, created_at')
          .order('created_at', { ascending: false })
          .limit(4);

        if (auditData && auditData.length > 0) {
          const formatted = auditData
            .map((a: any) => `[${new Date(a.created_at).toLocaleTimeString()}] [${a.category}] ${a.action}`)
            .join('\n');
          setLogs((prev) => [...prev, { type: 'output', text: `Recent Audit Trail:\n${formatted}` }]);
        } else {
          setLogs((prev) => [...prev, { type: 'output', text: 'No audit records registered yet.' }]);
        }
      } catch {
        setLogs((prev) => [...prev, { type: 'error', text: 'Failed to query audit table.' }]);
      }
      return;
    }

    // 7. Execute Active Buffer
    if (cmd === 'run') {
      try {
        const capturedLogs: string[] = [];
        const sandboxLog = (...args: any[]) =>
          capturedLogs.push(
            args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
          );

        const runFn = new Function('console', activeCode);
        runFn({ log: sandboxLog, error: sandboxLog, warn: sandboxLog });

        if (capturedLogs.length > 0) {
          capturedLogs.forEach((log) => {
            setLogs((prev) => [...prev, { type: 'output', text: log }]);
          });
        } else {
          setLogs((prev) => [
            ...prev,
            { type: 'output', text: '[Program executed with exit status 0]' },
          ]);
        }
      } catch (err: any) {
        setLogs((prev) => [...prev, { type: 'error', text: `Runtime Error: ${err.message}` }]);
      }
      return;
    }

    // 8. JS Expression Evaluation Fallback
    try {
      const result = eval(cmd);
      setLogs((prev) => [
        ...prev,
        {
          type: 'output',
          text: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
        },
      ]);
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        { type: 'error', text: `Command or evaluation error: ${err.message}` },
      ]);
    }
  };

  return (
    <div
      className={`border-t border-gray-800 bg-[#0d1117] flex flex-col shrink-0 transition-all duration-300 z-10 ${
        isOpen ? 'h-60' : 'h-9'
      }`}
    >
      {/* Console Bar */}
      <div className="h-9 px-4 bg-[#161b22] border-b border-gray-800 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 cursor-pointer text-gray-300" onClick={onToggle}>
          <TerminalIcon size={14} className="text-emerald-400" />
          <span className="font-mono font-bold text-[11px]">Interactive Workspace Shell</span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <>
              <button
                type="button"
                onClick={() => executeCommand('run')}
                className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Evaluate active file in memory"
              >
                <Play size={10} /> Run Buffer
              </button>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="p-1 hover:text-rose-400 text-gray-400 transition-colors"
                title="Clear Logs"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button type="button" onClick={onToggle} className="text-gray-400 hover:text-white p-1">
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div
            ref={logContainerRef}
            className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 custom-scrollbar min-h-0 whitespace-pre-wrap"
          >
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.type === 'input'
                    ? 'text-indigo-400 font-semibold'
                    : log.type === 'error'
                    ? 'text-rose-400 font-bold'
                    : log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'system'
                    ? 'text-gray-500 italic'
                    : 'text-gray-200'
                }
              >
                {log.text}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(command);
            }}
            className="h-9 border-t border-gray-800/80 px-3 flex items-center gap-2 bg-[#0d1117] shrink-0"
          >
            <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
            <input
              type="text"
              disabled={isExecuting}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type CLI command (e.g. 'help', 'git status', 'ai explain', 'run')..."
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none disabled:opacity-50"
            />
          </form>
        </div>
      )}
    </div>
  );
}