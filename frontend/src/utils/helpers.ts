export function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null || isNaN(val)) return '—';
  if (Math.abs(val) >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(val) >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return val.toFixed(decimals);
}

export function fmtInt(val: number | null | undefined): string {
  if (val == null) return '—';
  return val.toLocaleString();
}

export const CHART_COLORS = [
  '#14b88f', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#3b82f6',
];

export const CHART_TYPE_ICONS: Record<string, string> = {
  bar: '▬',
  line: '↗',
  pie: '◔',
  scatter: '⊡',
  histogram: '▪',
};

export const AGG_OPTIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'mean', label: 'Average' },
  { value: 'count', label: 'Count' },
  { value: 'max', label: 'Maximum' },
  { value: 'min', label: 'Minimum' },
];

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export function typeColor(type: string): string {
  const map: Record<string, string> = {
    numeric: '#6366f1',
    categorical: '#f59e0b',
    datetime: '#14b88f',
    text: '#94a3b8',
  };
  return map[type] ?? '#94a3b8';
}

export function typeBadge(type: string): string {
  const map: Record<string, string> = {
    numeric: '123',
    categorical: 'Abc',
    datetime: '📅',
    text: 'T',
  };
  return map[type] ?? '?';
}
