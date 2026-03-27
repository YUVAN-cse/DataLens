import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DataProfile,
  ChartRecommendation,
  ChartConfig,
  KPIs,
} from '../types';

interface AppStore {
  // Dataset
  datasetId: string | null;
  filename: string | null;
  profile: DataProfile | null;
  recommendations: ChartRecommendation[];
  preview: Record<string, unknown>[];

  // Charts
  charts: ChartConfig[];

  // Filters
  filters: Record<string, unknown>;

  // KPIs
  kpis: KPIs | null;

  // UI
  isDark: boolean;
  sidebarOpen: boolean;
  activeTab: 'dashboard' | 'data' | 'profile';

  // Actions
  setDataset: (payload: {
    datasetId: string;
    filename: string;
    profile: DataProfile;
    recommendations: ChartRecommendation[];
    preview: Record<string, unknown>[];
  }) => void;
  addChart: (chart: ChartConfig) => void;
  updateChart: (id: string, updates: Partial<ChartConfig>) => void;
  removeChart: (id: string) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  setKpis: (kpis: KPIs) => void;
  toggleDark: () => void;
  toggleSidebar: () => void;
  setActiveTab: (tab: 'dashboard' | 'data' | 'profile') => void;
  reset: () => void;
}

const initialState = {
  datasetId: null,
  filename: null,
  profile: null,
  recommendations: [],
  preview: [],
  charts: [],
  filters: {},
  kpis: null,
  isDark: false,
  sidebarOpen: true,
  activeTab: 'dashboard' as const,
};

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialState,

      setDataset: (payload) =>
        set({
          datasetId: payload.datasetId,
          filename: payload.filename,
          profile: payload.profile,
          recommendations: payload.recommendations,
          preview: payload.preview,
          charts: [],
          filters: {},
          kpis: null,
        }),

      addChart: (chart) =>
        set((s) => ({ charts: [...s.charts, chart] })),

      updateChart: (id, updates) =>
        set((s) => ({
          charts: s.charts.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      removeChart: (id) =>
        set((s) => ({ charts: s.charts.filter((c) => c.id !== id) })),

      setFilters: (filters) => set({ filters }),

      setKpis: (kpis) => set({ kpis }),

      toggleDark: () => set((s) => ({ isDark: !s.isDark })),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      setActiveTab: (activeTab) => set({ activeTab }),

      reset: () => set(initialState),
    }),
    {
      name: 'csv-dashboard-state',
      partialize: (s) => ({
        isDark: s.isDark,
        sidebarOpen: s.sidebarOpen,
        // Don't persist large data
      }),
    }
  )
);
