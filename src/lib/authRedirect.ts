const APP_ORIGIN = 'https://projectflow.invalid';
const DEFAULT_RETURN_PATH = '/dashboard';

export function getSafeReturnPath(candidate: unknown): string {
  let target: string | null = null;
  if (typeof candidate === 'string') {
    target = candidate;
  } else if (candidate && typeof candidate === 'object') {
    const location = candidate as { pathname?: unknown; search?: unknown; hash?: unknown };
    if (typeof location.pathname === 'string') {
      target = [
        location.pathname,
        typeof location.search === 'string' ? location.search : '',
        typeof location.hash === 'string' ? location.hash : '',
      ].join('');
    }
  }
  if (!target) return DEFAULT_RETURN_PATH;

  try {
    const url = new URL(target, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN) return DEFAULT_RETURN_PATH;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_RETURN_PATH;
  }
}
