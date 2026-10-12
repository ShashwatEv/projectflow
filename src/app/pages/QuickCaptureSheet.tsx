import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Mic,
  MicOff,
  Sparkles,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface ProjectOption {
  id: string;
  name: string;
}

export default function QuickCaptureSheet() {
  const { user } = useAuth();
  const theme = useAccentTheme();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<ProjectOption[]>([]);

  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await supabase.from('projects').select('id, name');
        if (data) {
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0]?.id || '');
          }
        }
      } catch {
        // projects optional
      }
    }

    fetchProjects();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setDescription((prev) => {
          const separator = prev.trim() ? ' ' : '';
          return `${prev.trim()}${separator}${transcript.trim()}`;
        });
      };

      recognition.onerror = () => {
        setIsListening(false);
        triggerHaptic('error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeech = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.info('Speech recognition is not supported in this mobile browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      triggerHaptic('tap');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        triggerHaptic('success');
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    triggerHaptic('tap');

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `whiteboards/wb_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setImageUrl(urlData.publicUrl);
        triggerHaptic('success');
        toast.success('Whiteboard snapshot attached');
      }
    } catch {
      triggerHaptic('error');
      toast.error('Failed to upload whiteboard image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setSubmitting(true);
    triggerHaptic('tap');

    try {
      const fullDescription = imageUrl
        ? `${description.trim()}\n\nAttachment: ${imageUrl}`.trim()
        : description.trim();

      const { error } = await supabase.from('tasks').insert({
        title: title.trim(),
        description: fullDescription || null,
        priority,
        status: 'todo',
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        project_id: selectedProjectId || null,
        assigned_to: user.id,
      });

      if (error) throw error;

      triggerHaptic('success');
      toast.success('Task created successfully');
      navigate('/tasks');
    } catch {
      triggerHaptic('error');
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#080b12] text-gray-900 dark:text-white p-4 select-none overflow-y-auto custom-scrollbar transition-colors duration-200">
      {/* top bar */}
      <div className="flex items-center justify-between pb-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('tap');
            navigate('/tasks');
          }}
          className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
          <Sparkles size={14} className={theme.textAccent} />
          <span>Quick Capture</span>
        </div>

        <div className="w-8" />
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between py-2 space-y-4">
        <div className="space-y-4">
          {/* title input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Task Title *
            </label>
            <input
              required
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit Redis session invalidation"
              className={`w-full px-3.5 py-3 rounded-2xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none ${theme.ringAccent} shadow-xs`}
            />
          </div>

          {/* voice dictation note input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Context and Notes
              </label>
              <button
                type="button"
                onClick={toggleSpeech}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                  isListening
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 dark:text-rose-400 animate-pulse'
                    : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs'
                }`}
              >
                {isListening ? <MicOff size={11} /> : <Mic size={11} />}
                <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tap voice dictate to speak or type acceptance criteria..."
              className={`w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none ${theme.ringAccent} shadow-xs resize-none leading-relaxed`}
            />
          </div>

          {/* whiteboard image capture */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Whiteboard or Bug Snapshot
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-black/10 dark:bg-black/40">
                <img src={imageUrl} alt="Whiteboard preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl bg-white dark:bg-[#111726] border border-dashed border-gray-300 dark:border-white/15 flex items-center justify-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white shadow-xs transition-colors active:scale-98"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 size={16} className={`animate-spin ${theme.textAccent}`} />
                    <span>Uploading snapshot...</span>
                  </>
                ) : (
                  <>
                    <Camera size={16} className={theme.textAccent} />
                    <span>Snap Whiteboard or Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* project and priority pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} shadow-xs`}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className={`w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} shadow-xs`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* due date picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl bg-white dark:bg-[#111726] border border-gray-200 dark:border-white/10 text-xs text-gray-900 dark:text-white outline-none ${theme.ringAccent} shadow-xs`}
            />
          </div>
        </div>

        {/* submit button */}
        <div className="pt-3 shrink-0">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className={`w-full py-3.5 ${theme.btnPrimary} text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-40`}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            <span>Create Deliverable</span>
          </button>
        </div>
      </form>
    </div>
  );
}