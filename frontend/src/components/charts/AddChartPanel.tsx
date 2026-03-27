import { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store';
import { generateId, CHART_COLORS } from '../../utils/helpers';
import type { ChartType, AggregationType } from '../../types';

const CHART_TYPES: { value: ChartType; label: string; icon: string }[] = [
  { value: 'bar', label: 'Bar', icon: '▬' },
  { value: 'line', label: 'Line', icon: '↗' },
  { value: 'pie', label: 'Pie', icon: '◔' },
  { value: 'scatter', label: 'Scatter', icon: '⊡' },
  { value: 'histogram', label: 'Histogram', icon: '▪' },
];

export function AddChartPanel() {
  const { profile, recommendations, addChart } = useStore((s) => ({
    profile: s.profile,
    recommendations: s.recommendations,
    addChart: s.addChart,
  }));

  const [open, setOpen] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [agg, setAgg] = useState<AggregationType>('sum');
  const [title, setTitle] = useState('');

  if (!profile) return null;

  const columns = Object.keys(profile.columns);
  const numericCols = Object.entries(profile.columns)
    .filter(([, v]) => v.type === 'numeric')
    .map(([k]) => k);

  const handleAdd = () => {
    if (!xCol) return;
    addChart({
      id: generateId(),
      title: title || `${chartType} · ${xCol}${yCol ? ` × ${yCol}` : ''}`,
      chart_type: chartType,
      x_column: xCol,
      y_column: yCol || null,
      aggregation: agg,
      color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
    });
    setOpen(false);
    setTitle('');
    setXCol('');
    setYCol('');
  };

  const handleRecommendation = (rec: typeof recommendations[0]) => {
    addChart({
      id: generateId(),
      title: rec.reason,
      chart_type: rec.chart_type,
      x_column: rec.x,
      y_column: rec.y,
      aggregation: 'sum',
      color: CHART_COLORS[0],
    });
  };

  return (
    <div>
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={13} style={{ color: 'var(--brand)' }} />
            <span className="label">Suggested Charts</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendations.map((rec, i) => (
              <button
                key={i}
                onClick={() => handleRecommendation(rec)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: 'var(--brand-light)',
                  color: 'var(--brand)',
                  border: '1px solid var(--brand)',
                }}
              >
                {rec.reason}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Chart Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all hover:scale-[1.01]"
          style={{
            borderColor: 'var(--brand)',
            color: 'var(--brand)',
            background: 'var(--brand-light)',
          }}
        >
          <Plus size={16} />
          Add Chart
        </button>
      )}

      {/* Chart builder panel */}
      {open && (
        <div
          className="rounded-xl p-4 animate-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              New Chart
            </span>
            <button onClick={() => setOpen(false)}>
              <X size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Chart type */}
            <div>
              <label className="label block mb-1.5">Chart Type</label>
              <div className="flex gap-2 flex-wrap">
                {CHART_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setChartType(t.value)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background:
                        chartType === t.value ? 'var(--brand)' : 'var(--bg-secondary)',
                      color: chartType === t.value ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* X Axis */}
            <div>
              <label className="label block mb-1">X Axis</label>
              <select
                className="input-base text-sm"
                value={xCol}
                onChange={(e) => setXCol(e.target.value)}
              >
                <option value="">Select column…</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Y Axis */}
            {chartType !== 'histogram' && (
              <div>
                <label className="label block mb-1">Y Axis (metric)</label>
                <select
                  className="input-base text-sm"
                  value={yCol}
                  onChange={(e) => setYCol(e.target.value)}
                >
                  <option value="">— none —</option>
                  {numericCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Aggregation */}
            {yCol && chartType !== 'scatter' && (
              <div>
                <label className="label block mb-1">Aggregation</label>
                <select
                  className="input-base text-sm"
                  value={agg}
                  onChange={(e) => setAgg(e.target.value as AggregationType)}
                >
                  <option value="sum">Sum</option>
                  <option value="mean">Average</option>
                  <option value="count">Count</option>
                  <option value="max">Maximum</option>
                  <option value="min">Minimum</option>
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="label block mb-1">Title (optional)</label>
              <input
                className="input-base text-sm"
                placeholder="Auto-generated"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!xCol}
              className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
