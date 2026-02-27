#!/bin/bash

# RAG Learning Project 启动脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "=== RAG Learning Project 启动 ==="

# 安装后端依赖
echo "[1/4] 安装后端依赖..."
cd "$BACKEND_DIR"
rm -rf venv
python3 -m venv venv
"$BACKEND_DIR/venv/bin/pip" install -r requirements.txt
"$BACKEND_DIR/venv/bin/pip" install pydantic-settings openai

# 安装前端依赖
echo "[2/4] 安装前端依赖..."
cd "$FRONTEND_DIR"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 启动后端
echo "[3/4] 启动后端服务 (http://localhost:8001)..."
cd "$BACKEND_DIR"
"$BACKEND_DIR/venv/bin/uvicorn" main:app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo "[4/4] 启动前端服务 (http://localhost:3001)..."
cd "$FRONTEND_DIR"
PORT=3001 npm start &
FRONTEND_PID=$!

echo ""
echo "=== 服务已启动 ==="
echo "后端: http://localhost:8001"
echo "前端: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

wait
