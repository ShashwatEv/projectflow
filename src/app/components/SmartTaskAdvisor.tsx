import { useState } from 'react';
import { Sparkles, AlertCircle, Clock, Check, Loader2 } from 'lucide-react';
import { askGeminiCodeAssistant } from '../../lib/geminiClient';
import { useAccentTheme } from '../../lib/useAccentTheme';

interface SmartTaskAdvisorProps {
  currentTitle: string;
  currentDescription: string;
  existingTasks: { id: string; title: string; description?: string }[];
  onApplyEstimate: (hours: number) => void;
}

export default function SmartTaskAdvisor({
  currentTitle,
  currentDescription,
  existingTasks,
  onApplyEstimate,
}: SmartTaskAdvisorProps) {
  const theme = useAccentTheme();
  const [analyzing, setAnalyzing] = useState(false);
  const [advice, setAdvice] = useState<{
    estimatedHours: number;
    duplicateWarning?: string;
    suggestions: string;
  } | null>(null);

  const handleAnalyze = async () => {
    const trimmedTitle = currentTitle.trim();
    if (!trimmedTitle) return;

    setAnalyzing(true);
    setAdvice(null);

    const taskPoolSummary =
      existingTasks
        .slice(0, 15)
        .map((t) => `- ${t.title}${t.description ? `: ${t.description}` : ''}`)
        .join('\n') || 'None';

    const prompt = [
      'Evaluate this task for effort hours, duplicate work, and acceptance criteria.',
      `Task: "${trimmedTitle}"`,
      currentDescription.trim() ? `Details: "${currentDescription.trim()}"` : '',
      `Existing project tasks:\n${taskPoolSummary}`,
      'Return valid JSON only (no markdown fences):',
      '{"estimatedHours":4,"duplicateWarning":null,"suggestions":"One concise acceptance criterion."}',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const raw = await askGeminiCodeAssistant(prompt, '', 'analyzer.json');
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw) as {
        estimatedHours?: number;
        duplicateWarning?: string | null;
        suggestions?: string;
      };
      setAdvice({
        estimatedHours:
          typeof parsed.estimatedHours === 'number' && parsed.estimatedHours > 0
            ? Math.round(parsed.estimatedHours * 10) / 10
            : 2,
        duplicateWarning: parsed.duplicateWarning || undefined,
        suggestions:
          parsed.suggestions?.trim() || 'Define clear done criteria before starting work.',
      });
    } catch {
      const duplicate = existingTasks.find(
        (t) => t.title.trim().toLowerCase() === trimmedTitle.toLowerCase()
      );
      setAdvice({
        estimatedHours: currentDescription.trim().length > 120 ? 4 : 2,
        duplicateWarning: duplicate
          ? `A task titled "${duplicate.title}" already exists in this project.`
          : undefined,
        suggestions: 'Break down edge cases and confirm verification steps in the description.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2.5 rounded-2xl border border-gray-800 bg-[#0d1117] p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
          <Sparkles size={14} />
          <span>Task Estimate & Duplicate Check</span>
        </div>
        <button
          type="button"
          onClick={() => void handleAnalyze()}
          disabled={analyzing || !currentTitle.trim()}
          className="flex items-center gap-1 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold text-purple-400 transition-all hover:bg-purple-500/20 disabled:opacity-50"
        >
          {analyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          <span>{analyzing ? 'Checking...' : 'Check Duplicates & Hours'}</span>
        </button>
      </div>

      {advice && (
        <div className="animate-in fade-in space-y-2 pt-1 text-xs">
          {advice.duplicateWarning && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5 text-amber-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p className="text-[11px] leading-relaxed">{advice.duplicateWarning}</p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-[#161b22] p-2.5">
            <div className="flex items-center gap-2 text-[11px] text-gray-300">
              <Clock size={13} className={theme.textAccent} />
              <span>
                Suggested Estimate: <strong>{advice.estimatedHours} hrs</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => onApplyEstimate(advice.estimatedHours)}
              className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/30"
            >
              <Check size={11} /> Apply
            </button>
          </div>

          <p className="px-1 text-[10px] italic text-gray-400">{advice.suggestions}</p>
        </div>
      )}
    </div>
  );
}
