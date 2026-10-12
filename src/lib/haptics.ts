export const triggerHaptic = (type: 'tap' | 'success' | 'warning' | 'error' = 'tap') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(10);
        break;
      case 'success':
        navigator.vibrate([12, 40, 15]);
        break;
      case 'warning':
        navigator.vibrate([20, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([30, 60, 40]);
        break;
      default:
        navigator.vibrate(10);
        break;
    }
  } catch {
    // Fail silently on browsers that disallow vibration
  }
};