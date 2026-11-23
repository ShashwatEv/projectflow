import { useState, useRef, useEffect } from 'react';
import { FileText, Pencil, Trash2, Smile, Plus, MessageSquare, Play, Pause } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';
import AvatarWithFrame, {
  AVATAR_FRAMES,
  type AvatarFrameId,
} from './AvatarWithFrame';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  accentColor?: string;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onOpenThread?: (message: any) => void;
}

function normalizeFrameId(value: unknown): AvatarFrameId {
  if (typeof value === 'string' && AVATAR_FRAMES.some((item) => item.id === value)) {
    return value as AvatarFrameId;
  }
  return 'blue-sparkles';
}

function AudioPlayer({ src, isMe }: { src: string; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex min-w-[210px] select-none items-center gap-3 py-1.5">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95 ${
          isMe
            ? 'bg-white/20 text-white hover:bg-white/30'
            : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
        }`}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          className={`h-1.5 w-full overflow-hidden rounded-full ${
            isMe ? 'bg-black/20' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          <div
            className={`h-full transition-all duration-100 ${isMe ? 'bg-white' : 'bg-indigo-600'}`}
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div
          className={`flex justify-between font-mono text-[10px] leading-none ${
            isMe ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({
  message,
  isMe,
  accentColor = '#4f46e5',
  onEdit,
  onDelete,
  onReact,
  onOpenThread,
}: MessageBubbleProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const reactions: Reaction[] = message.message_reactions || [];

  const reactionCounts = reactions.reduce((acc: Record<string, number>, curr: Reaction) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
        setShowFullPicker(false);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const quickEmojis = ['👍', '❤️', '😂', '🔥', '😮', '🎉'];

  const handleFullEmojiClick = (emojiData: EmojiClickData) => {
    onReact(message.id, emojiData.emoji);
    setShowFullPicker(false);
    setShowEmojiPicker(false);
  };

  const handleTriggerThread = () => {
    if (onOpenThread) {
      onOpenThread(message);
    } else {
      window.dispatchEvent(new CustomEvent('open-message-thread', { detail: message }));
    }
  };

  const senderAvatar: string | undefined =
    message?.sender?.avatar || message?.user_profiles?.avatar || message?.sender_avatar;
  const senderName: string =
    message?.sender?.name || message?.user_profiles?.name || message?.sender_name || 'Member';
  const senderFrame: AvatarFrameId = normalizeFrameId(
    message?.sender?.avatar_frame ||
      message?.user_profiles?.avatar_frame ||
      message?.sender_avatar_frame
  );

  const isAudioFile =
    message.file_type === 'audio' ||
    Boolean(
      message.file_url &&
        (message.file_url.includes('.webm') ||
          message.file_url.includes('.mp4') ||
          message.file_url.includes('.ogg') ||
          message.file_url.includes('voice-notes'))
    );

  return (
    <div
      className={`group relative flex max-w-[85%] items-end gap-2 md:max-w-[70%] ${
        isMe ? 'flex-row-reverse self-end' : 'flex-row self-start'
      }`}
    >
      {!isMe && senderAvatar && (
        <div className="mb-0.5 shrink-0">
          <AvatarWithFrame
            src={senderAvatar}
            alt={senderName}
            shape="circle"
            frame={senderFrame}
            size={28}
          />
        </div>
      )}

      <div className={`relative min-w-0 flex-1 ${isMe ? 'items-end' : 'items-start'}`}>
        {!isEditing && (
          <div
            ref={pickerRef}
            className={`absolute -top-7 ${
              isMe ? 'right-0' : 'left-0'
            } z-20 flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-within:opacity-100 dark:border-gray-700 dark:bg-gray-800`}
          >
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker((prev) => !prev);
                  setShowFullPicker(false);
                }}
                className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-amber-500 dark:hover:bg-gray-700"
                title="Add reaction"
                aria-label="Add reaction"
              >
                <Smile size={14} />
              </button>

              {showEmojiPicker && !showFullPicker && (
                <div className="animate-in zoom-in-95 absolute left-0 top-8 z-30 flex items-center gap-1 whitespace-nowrap rounded-2xl border border-gray-200 bg-white p-1.5 shadow-2xl duration-150 dark:border-gray-700 dark:bg-gray-800">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onReact(message.id, emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="rounded-lg p-1.5 text-base transition-transform hover:scale-125 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {emoji}
                    </button>
                  ))}
                  <div className="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                  <button
                    type="button"
                    onClick={() => setShowFullPicker(true)}
                    className="flex items-center gap-0.5 rounded-lg p-1.5 text-xs font-semibold text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
                    title="More emojis"
                    aria-label="More emojis"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}

              {showFullPicker && (
                <div className="animate-in zoom-in-95 absolute left-0 top-8 z-40 overflow-hidden rounded-2xl shadow-2xl duration-200">
                  <EmojiPicker
                    theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={handleFullEmojiClick}
                    width={300}
                    height={360}
                    lazyLoadEmojis={true}
                    searchPlaceHolder="Search emoji..."
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTriggerThread}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700"
              title="Reply in thread"
              aria-label="Reply in thread"
            >
              <MessageSquare size={13} />
            </button>

            {isMe && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingDelete(false);
                    setIsEditing(true);
                  }}
                  className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-700"
                  title="Edit message"
                  aria-label="Edit message"
                >
                  <Pencil size={13} />
                </button>

                {confirmingDelete ? (
                  <div className="flex items-center gap-1 pl-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmingDelete(false);
                        onDelete(message.id);
                      }}
                      className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-rose-700"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700"
                    title="Delete message"
                    aria-label="Delete message"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <div
          style={isMe ? { backgroundColor: accentColor } : undefined}
          className={`relative break-words p-3.5 text-sm shadow-sm transition-all ${
            isMe
              ? 'rounded-2xl rounded-tr-sm bg-indigo-600 text-white'
              : 'rounded-2xl rounded-tl-sm border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {message.file_url && (
            <div className="mb-2.5">
              {isAudioFile ? (
                <AudioPlayer src={message.file_url} isMe={isMe} />
              ) : message.file_type === 'image' ? (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl"
                >
                  <img
                    src={message.file_url}
                    alt="attachment"
                    className="max-h-60 max-w-xs rounded-xl border border-black/10 object-cover transition-opacity hover:opacity-95 dark:border-white/10"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    isMe
                      ? 'border-white/20 bg-white/15 text-white hover:bg-white/25'
                      : 'border-gray-200 bg-gray-50 text-indigo-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-indigo-400'
                  }`}
                >
                  <FileText size={15} /> Download Document
                </a>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="flex min-w-[220px] flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-inner outline-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditContent(message.content);
                    setIsEditing(false);
                  }}
                  className="rounded-lg px-2.5 py-1 text-xs opacity-80 hover:opacity-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm hover:bg-gray-50"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              {message.is_edited && (
                <span
                  className={`ml-1.5 text-[10px] opacity-60 ${
                    isMe ? 'text-indigo-200' : 'text-gray-400'
                  }`}
                >
                  • edited
                </span>
              )}
            </div>
          )}

          {Boolean(message.reply_count && message.reply_count > 0) && (
            <button
              type="button"
              onClick={handleTriggerThread}
              className={`mt-2 flex items-center gap-1.5 border-t pt-2 text-xs font-bold hover:underline ${
                isMe
                  ? 'border-white/20 text-indigo-100'
                  : 'border-gray-200 text-indigo-500 dark:border-gray-700 dark:text-indigo-400'
              }`}
            >
              <MessageSquare size={12} />
              <span>
                {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {Object.keys(reactionCounts).length > 0 && (
          <div className={`mt-1.5 flex flex-wrap gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message.id, emoji)}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <span>{emoji}</span>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  {count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}