import { useStore } from '../../store';
import { ChartWidget } from '../charts/ChartWidget';
import { AddChartPanel } from '../charts/AddChartPanel';
import { KPICards } from '../kpi/KPICards';
import { LayoutGrid } from 'lucide-react';

export function DashboardPanel() {
  const charts = useStore((s) => s.charts);
  const profile = useStore((s) => s.profile);

  if (!profile) return null;

  return (
    <div className="p-5 flex-1 overflow-y-auto">
      {/* KPIs */}
      <KPICards />

      {/* Empty state */}
      {charts.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-16 mb-6 rounded-2xl border-2 border-dashed animate-in"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <LayoutGrid size={22} style={{ color: 'var(--text-muted)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            No charts yet
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Use the panel below to add charts, or pick a suggestion
          </p>
        </div>
      )}

      {/* Chart grid */}
      {charts.length > 0 && (
        <div
          className="grid gap-4 mb-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))',
          }}
        >
          {charts.map((chart) => (
            <ChartWidget key={chart.id} chart={chart} />
          ))}
        </div>
      )}

      {/* Add Chart */}
      <AddChartPanel />
    </div>
  );
}
