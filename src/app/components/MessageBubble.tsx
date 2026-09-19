import { useState, useRef, useEffect } from 'react';
import { FileText, Pencil, Trash2, Smile, Plus } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

export default function MessageBubble({ message, isMe, onEdit, onDelete, onReact }: MessageBubbleProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const reactions: Reaction[] = message.message_reactions || [];

  // Group reactions: { "👍": 3, "❤️": 1 }
  const reactionCounts = reactions.reduce((acc: any, curr: Reaction) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
        setShowFullPicker(false);
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

  return (
    <div className={`relative group max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
      {/* Hover Actions */}
      {!isEditing && (
        <div 
          ref={pickerRef}
          className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl p-1 z-20`}
        >
          {/* Reaction Button */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowFullPicker(false);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-amber-500 transition-colors"
              title="Add reaction"
            >
              <Smile size={14} />
            </button>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && !showFullPicker && (
              <div className="absolute top-8 left-0 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 flex items-center gap-1 z-30 animate-in zoom-in-95 duration-150 whitespace-nowrap">
                {quickEmojis.map(emoji => (
                  <button 
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button
                  type="button"
                  onClick={() => setShowFullPicker(true)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold flex items-center gap-0.5"
                  title="More emojis"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* Full Emoji Picker Popover */}
            {showFullPicker && (
              <div className="absolute top-8 left-0 z-40 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
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

          {/* Edit/Delete (Only for Author) */}
          {isMe && (
            <>
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                title="Edit message"
              >
                <Pencil size={13} />
              </button>
              <button 
                type="button"
                onClick={() => { if (confirm('Delete this message?')) onDelete(message.id); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                title="Delete message"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}

      {/* The Message Bubble */}
      <div className={`p-3.5 shadow-sm text-sm break-words relative transition-all ${
        isMe 
          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
          : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm'
      }`}>
        {/* Attachments */}
        {message.file_url && (
          <div className="mb-2.5">
            {message.file_type === 'image' ? (
              <a href={message.file_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
                <img 
                  src={message.file_url} 
                  alt="attachment" 
                  className="max-w-xs max-h-60 rounded-xl object-cover border border-black/10 dark:border-white/10 hover:opacity-95 transition-opacity" 
                  loading="lazy"
                />
              </a>
            ) : (
              <a 
                href={message.file_url} 
                target="_blank" 
                rel="noreferrer" 
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isMe 
                    ? 'bg-white/15 border-white/20 text-white hover:bg-white/25' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100'
                }`}
              >
                <FileText size={15} /> Download Document
              </a>
            )}
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[220px]">
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-gray-900 bg-white p-2.5 rounded-xl text-sm w-full outline-none border border-gray-300 shadow-inner"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setIsEditing(false)} 
                className="text-xs px-2.5 py-1 rounded-lg opacity-80 hover:opacity-100"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {message.is_edited && (
              <span className={`text-[10px] ml-1.5 opacity-60 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                (edited)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reactions Display (Below Bubble) */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(reactionCounts).map(([emoji, count]: any) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(message.id, emoji)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 text-xs shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{emoji}</span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}