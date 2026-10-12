import { useState, useEffect } from 'react';
import { Smartphone, Download, ExternalLink, X } from 'lucide-react';
import { useAccentTheme } from '../../lib/useAccentTheme';
import { triggerHaptic } from '../../lib/haptics';

const DIRECT_APK_URL = 'https://github.com/ShashwatEv/projectflow/releases/download/Projectflow/ProjectFlow.apk';
const GITHUB_RELEASE_URL = 'https://github.com/ShashwatEv/projectflow/releases/tag/Projectflow';

export default function AndroidDownloadBanner() {
  const theme = useAccentTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pf_apk_banner_dismissed');
    if (isDismissed) return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isAndroidDevice = /android/i.test(userAgent);
    setIsAndroid(isAndroidDevice);

    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    triggerHaptic('tap');
    sessionStorage.setItem('pf_apk_banner_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="relative z-30 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-950/50 dark:from-indigo-950/80 dark:via-gray-900 dark:to-indigo-950/60 border-b border-indigo-500/20 backdrop-blur-md px-4 py-2.5 text-xs text-white transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 shrink-0">
            <Smartphone size={16} />
          </div>
          <div className="truncate">
            <span className="font-bold text-gray-100">
              {isAndroid ? 'Get the native Android experience' : 'ProjectFlow for Android'}
            </span>
            <span className="text-gray-400 ml-2 hidden sm:inline">
              Download the standalone APK with offline support and haptics.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={DIRECT_APK_URL}
            onClick={() => triggerHaptic('success')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${theme.btnPrimary} text-white font-bold text-xs shadow-sm active:scale-95 transition-transform`}
            download="ProjectFlow.apk"
          >
            <Download size={13} />
            <span>Download APK</span>
          </a>

          <a
            href={GITHUB_RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => triggerHaptic('tap')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="View on GitHub Releases"
          >
            <span className="hidden sm:inline">Release Notes</span>
            <ExternalLink size={12} />
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
            title="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}