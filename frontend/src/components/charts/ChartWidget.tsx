import { useEffect, useState, useCallback, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Brush,
} from 'recharts';
import { Trash2, Settings2, Download, RefreshCw, GripVertical } from 'lucide-react';
import { useStore } from '../../store';
import { api } from '../../utils/api';
import { CHART_COLORS, AGG_OPTIONS, fmt } from '../../utils/helpers';
import type { ChartConfig, ChartData, AggregationType, ChartType } from '../../types';

interface Props {
  chart: ChartConfig;
}

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'histogram', label: 'Histogram' },
];

export function ChartWidget({ chart }: Props) {
  const { datasetId, filters, profile, isDark } = useStore((s) => ({
    datasetId: s.datasetId,
    filters: s.filters,
    profile: s.profile,
    isDark: s.isDark,
  }));
  const { removeChart, updateChart } = useStore((s) => ({
    removeChart: s.removeChart,
    updateChart: s.updateChart,
  }));

  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const columns = profile ? Object.keys(profile.columns) : [];
  const numericCols = profile
    ? Object.entries(profile.columns)
        .filter(([, v]) => v.type === 'numeric')
        .map(([k]) => k)
    : [];

  const fetchData = useCallback(async () => {
    if (!datasetId || !chart.x_column) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.getChartData({
        dataset_id: datasetId,
        chart_type: chart.chart_type,
        x_column: chart.x_column,
        y_column: chart.y_column,
        filters,
        aggregation: chart.aggregation,
      });
      setData(result);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to load chart';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [datasetId, chart, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportPng = async () => {
    if (!chartRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartRef.current, { backgroundColor: null });
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chart.title}.png`;
    a.click();
  };

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#2d3748' : '#f1f5f9';
  const tooltipBg = isDark ? '#1c2230' : '#fff';
  const tooltipBorder = isDark ? '#2d3748' : '#e2e8f0';

  const tooltipStyle = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: isDark ? '#f1f5f9' : '#0f172a',
  };

  const renderChart = () => {
    if (!data || !data.x || data.x.length === 0) return null;

    const chartData = data.x.map((x, i) => ({ x, y: data.y[i] }));
    const color = chart.color ?? CHART_COLORS[0];

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 10, left: 0, bottom: 40 },
    };

    const xAxisProps = {
      dataKey: 'x',
      tick: { fontSize: 11, fill: textColor },
      angle: -35,
      textAnchor: 'end' as const,
      interval: 'preserveStartEnd' as const,
    };

    const yAxisProps = {
      tick: { fontSize: 11, fill: textColor },
      tickFormatter: (v: number) => fmt(v, 0),
      width: 55,
    };

    if (chart.chart_type === 'pie') {
      const pieData = data.x.map((name, i) => ({ name: String(name), value: data.y[i] as number }));
      return (
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="65%"
            label={({ name, percent }) =>
              `${String(name).slice(0, 12)}… ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
        </PieChart>
      );
    }

    if (chart.chart_type === 'scatter') {
      return (
        <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="x"
            type="number"
            name={data.x_label}
            tick={{ fontSize: 11, fill: textColor }}
            tickFormatter={(v) => fmt(v, 1)}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={data.y_label}
            tick={{ fontSize: 11, fill: textColor }}
            tickFormatter={(v) => fmt(v, 1)}
            width={55}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(v: number) => fmt(v)}
          />
          <Scatter data={chartData} fill={color} opacity={0.7} />
        </ScatterChart>
      );
    }

    if (chart.chart_type === 'line') {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
          <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
            name={data.y_label}
          />
          {chartData.length > 30 && <Brush dataKey="x" height={20} stroke={color} />}
        </LineChart>
      );
    }

    // Bar or histogram
    return (
      <BarChart {...commonProps} barSize={chartData.length > 20 ? undefined : 32}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmt(v)} />
        <Legend wrapperStyle={{ fontSize: '11px', color: textColor }} />
        <Bar dataKey="y" name={data.y_label ?? 'Value'} radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <div
      ref={chartRef}
      className="card flex flex-col animate-in"
      style={{ minHeight: 360 }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 pt-4 pb-2"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <GripVertical size={14} style={{ color: 'var(--text-muted)' }} className="cursor-grab" />
        <input
          className="flex-1 text-sm font-semibold bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
          value={chart.title}
          onChange={(e) => updateChart(chart.id, { title: e.target.value })}
          placeholder="Chart title"
        />
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => fetchData()}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            title="Refresh"
          >
            <RefreshCw size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={handleExportPng}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            title="Export PNG"
          >
            <Download size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            title="Configure"
          >
            <Settings2
              size={13}
              style={{ color: editing ? 'var(--brand)' : 'var(--text-muted)' }}
            />
          </button>
          <button
            onClick={() => removeChart(chart.id)}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            title="Remove"
          >
            <Trash2 size={13} style={{ color: '#ef4444' }} />
          </button>
        </div>
      </div>

      {/* Config panel */}
      {editing && (
        <div
          className="px-4 py-3 grid grid-cols-2 gap-2 text-xs"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}
        >
          <div>
            <label className="label block mb-1">Chart Type</label>
            <select
              className="input-base text-xs"
              value={chart.chart_type}
              onChange={(e) => updateChart(chart.id, { chart_type: e.target.value as ChartType })}
            >
              {CHART_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Aggregation</label>
            <select
              className="input-base text-xs"
              value={chart.aggregation}
              onChange={(e) =>
                updateChart(chart.id, { aggregation: e.target.value as AggregationType })
              }
            >
              {AGG_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-1">X Axis</label>
            <select
              className="input-base text-xs"
              value={chart.x_column}
              onChange={(e) => updateChart(chart.id, { x_column: e.target.value })}
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label block mb-1">Y Axis</label>
            <select
              className="input-base text-xs"
              value={chart.y_column ?? ''}
              onChange={(e) => updateChart(chart.id, { y_column: e.target.value || null })}
            >
              <option value="">— none —</option>
              {numericCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label block mb-1">Color</label>
            <div className="flex gap-1 flex-wrap">
              {CHART_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateChart(chart.id, { color: c })}
                  className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: c,
                    borderColor: chart.color === c ? 'var(--text-primary)' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart area */}
      <div className="flex-1 p-4 min-h-[260px]">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }}
            />
          </div>
        )}
        {error && (
          <div
            className="flex items-center justify-center h-full text-sm text-center px-4"
            style={{ color: '#ef4444' }}
          >
            {error}
          </div>
        )}
        {!loading && !error && data && (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            {renderChart() ?? <div />}
          </ResponsiveContainer>
        )}
        {!loading && !error && !data && (
          <div
            className="flex items-center justify-center h-full text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            No data available
          </div>
        )}
      </div>
    </div>
  );
}
