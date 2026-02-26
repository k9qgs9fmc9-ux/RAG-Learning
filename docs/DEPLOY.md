# RAG 学习项目 - 部署指南

## 系统要求

- **操作系统**: macOS / Linux / Windows
- **Node.js**: 18.0 或更高版本
- **Python**: 3.9 或更高版本
- **内存**: 至少 4GB RAM (推荐 8GB+)

## 快速开始

### 1. 克隆项目

```bash
cd /Users/edy/Documents/rag-learning-project
```

### 2. 后端部署

#### 2.1 创建虚拟环境 (推荐)

```bash
cd backend
python -m venv venv

# 激活虚拟环境
# macOS / Linux
source venv/bin/activate
# Windows
venv\Scripts\activate
```

#### 2.2 安装依赖

```bash
pip install -r requirements.txt
```

#### 2.3 配置环境变量

```bash
# 设置 OpenAI API Key (必须)
export OPENAI_API_KEY="your-openai-api-key"

# 可选配置
export API_HOST="0.0.0.0"
export API_PORT=8000
```

获取 OpenAI API Key:
1. 访问 https://platform.openai.com/
2. 注册账号并创建 API Key

#### 2.4 启动后端服务

```bash
# 开发模式
uvicorn main:app --reload --port 8000

# 或直接运行
python main.py
```

后端服务将在 http://localhost:8000 运行

### 3. 前端部署

#### 3.1 安装依赖

```bash
cd frontend
npm install
```

#### 3.2 启动前端开发服务器

```bash
npm start
```

前端应用将在 http://localhost:3000 运行

### 4. 生产环境部署

#### 4.1 构建前端

```bash
npm run build
```

构建产物将生成在 `frontend/build` 目录

#### 4.2 使用 Nginx 部署

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker 部署

### 1. 构建镜像

```bash
# 构建后端镜像
docker build -t rag-backend ./backend

# 构建前端镜像
docker build -t rag-frontend ./frontend
```

### 2. 运行容器

```bash
# 运行后端
docker run -d -p 8000:8000 -e OPENAI_API_KEY=your-key rag-backend

# 运行前端
docker run -d -p 3000:3000 rag-frontend
```

## 验证部署

1. 打开浏览器访问 http://localhost:3000
2. 检查页面是否正常加载
3. 尝试上传文档
4. 进行搜索测试

## 常见问题

### Q1: 后端启动失败，提示缺少依赖

A: 确保已激活虚拟环境并运行 `pip install -r requirements.txt`

### Q2: 上传文档失败

A: 
- 检查后端是否正常运行
- 确认文档格式是否支持 (PDF, TXT, DOCX)
- 查看后端日志获取详细错误信息

### Q3: 搜索结果为空

A:
- 确保已上传文档
- 尝试上传更多文档
- 检查向量是否正确生成

### Q4: LLM 生成失败

A:
- 确认 OPENAI_API_KEY 已正确设置
- 检查 API 配额是否充足
- 查看网络连接是否正常

## 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 8000 | FastAPI 服务 |
| 前端 | 3000 | React 开发服务器 |
| API 文档 | 8000/docs | Swagger 文档 |

## 目录结构

```
rag-learning-project/
├── backend/
│   ├── main.py                 # FastAPI 主入口
│   ├── requirements.txt        # Python 依赖
│   ├── rag/
│   │   ├── document_processor.py  # 文档处理
│   │   ├── vector_store.py        # 向量存储
│   │   ├── search_engine.py       # 搜索引擎
│   │   └── llm_client.py          # LLM 客户端
│   └── data/                      # 数据存储
├── frontend/
│   ├── src/                      # React 源码
│   ├── public/                   # 静态资源
│   └── package.json              # Node 依赖
└── README.md                     # 项目说明
```
