import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useStore } from '../../store';
import { api } from '../../utils/api';
import { downloadBlob, typeColor, typeBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PAGE_SIZE = 50;

export function DataTable() {
  const { datasetId, filters, profile } = useStore((s) => ({
    datasetId: s.datasetId,
    filters: s.filters,
    profile: s.profile,
  }));

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchPage = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      const result = await api.filterData(datasetId, filters, page, PAGE_SIZE);
      setRows(result.data);
      setTotalPages(result.total_pages);
      setTotalRows(result.total_rows);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [datasetId, filters, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleExport = async () => {
    if (!datasetId) return;
    setExporting(true);
    try {
      const blob = await api.exportCsv(datasetId, filters);
      downloadBlob(blob, 'filtered_data.csv');
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!profile || rows.length === 0 && !loading) {
    return (
      <div
        className="flex items-center justify-center h-64 text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        {loading ? 'Loading…' : 'No data'}
      </div>
    );
  }

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {totalRows.toLocaleString()} rows
          {Object.keys(filters).length > 0 && ' (filtered)'}
        </span>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-secondary flex items-center gap-1.5 text-xs"
        >
          <Download size={13} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {columns.map((col) => {
                  const info = profile.columns[col];
                  const color = info ? typeColor(info.type) : '#94a3b8';
                  const badge = info ? typeBadge(info.type) : '?';
                  return (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left font-semibold whitespace-nowrap"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="px-1 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={{ background: color + '20', color }}
                        >
                          {badge}
                        </span>
                        {col}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{
                          borderColor: 'var(--brand)',
                          borderTopColor: 'transparent',
                        }}
                      />
                      Loading…
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, ri) => (
                  <tr
                    key={ri}
                    style={{
                      borderTop: '1px solid var(--border)',
                      background:
                        ri % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)',
                    }}
                  >
                    {columns.map((col) => {
                      const val = row[col];
                      const isNull = val == null || val === '';
                      return (
                        <td
                          key={col}
                          className="px-3 py-2 max-w-[180px] truncate"
                          style={{
                            color: isNull ? 'var(--text-muted)' : 'var(--text-primary)',
                            fontFamily: isNull ? 'inherit' : 'inherit',
                          }}
                          title={isNull ? 'null' : String(val)}
                        >
                          {isNull ? (
                            <span className="italic">null</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={14} style={{ color: 'var(--text-primary)' }} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p =
                totalPages <= 5
                  ? i + 1
                  : page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                  ? totalPages - 4 + i
                  : page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-7 h-7 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: p === page ? 'var(--brand)' : 'var(--bg-secondary)',
                    color: p === page ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg disabled:opacity-30 hover:opacity-70 transition-opacity"
            >
              <ChevronRight size={14} style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
