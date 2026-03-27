import { useStore } from '../../store';
import { typeColor, typeBadge, fmt, fmtInt } from '../../utils/helpers';

export function ProfilePanel() {
  const profile = useStore((s) => s.profile);

  if (!profile) return null;

  const cols = Object.entries(profile.columns);
  const numericCols = cols.filter(([, v]) => v.type === 'numeric');
  const catCols = cols.filter(([, v]) => v.type === 'categorical');
  const dateCols = cols.filter(([, v]) => v.type === 'datetime');

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Rows', value: fmtInt(profile.total_rows) },
          { label: 'Total Columns', value: String(profile.total_columns) },
          {
            label: 'Missing Values',
            value: fmtInt(
              Object.values(profile.missing_summary).reduce((a, b) => a + b, 0)
            ),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="card p-4 text-center"
          >
            <p className="label mb-1">{s.label}</p>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Column breakdown */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Column Summary
        </h3>
        <div className="space-y-2">
          {cols.map(([col, info]) => {
            const color = typeColor(info.type);
            const badge = typeBadge(info.type);
            const nullPct = info.null_pct;

            return (
              <div
                key={col}
                className="card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0"
                      style={{ background: color + '20', color }}
                    >
                      {badge}
                    </span>
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {col}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{info.unique_count} unique</span>
                    {nullPct > 0 && (
                      <span style={{ color: nullPct > 10 ? '#ef4444' : 'var(--text-muted)' }}>
                        {nullPct.toFixed(1)}% null
                      </span>
                    )}
                  </div>
                </div>

                {/* Null bar */}
                {nullPct > 0 && (
                  <div
                    className="mt-2 h-1 rounded-full overflow-hidden"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${nullPct}%`, background: '#ef4444' }}
                    />
                  </div>
                )}

                {/* Numeric stats */}
                {info.type === 'numeric' && (
                  <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
                    {[
                      { label: 'Min', val: info.min },
                      { label: 'Q25', val: info.q25 },
                      { label: 'Median', val: info.median },
                      { label: 'Q75', val: info.q75 },
                      { label: 'Max', val: info.max },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="text-center p-1.5 rounded-lg"
                        style={{ background: 'var(--bg-secondary)' }}
                      >
                        <p className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                          {fmt(s.val)}
                        </p>
                        <p style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Categorical top values */}
                {info.type === 'categorical' && info.top_values && (
                  <div className="mt-2 space-y-1">
                    {info.top_values.slice(0, 5).map((tv) => {
                      const pct =
                        (tv.count / profile.total_rows) * 100;
                      return (
                        <div key={tv.value} className="flex items-center gap-2">
                          <span
                            className="text-xs truncate flex-1"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {tv.value}
                          </span>
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--bg-secondary)' }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                          <span
                            className="text-xs tabular-nums flex-shrink-0"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {tv.count.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Datetime range */}
                {info.type === 'datetime' && (
                  <div className="mt-2 flex gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>From: <strong>{info.min_date?.slice(0, 10) ?? '—'}</strong></span>
                    <span>To: <strong>{info.max_date?.slice(0, 10) ?? '—'}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
