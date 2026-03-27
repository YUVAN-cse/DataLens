# DataLens — CSV to Interactive Dashboard

A production-ready full-stack application that transforms any CSV file into a rich, interactive analytics dashboard.


## ✨ Features

- **Drag-and-drop CSV upload** with validation (type + 50MB size limit)
- **Automatic data profiling** — column types, stats, nulls, cardinality
- **Dynamic dashboard builder** — add unlimited charts with live config
- **Smart chart recommendations** based on detected column types
- **Filter panel** — range sliders, category checkboxes, date pickers
- **KPI cards** — row count, sum/avg/min/max of primary metric
- **Data table** — paginated, filterable, exportable
- **CSV export** of filtered data
- **PNG export** for any chart
- **Dark / light mode** toggle
- **State persistence** via localStorage
- **Responsive layout** — works on tablets and desktops

---

## 🗂 Project Structure

```
csv-dashboard/
├── backend/               # FastAPI + Pandas
│   ├── main.py            # All API endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── start.sh
├── frontend/              # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/    # ChartWidget, AddChartPanel
│   │   │   ├── filters/   # FiltersSidebar
│   │   │   ├── kpi/       # KPICards
│   │   │   ├── layout/    # TopBar, DashboardPanel, DataTable, ProfilePanel
│   │   │   └── upload/    # UploadZone
│   │   ├── store/         # Zustand global state
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # API client, helpers
│   ├── Dockerfile
│   └── package.json
├── docker/
│   └── docker-compose.yml
└── shared/
    └── sample_sales_data.csv   # Example dataset (120 rows)
```

---

## 🚀 Quick Start

### Option A — Manual (Development)

**Prerequisites:** Python 3.10+, Node.js 18+

#### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API will be live at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App will open at **http://localhost:3000**

---

### Option B — Docker Compose

```bash
# From the docker/ directory
docker compose up --build
```

- Frontend → **http://localhost:3000**
- Backend  → **http://localhost:8000**

---

## 📊 Example CSV

Use `shared/sample_sales_data.csv` (120 rows, e-commerce orders) to test the app immediately.

**Columns:**
- `order_date` (datetime) → enables time-series line charts
- `region`, `category`, `product`, `status` (categorical) → enable bar/pie charts
- `quantity`, `unit_price`, `total_sales`, `profit`, `discount` (numeric) → enable scatter/histogram

**Suggested charts to try:**
1. Line chart: `order_date` × `total_sales`
2. Bar chart: `category` × `profit` (aggregation: sum)
3. Pie chart: `region` × `total_sales`
4. Scatter chart: `unit_price` × `profit`
5. Histogram: `total_sales`

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/upload` | Upload CSV → returns profile + recommendations |
| `GET` | `/data/{id}` | Paginated raw data |
| `POST` | `/filter` | Filter + paginate + KPIs |
| `POST` | `/chart-data` | Aggregated data for a chart |
| `POST` | `/export/csv` | Download filtered data as CSV |
| `GET` | `/profile/{id}` | Full column profile |
| `DELETE` | `/dataset/{id}` | Remove dataset from memory |

---

## ☁️ Deployment Guide

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Runtime:** Python 3
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Copy your service URL (e.g. `https://csv-api.onrender.com`)

### Frontend → Vercel

1. Push frontend to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy — Vercel handles the build automatically

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend base URL |
| `MAX_FILE_SIZE` | 50MB | Maximum CSV upload size |
| `CHUNK_SIZE` | 10,000 rows | Pagination chunk size |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Pandas, NumPy, Uvicorn |
| Frontend | React 18, TypeScript, Vite |
| Charts | Recharts |
| Styling | Tailwind CSS |
| State | Zustand (+ localStorage persistence) |
| Upload | react-dropzone |
| Notifications | react-hot-toast |
| Fonts | Syne, DM Sans, JetBrains Mono |
| Containerization | Docker, nginx |

---

## 📄 License

MIT
