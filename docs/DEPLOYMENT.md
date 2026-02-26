# 部署指南

## 环境要求

### 后端
- Python 3.9+
- 4GB+ RAM (推荐 8GB+)
- 10GB+ 磁盘空间

### 前端
- Node.js 18+
- npm 9+

---

## 本地开发部署

### 1. 克隆项目

```bash
cd /Users/edy/Documents
git clone <your-repo-url> rag-learning-project
cd rag-learning-project
```

### 2. 后端部署

```bash
# 进入后端目录
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 OpenAI API Key
```

### 3. 前端部署

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev
```

### 4. 启动服务

终端 1 - 后端:
```bash
cd backend
python main.py
# 或使用 uvicorn
uvicorn main:app --reload --port 8000
```

终端 2 - 前端:
```bash
cd frontend
npm run dev
```

访问 http://localhost:5173

---

## 生产环境部署

### 方案一：Docker 部署

#### 1. 创建 Dockerfile (后端)
```dockerfile
# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 创建 Dockerfile (前端)
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3. 创建 docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ./indexes:/app/indexes

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

#### 4. 构建和运行
```bash
docker-compose up --build
```

---

### 方案二：传统服务器部署

#### 后端 (使用 systemd)

1. 创建服务文件:
```bash
sudo nano /etc/systemd/system/rag-backend.service
```

2. 配置内容:
```ini
[Unit]
Description=RAG Backend API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/rag-learning-project/backend
Environment="PATH=/home/ubuntu/rag-learning-project/backend/venv/bin"
ExecStart=/home/ubuntu/rag-learning-project/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

3. 启动服务:
```bash
sudo systemctl start rag-backend
sudo systemctl enable rag-backend
```

#### 前端 (使用 Nginx)

1. 构建前端:
```bash
cd frontend
npm run build
```

2. 配置 Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/rag-frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 云平台部署

### AWS

1. **后端**: 使用 EC2 + Docker
2. **前端**: 使用 S3 + CloudFront
3. **数据库**: 可选 RDS (如需持久化存储)

### GCP

1. **后端**: 使用 Cloud Run
2. **前端**: 使用 Firebase Hosting
3. **存储**: Cloud Storage

### 阿里云

1. **后端**: 使用 ECS 或容器服务
2. **前端**: 使用 OSS + CDN

---

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| OPENAI_API_KEY | OpenAI API 密钥 | sk-xxx... |

### 可选变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| OPENAI_MODEL | gpt-3.5-turbo | LLM 模型 |
| EMBEDDING_MODEL | sentence-transformers/... | 向量模型 |
| CHUNK_SIZE | 500 | 文本块大小 |
| CHUNK_OVERLAP | 50 | 文本块重叠 |
| SIMILARITY_TOP_K | 5 | 检索数量 |

---

## 验证部署

### 1. 健康检查
```bash
curl http://localhost:8000/api/health
```

预期响应:
```json
{
  "status": "healthy",
  "embedding_model": "...",
  "vector_store": "faiss",
  "document_count": 0
}
```

### 2. API 文档
访问 http://localhost:8000/docs 查看 Swagger 文档

### 3. 前端测试
1. 打开浏览器访问前端地址
2. 上传测试文档
3. 进行问答测试

---

## 性能优化建议

### 1. 向量模型
- 使用 GPU 加速推理
- 考虑使用更小的模型
- 批量处理多个文档

### 2. 向量数据库
- 使用专用向量数据库
- 定期优化索引
- 考虑数据分区

### 3. LLM 调用
- 添加缓存机制
- 使用流式输出
- 限制并发请求

### 4. 前端
- 启用 gzip 压缩
- 使用 CDN
- 实现请求缓存

---

## 监控和日志

### 后端日志
```bash
# 查看日志
tail -f /var/log/rag-backend.log
```

### 健康监控
建议集成:
- Prometheus + Grafana
- Sentry (错误追踪)
- ELK Stack (日志分析)

---

## 安全建议

1. **API Key 安全**
   - 使用环境变量
   - 轮换密钥
   - 限制 API 调用频率

2. **网络隔离**
   - 使用 VPC
   - 配置安全组
   - 启用 HTTPS

3. **数据安全**
   - 定期备份
   - 加密存储
   - 访问控制

---

## 故障排查

### 常见问题

1. **端口被占用**
```bash
# 查找占用端口的进程
lsof -i :8000
# 杀死进程
kill -9 <PID>
```

2. **内存不足**
- 增加 swap
- 使用更小的模型
- 减少并发

3. **模型下载失败**
- 检查网络
- 使用国内镜像
- 预下载模型
