import { useState, useRef } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ChatFileButtonProps {
  onUploadComplete: (url: string, type: string) => void;
}

export default function ChatFileButton({ onUploadComplete }: ChatFileButtonProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      // 1. Generate a unique file name (e.g., "123-my-image.png")
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase 'chat-files' bucket
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // 4. Determine type (simple check)
      const type = file.type.startsWith('image/') ? 'image' : 'file';

      // 5. Pass URL back to parent
      onUploadComplete(data.publicUrl, type);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      // Reset input so you can select the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx" // Accept images and docs
      />
      
      <button 
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
        title="Attach file"
      >
        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
      </button>
    </>
  );
}