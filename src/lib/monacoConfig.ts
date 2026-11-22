import { loader } from '@monaco-editor/react';

let isMonacoConfigured = false;

export function ensureMonacoConfigured() {
  if (isMonacoConfigured) return;
  loader.config({
    paths: {
      vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs',
    },
  });
  isMonacoConfigured = true;
}