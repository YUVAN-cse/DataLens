import axios from 'axios';
import type {
  UploadResponse,
  ChartData,
  KPIs,
} from '../types';

const API_BASE = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
});

export const api = {
  async uploadCsv(file: File): Promise<UploadResponse> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await client.post<UploadResponse>('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getData(
    datasetId: string,
    page = 1,
    pageSize = 100
  ): Promise<{ data: Record<string, unknown>[]; total_rows: number; total_pages: number }> {
    const { data } = await client.get(`/data/${datasetId}`, {
      params: { page, page_size: pageSize },
    });
    return data;
  },

  async filterData(
    datasetId: string,
    filters: Record<string, unknown>,
    page = 1,
    pageSize = 100
  ): Promise<{
    data: Record<string, unknown>[];
    total_rows: number;
    total_pages: number;
    kpis: KPIs;
  }> {
    const { data } = await client.post('/filter', {
      dataset_id: datasetId,
      filters,
      page,
      page_size: pageSize,
    });
    return data;
  },

  async getChartData(payload: {
    dataset_id: string;
    chart_type: string;
    x_column: string;
    y_column?: string | null;
    filters?: Record<string, unknown>;
    aggregation?: string;
  }): Promise<ChartData> {
    const { data } = await client.post<ChartData>('/chart-data', payload);
    return data;
  },

  async exportCsv(
    datasetId: string,
    filters: Record<string, unknown>
  ): Promise<Blob> {
    const { data } = await client.post(
      '/export/csv',
      { dataset_id: datasetId, filters },
      { responseType: 'blob' }
    );
    return data;
  },

  async health(): Promise<{ status: string }> {
    const { data } = await client.get('/health');
    return data;
  },
};
