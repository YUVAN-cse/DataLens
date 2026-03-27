import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import { TopBar } from './components/layout/TopBar';
import { FiltersSidebar } from './components/filters/FiltersSidebar';
import { DashboardPanel } from './components/layout/DashboardPanel';
import { DataTable } from './components/layout/DataTable';
import { ProfilePanel } from './components/layout/ProfilePanel';
import { UploadZone } from './components/upload/UploadZone';

export default function App() {
  const { isDark, datasetId, sidebarOpen, activeTab } = useStore((s) => ({
    isDark: s.isDark,
    datasetId: s.datasetId,
    sidebarOpen: s.sidebarOpen,
    activeTab: s.activeTab,
  }));

  // Sync dark mode to document class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      <TopBar />

      {!datasetId ? (
        <main className="flex-1 overflow-y-auto">
          <UploadZone />
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className="flex-shrink-0 overflow-y-auto transition-all duration-200"
            style={{
              width: sidebarOpen ? 260 : 0,
              opacity: sidebarOpen ? 1 : 0,
              overflow: sidebarOpen ? 'auto' : 'hidden',
            }}
          >
            <FiltersSidebar />
          </aside>

          {/* Main panel */}
          <main className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'dashboard' && <DashboardPanel />}
            {activeTab === 'data' && (
              <div className="flex-1 overflow-y-auto p-5">
                <DataTable />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="flex-1 overflow-y-auto p-5">
                <ProfilePanel />
              </div>
            )}
          </main>
        </div>
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: isDark ? '#1c2230' : '#fff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${isDark ? '#2d3748' : '#e2e8f0'}`,
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />
    </div>
  );
}
