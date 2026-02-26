# RAG Learning Project

一个完整的 RAG（Retrieval-Augmented Generation，检索增强生成）学习项目，包含基于 React 的前端应用和 FastAPI 后端服务。

## 功能特性

- 📄 **文档上传与解析**: 支持 PDF、TXT、DOCX、Markdown 格式
- 🔢 **文本向量化**: 使用 sentence-transformers 生成语义向量
- 💾 **向量数据库**: 使用 FAISS 实现高效向量存储和检索
- 🔍 **语义搜索**: 基于余弦相似度的智能检索
- 🤖 **LLM 集成**: 与 OpenAI GPT 模型集成生成回答

## 技术栈

### 后端
- FastAPI - 高性能 Web 框架
- sentence-transformers - 文本嵌入
- FAISS - 向量相似度搜索
- OpenAI API - 大语言模型

### 前端
- React 18 - 用户界面框架
- TypeScript - 类型安全
- Tailwind CSS - 样式框架

## 快速开始

### 1. 环境要求

- Node.js 18+
- Python 3.9+
- OpenAI API Key

### 2. 后端设置

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 OpenAI API Key

# 启动服务
uvicorn main:app --reload --port 8000
```

### 3. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 4. 访问应用

打开浏览器访问 http://localhost:3000

## 项目结构

```
rag-learning-project/
├── backend/
│   ├── api/              # API 路由
│   │   └── routes.py     # API 端点定义
│   ├── core/             # 核心配置
│   │   └── config.py    # 配置管理
│   ├── models/          # 数据模型
│   │   └── schemas.py   # Pydantic 模型
│   ├── services/        # 业务服务
│   │   ├── document_processor.py  # 文档处理
│   │   ├── embedding_service.py   # 向量嵌入
│   │   ├── vector_store.py        # 向量存储
│   │   └── llm_service.py         # LLM 服务
│   ├── main.py          # 应用入口
│   ├── requirements.txt # Python 依赖
│   └── .env.example     # 环境变量示例
├── frontend/
│   ├── src/
│   │   ├── components/  # React 组件
│   │   │   ├── ChatPanel.tsx        # 智能问答
│   │   │   ├── SearchPanel.tsx     # 语义搜索
│   │   │   ├── DocumentUpload.tsx  # 文档上传
│   │   │   ├── DocumentList.tsx    # 文档列表
│   │   │   ├── SearchBar.tsx       # 搜索栏
│   │   │   ├── SearchResults.tsx   # 搜索结果
│   │   │   └── AnswerDisplay.tsx   # 回答展示
│   │   ├── App.tsx      # 主应用
│   │   ├── index.tsx    # 入口文件
│   │   └── types.ts     # 类型定义
│   ├── package.json
│   └── tailwind.config.js
├── docs/
│   ├── DEPLOY.md        # 部署指南
│   └── LEARN.md         # 学习指南
└── README.md
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/upload` | POST | 上传文档 |
| `/api/query` | POST | 问答查询 |
| `/api/search` | GET | 语义搜索 |
| `/api/documents` | GET | 获取文档列表 |
| `/api/documents/{id}` | DELETE | 删除文档 |
| `/api/health` | GET | 健康检查 |

详细 API 文档: http://localhost:8000/docs

## 学习资源

- [部署指南](./docs/DEPLOY.md)
- [学习指南](./docs/LEARN.md)

## 许可证

MIT License
