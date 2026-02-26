#!/bin/bash

# RAG Learning Project 启动脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "=== RAG Learning Project 启动 ==="

# 安装后端依赖
echo "[1/4] 安装后端依赖..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
pip install pydantic-settings > /dev/null 2>&1

# 安装前端依赖
echo "[2/4] 安装前端依赖..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    npm install
fi

# 启动后端
echo "[3/4] 启动后端服务 (http://localhost:8000)..."
cd "$BACKEND_DIR"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "[4/4] 启动前端服务 (http://localhost:3000)..."
cd "$FRONTEND_DIR"
npm start &
FRONTEND_PID=$!

echo ""
echo "=== 服务已启动 ==="
echo "后端: http://localhost:8000"
echo "前端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
