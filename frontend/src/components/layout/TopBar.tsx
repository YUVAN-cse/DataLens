import { Moon, Sun, PanelLeftClose, PanelLeft, FileText, UploadCloud, X } from 'lucide-react';
import { useStore } from '../../store';

export function TopBar() {
  const { filename, isDark, sidebarOpen, activeTab, datasetId } = useStore((s) => ({
    filename: s.filename,
    isDark: s.isDark,
    sidebarOpen: s.sidebarOpen,
    activeTab: s.activeTab,
    datasetId: s.datasetId,
  }));
  const { toggleDark, toggleSidebar, setActiveTab, reset } = useStore((s) => ({
    toggleDark: s.toggleDark,
    toggleSidebar: s.toggleSidebar,
    setActiveTab: s.setActiveTab,
    reset: s.reset,
  }));

  const TABS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'data', label: 'Data' },
    { id: 'profile', label: 'Profile' },
  ] as const;

  return (
    <header
      className="flex items-center gap-3 px-4 h-12 flex-shrink-0"
      style={{
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
    >
      {/* Sidebar toggle */}
      {datasetId && (
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? (
            <PanelLeftClose size={16} style={{ color: 'var(--text-muted)' }} />
          ) : (
            <PanelLeft size={16} style={{ color: 'var(--text-muted)' }} />
          )}
        </button>
      )}

      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--brand)' }}
        >
          <FileText size={13} color="white" />
        </div>
        <span
          className="font-bold text-sm hidden sm:block"
          style={{ fontFamily: 'Syne', color: 'var(--text-primary)' }}
        >
          DataLens
        </span>
      </div>

      {/* Filename chip */}
      {filename && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'var(--brand-light)',
            color: 'var(--brand)',
            maxWidth: 200,
          }}
        >
          <span className="truncate">{filename}</span>
          <button
            onClick={reset}
            className="flex-shrink-0 hover:opacity-70"
            title="Remove dataset"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* Tabs */}
      {datasetId && (
        <nav className="flex items-center gap-0.5 ml-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background:
                  activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color:
                  activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {datasetId && (
          <button
            onClick={reset}
            className="btn-secondary flex items-center gap-1.5 text-xs hidden sm:flex"
            title="Upload new file"
          >
            <UploadCloud size={13} />
            New
          </button>
        )}
        <button
          onClick={toggleDark}
          className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
          title="Toggle dark mode"
        >
          {isDark ? (
            <Sun size={15} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={15} style={{ color: 'var(--text-muted)' }} />
          )}
        </button>
      </div>
    </header>
  );
}
