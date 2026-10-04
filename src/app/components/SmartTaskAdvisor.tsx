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
    if (!currentTitle.trim()) return;

    setAnalyzing(true);
    setAdvice(null);

    const taskPoolSummary = existingTasks
      .slice(0, 15)
      .map((t) => `- "${t.title}": ${t.description || 'No desc'}`)
      .join('\n');

    const prompt = `
You are an AI Scrum Technical Lead.
Analyze this proposed new task:
Title: "${currentTitle}"
Description: "${currentDescription}"

Against existing project tasks:
${taskPoolSummary}

Return pure JSON (no markdown backticks):
{
  "estimatedHours": 4,
  "duplicateWarning": "Warning message if similar task exists, or null",
  "suggestions": "One sentence technical tip for acceptance criteria."
}
`;

    try {
      const raw = await askGeminiCodeAssistant(prompt, '', 'analyzer.json');
      const clean = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      setAdvice(parsed);
    } catch {
      // Fallback estimate
      setAdvice({
        estimatedHours: 3,
        suggestions: 'Ensure clean integration tests are paired with deliverable.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
          <Sparkles size={14} />
          <span>AI Task Advisor</span>
        </div>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing || !currentTitle.trim()}
          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-all disabled:opacity-50"
        >
          {analyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
          <span>{analyzing ? 'Evaluating...' : 'Detect Duplicates & Hours'}</span>
        </button>
      </div>

      {advice && (
        <div className="space-y-2 pt-1 text-xs animate-in fade-in">
          {advice.duplicateWarning && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">{advice.duplicateWarning}</p>
            </div>
          )}

          <div className="flex items-center justify-between bg-[#161b22] p-2.5 rounded-xl border border-gray-800">
            <div className="flex items-center gap-2 text-gray-300 text-[11px]">
              <Clock size={13} className={theme.textAccent} />
              <span>Recommended Velocity: <strong>{advice.estimatedHours} hrs</strong></span>
            </div>
            <button
              type="button"
              onClick={() => onApplyEstimate(advice.estimatedHours)}
              className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-[10px] font-bold flex items-center gap-1"
            >
              <Check size={11} /> Apply
            </button>
          </div>

          <p className="text-[10px] text-gray-400 italic px-1">{advice.suggestions}</p>
        </div>
      )}
    </div>
  );
}