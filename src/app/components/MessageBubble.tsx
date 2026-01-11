import { useState } from 'react';
import { FileText, Download, Pencil, Trash2, Smile, Plus } from 'lucide-react';

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
  onReact: (id: string, emoji: string) => void; // <--- New Prop
}

export default function MessageBubble({ message, isMe, onEdit, onDelete, onReact }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const reactions: Reaction[] = message.message_reactions || [];
  
  // Group reactions: { "👍": 3, "❤️": 1 }
  const reactionCounts = reactions.reduce((acc: any, curr: Reaction) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const emojis = ['👍', '❤️', '😂', '🔥', '😮', '🎉'];

  return (
    <div className={`relative group max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
      
      {/* Hover Actions */}
      {!isEditing && (
        <div className={`absolute -top-6 ${isMe ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg p-1 z-10`}>
          
          {/* Reaction Button */}
          <div className="relative">
             <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-yellow-500"
             >
               <Smile size={12} />
             </button>
             
             {/* Mini Emoji Picker */}
             {showEmojiPicker && (
               <div className="absolute top-6 left-0 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-xl p-2 flex gap-1 z-20 animate-in zoom-in-95 duration-200">
                  {emojis.map(emoji => (
                    <button 
                      key={emoji}
                      onClick={() => { onReact(message.id, emoji); setShowEmojiPicker(false); }}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded text-lg transition-transform hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
               </div>
             )}
          </div>

          {/* Edit/Delete (Only for ME) */}
          {isMe && (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-indigo-600"
              >
                <Pencil size={12} />
              </button>
              <button 
                onClick={() => { if(confirm('Delete?')) onDelete(message.id) }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      )}

      {/* The Bubble */}
      <div className={`p-3 shadow-sm text-sm break-words relative transition-all ${
          isMe 
          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
          : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm'
      }`}>
          
          {/* Attachments */}
          {message.file_url && (
              <div className="mb-2">
                  {message.file_type === 'image' ? (
                      <a href={message.file_url} target="_blank" rel="noreferrer">
                          <img 
                              src={message.file_url} 
                              alt="attachment" 
                              className="max-w-xs rounded-lg border border-black/10 dark:border-white/10 hover:opacity-90 transition-opacity" 
                              loading="lazy"
                          />
                      </a>
                  ) : (
                      <a href={message.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline opacity-80">
                         <FileText size={16} /> Attachment
                      </a>
                  )}
              </div>
          )}
          
          {/* Content */}
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-gray-900 bg-white/90 p-2 rounded text-sm w-full outline-none"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditing(false)} className="text-xs opacity-80">Cancel</button>
                <button onClick={handleSave} className="bg-white text-indigo-600 px-2 py-1 rounded text-xs font-bold">Save</button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="leading-relaxed">{message.content}</p>
              {message.is_edited && <span className="text-[10px] opacity-60 ml-1">(edited)</span>}
            </div>
          )}
      </div>

      {/* Reactions Display (Below Bubble) */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(reactionCounts).map(([emoji, count]: any) => (
             <button
               key={emoji}
               onClick={() => onReact(message.id, emoji)}
               className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 text-xs shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-1"
             >
               <span>{emoji}</span>
               <span className="text-gray-500 font-bold">{count}</span>
             </button>
          ))}
        </div>
      )}
    </div>
  );
}