#!/bin/bash
cd /Users/edy/Documents/rag-learning-project/backend
export PYTHONPATH=/Users/edy/Documents/rag-learning-project/backend
exec ./venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001
