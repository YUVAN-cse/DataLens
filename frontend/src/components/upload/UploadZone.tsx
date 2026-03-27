import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useStore } from '../../store';

const MAX_SIZE_MB = 50;

export function UploadZone() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const setDataset = useStore((s) => s.setDataset);

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const err = rejected[0]?.errors[0]?.message ?? 'Invalid file';
        toast.error(err);
        return;
      }
      const file = accepted[0];
      if (!file) return;

      setUploading(true);
      setProgress('Reading file…');

      try {
        setProgress('Uploading to server…');
        const result = await api.uploadCsv(file);
        setProgress('Profiling data…');

        setDataset({
          datasetId: result.dataset_id,
          filename: result.filename,
          profile: result.profile,
          recommendations: result.recommendations,
          preview: result.preview,
        });

        toast.success(
          `Loaded ${result.total_rows.toLocaleString()} rows × ${result.total_columns} columns`
        );
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          'Upload failed';
        toast.error(msg);
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [setDataset]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
    maxFiles: 1,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      {/* Logo / Header */}
      <div className="mb-10 text-center animate-in">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand)' }}
          >
            <FileText size={20} color="white" />
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
          >
            DataLens
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-base">
          Upload any CSV file to instantly generate an interactive dashboard
        </p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className="w-full max-w-xl cursor-pointer animate-in stagger-1"
        style={{ animationDelay: '0.1s' }}
      >
        <input {...getInputProps()} />
        <div
          className="relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200"
          style={{
            borderColor: isDragActive
              ? 'var(--brand)'
              : isDragReject
              ? '#ef4444'
              : 'var(--border)',
            background: isDragActive
              ? 'var(--brand-light)'
              : 'var(--bg-card)',
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2
                size={40}
                className="animate-spin"
                style={{ color: 'var(--brand)' }}
              />
              <p style={{ color: 'var(--text-primary)' }} className="font-medium">
                {progress}
              </p>
            </div>
          ) : isDragReject ? (
            <div className="flex flex-col items-center gap-3">
              <AlertCircle size={40} color="#ef4444" />
              <p className="font-medium text-red-500">Only CSV files are accepted</p>
            </div>
          ) : isDragActive ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 size={40} style={{ color: 'var(--brand)' }} />
              <p
                className="font-semibold"
                style={{ color: 'var(--brand)' }}
              >
                Drop it!
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <Upload size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p
                  className="font-semibold text-lg mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Drag &amp; drop your CSV
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  or{' '}
                  <span
                    className="font-medium underline underline-offset-2"
                    style={{ color: 'var(--brand)' }}
                  >
                    browse files
                  </span>
                </p>
              </div>
              <p
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                }}
              >
                CSV only · Max {MAX_SIZE_MB}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Feature hints */}
      <div
        className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xl animate-in stagger-2"
        style={{ animationDelay: '0.2s' }}
      >
        {[
          { icon: '⚡', label: 'Instant profiling' },
          { icon: '📊', label: 'Smart charts' },
          { icon: '🔍', label: 'Live filters' },
        ].map((f) => (
          <div
            key={f.label}
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="text-xl mb-1">{f.icon}</div>
            <div
              className="text-xs font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {f.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
