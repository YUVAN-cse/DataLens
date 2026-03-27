"""
CSV to Interactive Dashboard - FastAPI Backend
"""

import uuid
import math
import logging
from typing import Any, Dict
from pathlib import Path
from datetime import datetime
import io

import pandas as pd
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------- Logging ---------------- #
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- App Setup ---------------- #
app = FastAPI(title="CSV Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Globals ---------------- #
datasets: dict[str, dict] = {}
UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

# ---------------- Models ---------------- #


from fastapi import Body

@app.post("/chart-data")
def chart_data(payload: dict = Body(...)):
    dataset_id = payload.get("dataset_id")
    chart_type = payload.get("chart_type")
    x_column = payload.get("x_column")
    y_column = payload.get("y_column")
    filters = payload.get("filters", {})
    aggregation = payload.get("aggregation", None)

    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[dataset_id]["df"].copy()

    # Apply filters
    for col, value in filters.items():
        if col in df.columns:
            if isinstance(value, list):
                df = df[df[col].isin(value)]
            else:
                df = df[df[col] == value]

    # Prepare chart data
    if chart_type in ["bar", "line"] and y_column:
        if aggregation == "sum":
            grouped = df.groupby(x_column)[y_column].sum().reset_index()
        elif aggregation == "mean":
            grouped = df.groupby(x_column)[y_column].mean().reset_index()
        else:
            grouped = df.groupby(x_column)[y_column].sum().reset_index()  # default sum

        return {
            "x": grouped[x_column].tolist(),
            "y": grouped[y_column].tolist()
        }

    elif chart_type == "pie":
        counts = df[x_column].value_counts()
        return {
            "labels": counts.index.tolist(),
            "values": counts.values.tolist()
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid chart type or missing y_column")
        
class FilterRequest(BaseModel):
    dataset_id: str
    filters: Dict[str, Any] = {}
    page: int = 1
    page_size: int = 100

# ---------------- Helpers ---------------- #
def detect_column_type(series: pd.Series) -> str:
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    return "categorical"

def profile_dataframe(df: pd.DataFrame) -> dict:
    profile = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "missing_summary": {},
        "columns": {}
    }

    total_rows = len(df)

    for col in df.columns:
        series = df[col]
        col_type = detect_column_type(series)

        nulls = int(series.isna().sum())
        unique = int(series.nunique())

        col_info = {
            "type": col_type,
            "nulls": nulls,
            "unique_count": unique,
            "null_pct": (nulls / total_rows * 100) if total_rows > 0 else 0,
        }

        # Numeric stats
        if col_type == "numeric":
            col_info.update({
                "min": float(series.min()) if not series.isna().all() else None,
                "max": float(series.max()) if not series.isna().all() else None,
                "median": float(series.median()) if not series.isna().all() else None,
                "q25": float(series.quantile(0.25)) if not series.isna().all() else None,
                "q75": float(series.quantile(0.75)) if not series.isna().all() else None,
            })

        # Categorical stats
        elif col_type == "categorical":
            top_vals = series.value_counts(dropna=True).head(5).to_dict()
            col_info["top_values"] = [
                {"value": str(k), "count": int(v)} for k, v in top_vals.items()
            ]

        # Datetime stats
        elif col_type == "datetime":
            col_info["min_date"] = str(series.min()) if not series.isna().all() else None
            col_info["max_date"] = str(series.max()) if not series.isna().all() else None

        profile["columns"][col] = col_info
        profile["missing_summary"][col] = nulls

    return profile

# ---------------- Routes ---------------- #
@app.get("/")
def home():
    return {"message": "API running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large")

    try:
        df = pd.read_csv(io.BytesIO(content))
        dataset_id = str(uuid.uuid4())
        profile = profile_dataframe(df)

        datasets[dataset_id] = {
            "df": df,
            "profile": profile
        }

        return {
            "dataset_id": dataset_id,
            "filename": file.filename,
            "profile": profile,
            "recommendations": [],
            "preview": df.head(50).to_dict(orient="records"),
            "total_rows": len(df),
            "total_columns": len(df.columns),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/filter")
def filter_data(req: FilterRequest):
    if req.dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[req.dataset_id]["df"]
    filtered_df = df.copy()

    # Apply filters
    for col, value in req.filters.items():
        if col not in filtered_df.columns or value is None:
            continue
        if isinstance(value, list):
            filtered_df = filtered_df[filtered_df[col].isin(value)]
        else:
            filtered_df = filtered_df[filtered_df[col] == value]

    total_rows = len(filtered_df)
    total_pages = math.ceil(total_rows / req.page_size) if total_rows > 0 else 1

    # Pagination
    start = (req.page - 1) * req.page_size
    end = start + req.page_size
    page_df = filtered_df.iloc[start:end]

    return {
        "data": page_df.to_dict(orient="records"),
        "total_rows": total_rows,
        "total_pages": total_pages,
        "kpis": {
            "rows": total_rows
        }
    }

@app.get("/data/{dataset_id}")
def get_data(dataset_id: str, page: int = 1, page_size: int = 100):
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[dataset_id]["df"]
    total_rows = len(df)
    total_pages = math.ceil(total_rows / page_size) if total_rows > 0 else 1

    start = (page - 1) * page_size
    end = start + page_size
    page_df = df.iloc[start:end]

    return {
        "data": page_df.to_dict(orient="records"),
        "total_rows": total_rows,
        "total_pages": total_pages
    }

@app.post("/export/csv")
def export_csv(payload: FilterRequest):
    if payload.dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    df = datasets[payload.dataset_id]["df"].copy()

    # Apply filters
    for col, value in payload.filters.items():
        if col not in df.columns or value is None:
            continue
        if isinstance(value, list):
            df = df[df[col].isin(value)]
        else:
            df = df[df[col] == value]

    stream = io.StringIO()
    df.to_csv(stream, index=False)
    stream.seek(0)
    return stream.getvalue()

# Optional: Add /chart-data route here if needed