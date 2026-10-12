import { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { triggerHaptic } from '../../lib/haptics';
import { toast } from 'sonner';

interface ChatVoiceRecorderProps {
  roomId: string;
  onSendVoiceNote: (audioUrl: string, durationSec: number) => Promise<void> | void;
  disabled?: boolean;
}

export default function ChatVoiceRecorder({
  roomId,
  onSendVoiceNote,
  disabled = false,
}: ChatVoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (disabled || isUploading) return;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Microphone recording is not supported in this browser');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;

      setIsRecording(true);
      setRecordingSeconds(0);
      triggerHaptic('tap');

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      toast.error('Could not access microphone. Please check site permissions.');
      triggerHaptic('error');
    }
  };

  const cleanupStream = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const cancelRecording = () => {
    triggerHaptic('warning');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    cleanupStream();
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const finishAndSend = async () => {
    if (!mediaRecorderRef.current) return;

    const duration = recordingSeconds;
    if (duration < 1) {
      cancelRecording();
      toast.info('Voice note too short');
      return;
    }

    setIsUploading(true);
    triggerHaptic('tap');

    const recorder = mediaRecorderRef.current;

    recorder.onstop = async () => {
      try {
        const mime = recorder.mimeType || 'audio/webm';
        const extension = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });

        const fileName = `voice_${roomId}_${Date.now()}.${extension}`;
        const filePath = `voice-notes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(filePath, audioBlob, {
            contentType: mime,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-files')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          throw new Error('Unable to retrieve voice note link');
        }

        await onSendVoiceNote(urlData.publicUrl, duration);
        triggerHaptic('success');
      } catch {
        toast.error('Failed to upload voice recording');
        triggerHaptic('error');
      } finally {
        cleanupStream();
        setIsRecording(false);
        setIsUploading(false);
        setRecordingSeconds(0);
      }
    };

    recorder.stop();
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-2 bg-rose-500/10 dark:bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 rounded-2xl animate-in fade-in duration-150">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-mono text-xs font-bold text-rose-500">
            {formatTimer(recordingSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-1">
          <button
            type="button"
            onClick={cancelRecording}
            disabled={isUploading}
            className="p-1.5 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
            title="Discard voice note"
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            onClick={finishAndSend}
            disabled={isUploading}
            className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            title="Send voice note"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled || isUploading}
      className="p-2.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-40"
      title="Record voice note"
    >
      <Mic size={18} />
    </button>
  );
}