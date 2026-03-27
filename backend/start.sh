#!/usr/bin/env bash
set -e

echo "📦 Installing backend dependencies..."
cd "$(dirname "$0")"

python -m venv .venv 2>/dev/null || true
source .venv/bin/activate

pip install -q -r requirements.txt

echo "🚀 Starting FastAPI server at http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000
