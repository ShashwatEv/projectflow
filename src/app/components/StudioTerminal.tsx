import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface TerminalLog {
  type: 'input' | 'output' | 'error' | 'system';
  text: string;
}

export default function StudioTerminal({
  isOpen,
  onToggle,
  activeCode,
}: {
  isOpen: boolean;
  onToggle: () => void;
  activeCode: string;
}) {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { type: 'system', text: 'ProjectFlow Sandboxed V8 Shell v1.2' },
    { type: 'system', text: 'Type JS expressions or execute "run" to evaluate active file.' },
  ]);
  const [command, setCommand] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const executeCode = (cmd: string) => {
    if (!cmd.trim()) return;

    setLogs((prev) => [...prev, { type: 'input', text: `$ ${cmd}` }]);

    if (cmd === 'clear') {
      setLogs([]);
      setCommand('');
      return;
    }

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
      setCommand('');
      return;
    }

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
      setLogs((prev) => [...prev, { type: 'error', text: `Eval Error: ${err.message}` }]);
    }

    setCommand('');
  };

  return (
    <div
      className={`border-t border-gray-800 bg-[#0d1117] flex flex-col shrink-0 transition-all duration-300 z-10 ${
        isOpen ? 'h-56' : 'h-9'
      }`}
    >
      {/* Console Bar */}
      <div className="h-9 px-4 bg-[#161b22] border-b border-gray-800 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 cursor-pointer text-gray-300" onClick={onToggle}>
          <TerminalIcon size={14} className="text-emerald-400" />
          <span className="font-mono font-bold text-[11px]">Interactive Terminal (JS Sandbox)</span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <>
              <button
                onClick={() => executeCode('run')}
                className="px-2.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                title="Evaluate active file in memory"
              >
                <Play size={10} /> Run File
              </button>
              <button
                onClick={() => setLogs([])}
                className="p-1 hover:text-rose-400 text-gray-400 transition-colors"
                title="Clear Logs"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button onClick={onToggle} className="text-gray-400 hover:text-white p-1">
            {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      {isOpen && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div
            ref={logContainerRef}
            className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 custom-scrollbar min-h-0"
          >
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.type === 'input'
                    ? 'text-indigo-400'
                    : log.type === 'error'
                    ? 'text-rose-400 font-bold'
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
              executeCode(command);
            }}
            className="h-9 border-t border-gray-800/80 px-3 flex items-center gap-2 bg-[#0d1117] shrink-0"
          >
            <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Type expression or 'run'..."
              className="flex-1 bg-transparent text-white font-mono text-xs outline-none"
            />
          </form>
        </div>
      )}
    </div>
  );
}