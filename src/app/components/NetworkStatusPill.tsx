import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

export default function NetworkStatusPill() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      triggerHaptic('success');
      timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      triggerHaptic('warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg animate-in slide-in-from-top-2">
        <Wifi size={14} />
        <span>Connection restored</span>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-amber-500 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-lg animate-in slide-in-from-top-2">
      <WifiOff size={14} />
      <span>Offline mode active</span>
    </div>
  );
}