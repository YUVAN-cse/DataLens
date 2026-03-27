import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Hash, BarChart2, Layers } from 'lucide-react';
import { useStore } from '../../store';
import { api } from '../../utils/api';
import { fmt, fmtInt } from '../../utils/helpers';
import type { KPIs } from '../../types';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay?: number;
}

function KPICard({ icon, label, value, sub, color, delay = 0 }: KPICardProps) {
  return (
    <div
      className="card p-4 animate-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: color + '20' }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
      <p className="label mb-1">{label}</p>
      <p
        className="text-2xl font-bold tracking-tight"
        style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function KPICards() {
  const { datasetId, filters, profile } = useStore((s) => ({
    datasetId: s.datasetId,
    filters: s.filters,
    profile: s.profile,
  }));
  const setKpis = useStore((s) => s.setKpis);
  const [kpis, setLocalKpis] = useState<KPIs | null>(null);

  const fetchKpis = useCallback(async () => {
    if (!datasetId) return;
    try {
      const result = await api.filterData(datasetId, filters, 1, 1);
      setLocalKpis(result.kpis);
      setKpis(result.kpis);
    } catch {
      // silent
    }
  }, [datasetId, filters, setKpis]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  if (!kpis || !profile) return null;

  const totalRows = profile.total_rows;
  const numericCols = Object.entries(profile.columns).filter(
    ([, v]) => v.type === 'numeric'
  );
  const filteredRows = kpis.total_rows;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <KPICard
        icon={<Layers size={16} />}
        label="Total Rows"
        value={fmtInt(totalRows)}
        sub={
          filteredRows !== totalRows
            ? `${fmtInt(filteredRows)} filtered`
            : 'all records'
        }
        color="#6366f1"
        delay={0}
      />
      <KPICard
        icon={<Hash size={16} />}
        label="Columns"
        value={String(profile.total_columns)}
        sub={`${numericCols.length} numeric`}
        color="#14b88f"
        delay={0.05}
      />
      {kpis.sum != null && (
        <KPICard
          icon={<TrendingUp size={16} />}
          label={`Sum · ${kpis.primary_metric}`}
          value={fmt(kpis.sum)}
          sub={`avg ${fmt(kpis.mean)}`}
          color="#f59e0b"
          delay={0.1}
        />
      )}
      {kpis.max != null && kpis.min != null && (
        <KPICard
          icon={<BarChart2 size={16} />}
          label={`Range · ${kpis.primary_metric}`}
          value={`${fmt(kpis.min)} – ${fmt(kpis.max)}`}
          sub="min → max"
          color="#ef4444"
          delay={0.15}
        />
      )}
    </div>
  );
}
