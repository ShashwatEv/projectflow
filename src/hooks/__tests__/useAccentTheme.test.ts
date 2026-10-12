import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccentTheme } from '../../lib/useAccentTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock window.dispatchEvent
window.dispatchEvent = vi.fn();

describe('useAccentTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('returns default accent (indigo) when no localStorage value', () => {
    const { result } = renderHook(() => useAccentTheme());
    
    expect(result.current.accent).toBe('indigo');
    expect(result.current.btnPrimary).toBe('bg-indigo-600 hover:bg-indigo-700 text-white');
  });

  it('returns stored accent from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('emerald');
    
    const { result } = renderHook(() => useAccentTheme());
    
    expect(result.current.accent).toBe('emerald');
    expect(result.current.btnPrimary).toBe('bg-emerald-600 hover:bg-emerald-700 text-white');
  });

  it('updates accent and saves to localStorage', () => {
    const { result } = renderHook(() => useAccentTheme());
    
    act(() => {
      result.current.setAccent('rose');
    });
    
    expect(result.current.accent).toBe('rose');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pf_accent_theme', 'rose');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('listens for storage events', () => {
    const { result } = renderHook(() => useAccentTheme());
    
    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'pf_accent_theme',
      newValue: 'blue',
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current.accent).toBe('blue');
  });

  it('provides all required theme classes', () => {
    const { result } = renderHook(() => useAccentTheme());
    
    expect(result.current).toHaveProperty('accent');
    expect(result.current).toHaveProperty('setAccent');
    expect(result.current).toHaveProperty('btnPrimary');
    expect(result.current).toHaveProperty('textAccent');
    expect(result.current).toHaveProperty('textHover');
    expect(result.current).toHaveProperty('bgSubtle');
    expect(result.current).toHaveProperty('borderAccent');
    expect(result.current).toHaveProperty('ringAccent');
    expect(result.current).toHaveProperty('toggleActive');
    expect(result.current).toHaveProperty('progressBar');
  });
});