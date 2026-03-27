export interface ColumnProfile {
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  null_count: number;
  null_pct: number;
  unique_count: number;
  // numeric
  mean?: number | null;
  median?: number | null;
  std?: number | null;
  min?: number | null;
  max?: number | null;
  q25?: number | null;
  q75?: number | null;
  // categorical
  top_values?: { value: string; count: number }[];
  // datetime
  min_date?: string | null;
  max_date?: string | null;
}

export interface DataProfile {
  total_rows: number;
  total_columns: number;
  columns: Record<string, ColumnProfile>;
  missing_summary: Record<string, number>;
}

export interface ChartRecommendation {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';
  x: string;
  y: string | null;
  reason: string;
  confidence: number;
}

export interface UploadResponse {
  dataset_id: string;
  filename: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  profile: DataProfile;
  recommendations: ChartRecommendation[];
  preview: Record<string, unknown>[];
}

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';
export type AggregationType = 'sum' | 'mean' | 'count' | 'max' | 'min';

export interface ChartConfig {
  id: string;
  title: string;
  chart_type: ChartType;
  x_column: string;
  y_column: string | null;
  aggregation: AggregationType;
  color?: string;
}

export interface FilterValue {
  // numeric range
  min?: number;
  max?: number;
  // categorical
  values?: string[];
  // datetime range
  start?: string;
  end?: string;
}

export type Filters = Record<string, FilterValue>;

export interface KPIs {
  total_rows: number;
  primary_metric?: string;
  sum?: number | null;
  mean?: number | null;
  min?: number | null;
  max?: number | null;
}

export interface ChartData {
  x: (string | number)[];
  y: (string | number)[];
  chart_type: string;
  x_label?: string;
  y_label?: string;
}

export interface DatasetState {
  dataset_id: string | null;
  filename: string | null;
  profile: DataProfile | null;
  recommendations: ChartRecommendation[];
  preview: Record<string, unknown>[];
  charts: ChartConfig[];
  filters: Record<string, unknown>;
  kpis: KPIs | null;
  isDark: boolean;
}
