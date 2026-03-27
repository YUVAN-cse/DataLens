import { useState, useCallback } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../../store';
import { fmt } from '../../utils/helpers';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function RangeFilter({
  column,
  min,
  max,
  value,
  onChange,
}: {
  column: string;
  min: number;
  max: number;
  value: { min?: number; max?: number };
  onChange: (v: { min: number; max: number }) => void;
}) {
  const lo = value.min ?? min;
  const hi = value.max ?? max;
  const range = max - min || 1;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>{fmt(lo)}</span>
        <span>{fmt(hi)}</span>
      </div>
      <div className="relative h-5 flex items-center">
        <div
          className="absolute w-full h-1 rounded-full"
          style={{ background: 'var(--border)' }}
        />
        <div
          className="absolute h-1 rounded-full"
          style={{
            background: 'var(--brand)',
            left: `${((lo - min) / range) * 100}%`,
            right: `${((max - hi) / range) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={(range) / 100}
          value={lo}
          onChange={(e) => onChange({ min: +e.target.value, max: hi })}
          className="absolute w-full appearance-none bg-transparent"
          style={{ zIndex: lo > (min + max) / 2 ? 3 : 2 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={(range) / 100}
          value={hi}
          onChange={(e) => onChange({ min: lo, max: +e.target.value })}
          className="absolute w-full appearance-none bg-transparent"
          style={{ zIndex: 2 }}
        />
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          className="input-base text-xs"
          value={lo}
          onChange={(e) => onChange({ min: +e.target.value, max: hi })}
          placeholder="Min"
        />
        <input
          type="number"
          className="input-base text-xs"
          value={hi}
          onChange={(e) => onChange({ min: lo, max: +e.target.value })}
          placeholder="Max"
        />
      </div>
    </div>
  );
}

function CategoricalFilter({
  column,
  options,
  value,
  onChange,
}: {
  column: string;
  options: { value: string; count: number }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((o) =>
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  return (
    <div className="space-y-2">
      {options.length > 6 && (
        <input
          className="input-base text-xs"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}
      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
        {filtered.slice(0, 20).map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: checked ? 'var(--brand)' : 'var(--bg-secondary)',
                  border: `1.5px solid ${checked ? 'var(--brand)' : 'var(--border)'}`,
                }}
                onClick={() => toggle(opt.value)}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="text-xs flex-1 truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {opt.value}
              </span>
              <span
                className="text-xs tabular-nums"
                style={{ color: 'var(--text-muted)' }}
              >
                {opt.count.toLocaleString()}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function DateRangeFilter({
  value,
  minDate,
  maxDate,
  onChange,
}: {
  value: { start?: string; end?: string };
  minDate?: string | null;
  maxDate?: string | null;
  onChange: (v: { start?: string; end?: string }) => void;
}) {
  const toDate = (s?: string | null) => (s ? s.slice(0, 10) : '');
  return (
    <div className="space-y-2">
      <div>
        <label className="label block mb-1">From</label>
        <input
          type="date"
          className="input-base text-xs"
          min={toDate(minDate)}
          max={toDate(maxDate)}
          value={value.start ? toDate(value.start) : ''}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
        />
      </div>
      <div>
        <label className="label block mb-1">To</label>
        <input
          type="date"
          className="input-base text-xs"
          min={toDate(minDate)}
          max={toDate(maxDate)}
          value={value.end ? toDate(value.end) : ''}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
        />
      </div>
    </div>
  );
}

export function FiltersSidebar() {
  const { profile, filters, setFilters } = useStore((s) => ({
    profile: s.profile,
    filters: s.filters,
    setFilters: s.setFilters,
  }));

  const update = useCallback(
    (col: string, val: unknown) => {
      setFilters({ ...filters, [col]: val });
    },
    [filters, setFilters]
  );

  const reset = () => setFilters({});

  if (!profile) return null;

  const { columns } = profile;
  const hasFilters = Object.keys(filters).length > 0;

  const numericCols = Object.entries(columns).filter(([, v]) => v.type === 'numeric');
  const catCols = Object.entries(columns).filter(
    ([, v]) => v.type === 'categorical' && (v.top_values?.length ?? 0) > 0
  );
  const dateCols = Object.entries(columns).filter(([, v]) => v.type === 'datetime');

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Filters
          </span>
          {hasFilters && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--brand)', color: 'white' }}
            >
              {Object.keys(filters).length}
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="flex-1 overflow-y-auto">
        {numericCols.length > 0 && (
          <Section title="Numeric" defaultOpen>
            <div className="space-y-5">
              {numericCols.map(([col, info]) => {
                const minV = info.min ?? 0;
                const maxV = info.max ?? 100;
                const fv = (filters[col] as { min?: number; max?: number }) ?? {};
                return (
                  <div key={col}>
                    <label
                      className="label block mb-2 truncate"
                      title={col}
                    >
                      {col}
                    </label>
                    <RangeFilter
                      column={col}
                      min={minV}
                      max={maxV}
                      value={fv}
                      onChange={(v) => update(col, v)}
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {catCols.length > 0 && (
          <Section title="Categories">
            <div className="space-y-5">
              {catCols.map(([col, info]) => {
                const options = info.top_values ?? [];
                const selected = ((filters[col] as { values?: string[] })?.values) ??
                  (Array.isArray(filters[col]) ? (filters[col] as string[]) : []);
                return (
                  <div key={col}>
                    <label className="label block mb-2 truncate" title={col}>
                      {col}
                    </label>
                    <CategoricalFilter
                      column={col}
                      options={options}
                      value={selected}
                      onChange={(v) => update(col, v)}
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {dateCols.length > 0 && (
          <Section title="Date Range">
            <div className="space-y-5">
              {dateCols.map(([col, info]) => {
                const fv = (filters[col] as { start?: string; end?: string }) ?? {};
                return (
                  <div key={col}>
                    <label className="label block mb-2 truncate" title={col}>
                      {col}
                    </label>
                    <DateRangeFilter
                      value={fv}
                      minDate={info.min_date}
                      maxDate={info.max_date}
                      onChange={(v) => update(col, v)}
                    />
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {numericCols.length === 0 && catCols.length === 0 && dateCols.length === 0 && (
          <div
            className="p-4 text-xs text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            No filterable columns detected
          </div>
        )}
      </div>
    </div>
  );
}
