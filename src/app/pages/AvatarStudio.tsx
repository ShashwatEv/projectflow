import { useState, useEffect } from 'react';
import { Check, Loader2, Sparkles, CircleDot, Square } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { getGoogleProfilePhoto } from '../../lib/profileAvatar';
import AvatarWithFrame, {
  AVATAR_FRAMES,
  type AvatarFrameId,
} from '../components/AvatarWithFrame';

const FRAME_STORAGE_KEY = 'pf_user_avatar_frame';

function normalizeFrameId(value: unknown): AvatarFrameId | null {
  if (typeof value !== 'string') return null;
  return AVATAR_FRAMES.some((frame) => frame.id === value) ? (value as AvatarFrameId) : null;
}

export default function AvatarStudio() {
  const { user } = useAuth();
  const theme = useAccentTheme();

  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.avatar || '/pfp.jpg');
  const [selectedFrame, setSelectedFrame] = useState<AvatarFrameId>(() => {
    if (typeof window === 'undefined') return 'blue-sparkles';
    return normalizeFrameId(localStorage.getItem(FRAME_STORAGE_KEY)) ?? 'blue-sparkles';
  });
  const [googleAvatar, setGoogleAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const avatars = [
    { src: '/pfp.jpg', label: 'Default' },
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    ...(googleAvatar ? [{ src: googleAvatar, label: 'Google' }] : []),
  ];

  useEffect(() => {
    if (user?.avatar) {
      setSelectedAvatar(user.avatar);
    }

    let active = true;
    void (async () => {
      try {
        const [{ data: authData }, userRowResult] = await Promise.all([
          supabase.auth.getUser(),
          user?.id
            ? supabase
                .from('users')
                .select('avatar, avatar_frame')
                .eq('id', user.id)
                .single()
            : Promise.resolve({ data: null, error: null }),
        ]);

        if (!active) return;
        setGoogleAvatar(getGoogleProfilePhoto(authData?.user));

        const dbRow = userRowResult.data as { avatar?: string | null; avatar_frame?: string | null } | null;
        if (dbRow?.avatar) {
          setSelectedAvatar(dbRow.avatar);
        }
        const dbFrame = normalizeFrameId(dbRow?.avatar_frame);
        if (dbFrame) {
          setSelectedFrame(dbFrame);
          localStorage.setItem(FRAME_STORAGE_KEY, dbFrame);
        }
      } catch {
        // ignore if offline
      }
    })();

    return () => {
      active = false;
    };
  }, [user?.avatar, user?.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('pf_user_avatar', selectedAvatar);
      localStorage.setItem(FRAME_STORAGE_KEY, selectedFrame);

      if (user?.id) {
        const { error } = await supabase
          .from('users')
          .update({
            avatar: selectedAvatar,
            avatar_frame: selectedFrame,
          })
          .eq('id', user.id);
        if (error) throw error;
      }

      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('user-profile-updated'));
      window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: selectedFrame }));
      toast.success('Avatar & animated frame applied!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not save avatar settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const activeFrameMeta =
    AVATAR_FRAMES.find((f) => f.id === selectedFrame) ?? AVATAR_FRAMES[0]!;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800 sm:flex-row sm:items-center">
        <div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
          >
            <Sparkles size={12} />
            <span>Avatar & Frame Studio</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Customize Avatar & Live Frames
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose clockwise animated frames with white sparkles, metallic gold/silver, or solar orange—previewed in both profile circle and top-bar square shapes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${theme.btnPrimary}`}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          <span>{saving ? 'Applying...' : 'Apply Frame & Avatar'}</span>
        </button>
      </div>

      {/* Live Dual-Shape Stage */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Live Shape Preview
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${theme.bgSubtle} ${theme.textAccent} ${theme.borderAccent}/30`}
            >
              {activeFrameMeta.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Circle Preview (Profile Pages) */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-[#0d1117]/70">
              <AvatarWithFrame
                src={selectedAvatar}
                alt="Circle profile preview"
                shape="circle"
                frame={selectedFrame}
                size={84}
              />
              <div className="text-center">
                <p className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white">
                  <CircleDot size={12} className={theme.textAccent} />
                  <span>Circle</span>
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Profile & cards</p>
              </div>
            </div>

            {/* Square Preview (Top Navigation Bar) */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-[#0d1117]/70">
              <div className="flex h-[84px] items-center justify-center">
                <AvatarWithFrame
                  src={selectedAvatar}
                  alt="Square navbar preview"
                  shape="square"
                  frame={selectedFrame}
                  size={44}
                />
              </div>
              <div className="text-center">
                <p className="inline-flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white">
                  <Square size={12} className={theme.textAccent} />
                  <span>Square</span>
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Top navigation bar</p>
              </div>
            </div>
          </div>

          <p className="rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-600 dark:border-gray-800 dark:bg-[#0d1117] dark:text-gray-300">
            {activeFrameMeta.tagline}
          </p>
        </div>

        {/* Frame & Portrait Picker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Animated Frames Grid */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Select Animated Frame
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {AVATAR_FRAMES.map((frame) => {
                const isSelected = selectedFrame === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0d1117]/60'
                    }`}
                  >
                    <AvatarWithFrame
                      src={selectedAvatar}
                      alt={frame.name}
                      shape="circle"
                      frame={frame.id}
                      size={48}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-bold text-gray-900 dark:text-white">
                          {frame.name}
                        </span>
                        {isSelected && <Check size={14} className={theme.textAccent} />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500 dark:text-gray-400">
                        {frame.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portrait Selection */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-[#161b22] space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Select Portrait
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {avatars.map((av) => {
                const active = selectedAvatar === av.src;
                return (
                  <button
                    key={av.src}
                    type="button"
                    onClick={() => setSelectedAvatar(av.src)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0d1117]/60'
                    }`}
                  >
                    <img
                      src={av.src}
                      alt={av.label}
                      className="h-14 w-14 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {av.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}