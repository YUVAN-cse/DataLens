# DataLens — CSV to Interactive Dashboard

A production-ready full-stack application that transforms any CSV file into a rich, interactive analytics dashboard.

![DataLens Dashboard](https://via.placeholder.com/1200x600/0c1117/14b88f?text=DataLens+Dashboard)

---

## ✨ Features

- **Drag-and-drop CSV upload** with validation (type + 50MB size limit)
- **Automatic data profiling** — column types, stats, nulls, cardinality
- **Dynamic dashboard builder** — add unlimited charts with live configuration
- **Smart chart recommendations** based on detected column types
- **Filter panel** — range sliders, category checkboxes, date pickers
- **KPI cards** — row count, sum/avg/min/max of primary metrics
- **Data table** — paginated, filterable, exportable
- **CSV export** of filtered data
- **PNG export** for any chart
- **Dark / light mode** toggle
- **State persistence** via localStorage
- **Responsive layout** — works on tablets and desktops

---

## 🗂 Project Structure


csv-dashboard/
├── backend/ # FastAPI + Pandas
│ ├── main.py # All API endpoints
│ ├── requirements.txt
│ ├── Dockerfile
│ └── start.sh
├── frontend/ # React + TypeScript + Tailwind
│ ├── src/
│ │ ├── components/
│ │ │ ├── charts/ # ChartWidget, AddChartPanel
│ │ │ ├── filters/ # FiltersSidebar
│ │ │ ├── kpi/ # KPICards
│ │ │ ├── layout/ # TopBar, DashboardPanel, DataTable, ProfilePanel
│ │ │ └── upload/ # UploadZone
│ │ ├── store/ # Zustand global state
│ │ ├── types/ # TypeScript interfaces
│ │ └── utils/ # API client, helpers
│ ├── Dockerfile
│ └── package.json
├── docker/
│ └── docker-compose.yml
└── shared/
└── sample_sales_data.csv # Example dataset (120 rows)


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
Backend runs at: http://localhost:8000
Swagger docs: http://localhost:8000/docs
2. Frontend
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:3000

The frontend communicates with the backend automatically.

Option B — Docker Compose
# From the docker/ directory
docker compose up --build
Frontend → http://localhost:3000
Backend → http://localhost:8000
📊 Example CSV

Use shared/sample_sales_data.csv (120 rows, e-commerce orders) to test the app.

Columns:

order_date (datetime) → time-series charts
region, category, product, status (categorical) → bar/pie charts
quantity, unit_price, total_sales, profit, discount (numeric) → scatter/histogram

Suggested charts to try:

Line chart: order_date × total_sales
Bar chart: category × profit (sum)
Pie chart: region × total_sales
Scatter chart: unit_price × profit
Histogram: total_sales
🔌 API Reference
Method	Endpoint	Description
GET	/health	Health check
POST	/upload	Upload CSV → returns profile + recommendations
GET	/data/{id}	Paginated raw data
POST	/filter	Filter + paginate + KPIs
POST	/chart-data	Aggregated data for a chart
POST	/export/csv	Download filtered data as CSV
GET	/profile/{id}	Full column profile
DELETE	/dataset/{id}	Remove dataset from memory
🛠 Tech Stack
Layer	Technology
Backend	FastAPI, Pandas, NumPy, Uvicorn
Frontend	React 18, TypeScript, Vite
Charts	Recharts
Styling	Tailwind CSS
State	Zustand (+ localStorage)
Upload	react-dropzone
Notifications	react-hot-toast
Fonts	Syne, DM Sans, JetBrains Mono
Containerization	Docker, nginx
📄 License

MIT


---

✅ This version:  
- Fixed small Markdown issues (`#` levels, headings consistency)  
- Removed duplicate sections  
- Polished feature descriptions  
- Corrected terminal commands for cross-platform clarity  

---