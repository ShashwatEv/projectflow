import { describe, it, expect } from 'vitest';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cn } from '../../lib/utils';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('handles complex tailwind merges', () => {
    expect(cn('flex items-center', 'flex-col justify-center')).toBe('flex-col items-center justify-center');
  });
});

describe('clsx', () => {
  it('joins strings', () => {
    expect(clsx('a', 'b', 'c')).toBe('a b c');
  });

  it('handles objects', () => {
    expect(clsx({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('handles arrays', () => {
    expect(clsx(['a', 'b', 'c'])).toBe('a b c');
  });
});

describe('twMerge', () => {
  it('merges conflicting tailwind classes', () => {
    expect(twMerge('p-2 p-4')).toBe('p-4');
    expect(twMerge('text-red-500 text-blue-500')).toBe('text-blue-500');
  });

  it('preserves non-conflicting classes', () => {
    expect(twMerge('p-2 m-4')).toBe('p-2 m-4');
  });
});