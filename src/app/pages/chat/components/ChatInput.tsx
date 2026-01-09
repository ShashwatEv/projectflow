import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Smile, Reply } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Message } from '../types';

interface ChatInputProps {
  // Updated: Accepts raw File object for Supabase upload
  onSendMessage: (text: string, file: File | null) => void;
  // Updated: Optional typing broadcaster
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export function ChatInput({ onSendMessage, onTyping, placeholder, replyingTo, onCancelReply }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // File Upload State
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Broadcast "Typing..." event
    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      // Stop typing 2 seconds after last keystroke
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000) as ReturnType<typeof setTimeout>;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearAttachment = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !previewFile) return;

    // Send data up to Parent
    onSendMessage(inputValue, previewFile);
    
    // Reset States
    setInputValue('');
    clearAttachment();
    setShowEmojiPicker(false);
    if(onCancelReply) onCancelReply();

    // Stop typing immediately
    if (onTyping && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onTyping(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-20">
      
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx" />

      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-2xl animate-in slide-in-from-bottom-5">
           <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.AUTO} width={320} height={400} />
        </div>
      )}

      {replyingTo && onCancelReply && (
          <div className="flex items-center justify-between mb-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500 animate-in slide-in-from-bottom-2">
              <div className="flex flex-col text-sm">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Reply size={12} /> Replying to message
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate max-w-xs">{replyingTo.text}</span>
              </div>
              <button onClick={onCancelReply} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                  <X size={16} className="text-gray-500" />
              </button>
          </div>
      )}

      {previewFile && (
        <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-2">
            {previewUrl && previewFile.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
            ) : (
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Paperclip size={20} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{previewFile.name}</p>
                <p className="text-xs text-gray-500">{(previewFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={clearAttachment} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                <X size={16} />
            </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
        <div className="flex items-center px-2 py-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Paperclip size={20} />
          </button>
          
          <input 
            value={inputValue} 
            onChange={handleInputChange} 
            placeholder={placeholder} 
            className="flex-1 bg-transparent px-3 py-2 outline-none text-gray-900 dark:text-white placeholder-gray-500 text-sm" 
          />
          
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-lg transition-colors mr-1 ${showEmojiPicker ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Smile size={20} />
          </button>

          <button type="submit" className={`p-2 rounded-lg transition-all ${inputValue.trim() || previewFile ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
            <Send size={18} className="ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}