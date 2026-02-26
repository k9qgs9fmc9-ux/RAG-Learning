# RAG 学习指南

## 什么是 RAG？

**RAG (Retrieval-Augmented Generation，检索增强生成)** 是一种将外部知识检索与大型语言模型生成相结合的技术。

### RAG 的核心思想

```
用户查询 → 语义检索 → 相关文档 → LLM 生成 → 最终回答
```

### 为什么需要 RAG？

1. **解决知识时效性问题** - LLM 训练数据有截止日期，RAG 可接入最新知识
2. **减少幻觉** - 回答基于真实文档，减少编造答案
3. **支持私有知识** - 企业可以用自己的文档构建知识库
4. **可解释性** - 可以追溯答案的来源

---

## 项目架构详解

### 整体流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         RAG 工作流程                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────────┐   │
│  │ 用户上传 │ -> │ 文档解析    │ -> │ 文本分块 (Chunking)  │   │
│  │ 文档     │    │ (PDF/TXT)  │    │                      │   │
│  └─────────┘    └─────────────┘    └──────────────────────┘   │
│                                              │                  │
│                                              v                  │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────────────┐   │
│  │ 最终    │ <- │ LLM 生成    │ <- │ 语义检索 (FAISS)     │   │
│  │ 回答    │    │ (GPT)       │    │                      │   │
│  └─────────┘    └─────────────┘    └──────────────────────┘   │
│                                              ^                  │
│                                              │                  │
│                                    ┌──────────────────────┐     │
│                                    │ 向量化 (Embedding)   │     │
│                                    └──────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 核心技术组件

#### 1. 文档解析 (Document Parser)
- **位置**: `backend/services/document_processor.py`
- **功能**: 将 PDF、TXT、Markdown、DOCX 转换为纯文本
- **关键类**: `DocumentParser`, `TextChunker`

#### 2. 文本向量化 (Embedding)
- **位置**: `backend/services/embedding_service.py`
- **功能**: 将文本转换为高维向量，捕捉语义信息
- **模型**: Sentence Transformers (all-MiniLM-L6-v2)
- **输出**: 384 维向量

#### 3. 向量存储 (Vector Store)
- **位置**: `backend/services/vector_store.py`
- **功能**: 存储向量并支持高效相似度搜索
- **算法**: FAISS (Facebook AI Similarity Search)
- **索引类型**: Inner Product (归一化后等价于余弦相似度)

#### 4. 语义搜索 (Semantic Search)
- **流程**:
  1. 将用户查询向量化
  2. 在向量数据库中搜索最相似的 K 个文档块
  3. 返回相似度分数排序的结果

#### 5. LLM 生成 (LLM Generation)
- **位置**: `backend/services/llm_service.py`
- **功能**: 基于检索到的上下文生成回答
- **提示词模板**: 包含系统指令、上下文和用户问题

---

## 代码学习路径

### 第一步：理解后端架构

#### 1.1 配置管理
```python
# backend/core/config.py
# 学习要点：
# - 使用 pydantic-settings 管理配置
# - 环境变量读取方式
# - 单例模式应用
```

#### 1.2 数据模型
```python
# backend/models/schemas.py
# 学习要点：
# - Pydantic 模型定义
# - 请求/响应数据结构
# - 类型注解使用
```

#### 1.3 文档处理服务
```python
# backend/services/document_processor.py
# 学习要点：
# - 多种文件格式解析
# - 文本分块策略（chunk_size, overlap）
# - 句子级别分割逻辑
```

#### 1.4 向量化服务
```python
# backend/services/embedding_service.py
# 学习要点：
# - Sentence Transformers 使用
# - 批量向量化
# - 模型选择和配置
```

#### 1.5 向量存储服务
```python
# backend/services/vector_store.py
# 学习要点：
# - FAISS 索引创建
# - 向量归一化（余弦相似度）
# - 持久化存储
# - ID 映射管理
```

#### 1.6 LLM 服务
```python
# backend/services/llm_service.py
# 学习要点：
# - OpenAI API 调用
# - 提示词工程
# - 上下文构建
```

#### 1.7 API 路由
```python
# backend/api/routes.py
# 学习要点：
# - FastAPI 路由定义
# - 文件上传处理
# - 异步编程
```

### 第二步：理解前端架构

#### 2.1 组件结构
```
frontend/src/
├── App.tsx              # 主应用组件
├── components/
│   ├── DocumentUpload.tsx   # 文档上传组件
│   ├── SearchBar.tsx       # 搜索输入组件
│   ├── SearchResults.tsx   # 检索结果展示
│   ├── AnswerDisplay.tsx  # AI 回答展示
│   └── DocumentList.tsx   # 文档列表
└── types.ts             # TypeScript 类型定义
```

#### 2.2 状态管理
- 使用 React Hooks (useState, useEffect)
- 组件间通过 props 传递状态

#### 2.3 API 通信
- 使用 fetch API
- FormData 用于文件上传

---

## 关键参数调优

### 1. 文本分块参数
| 参数 | 默认值 | 调整建议 |
|------|--------|----------|
| chunk_size | 500 | 文档长则增大，短则减小 |
| chunk_overlap | 50 | 保持语义连贯性 |

### 2. 搜索参数
| 参数 | 默认值 | 调整建议 |
|------|--------|----------|
| top_k | 5 | 检索结果数量 |

### 3. LLM 参数
| 参数 | 默认值 | 调整建议 |
|------|--------|----------|
| temperature | 0.7 | 创造性 vs 准确性 |
| max_tokens | 2000 | 根据回答长度需求 |

---

## 扩展学习

### 进阶主题

1. **更先进的向量数据库**
   - Pinecone
   - Weaviate
   - Milvus
   - Qdrant

2. **更先进的 Embedding 模型**
   - OpenAI text-embedding-3-large
   - BGE (BAAI General Embedding)
   - multilingual models

3. **RAG 优化技术**
   - Hybrid Search (关键词 + 语义)
   - reranking
   - query expansion
   - graph RAG

4. **生产级 RAG**
   - LangChain/LangGraph
   - LlamaIndex
   - 向量数据库集群

### 推荐学习资源

- [LangChain 官方文档](https://python.langchain.com/)
- [FAISS 官方教程](https://faiss.ai/)
- [Sentence Transformers](https://sbert.net/)
- [OpenAI API 文档](https://platform.openai.com/docs)

---

## 常见问题

### Q1: 上传文档后搜索不到相关内容？
A: 检查文档是否成功解析，查看 chunks 数量；调整 chunk_size 参数

### Q2: LLM 返回的回答不准确？
A: 确认 OpenAI API Key 正确；检查检索结果的相关性

### Q3: 向量搜索太慢？
A: 对于大规模数据，考虑使用 GPU 版 FAISS 或专用向量数据库

### Q4: 如何支持中文文档？
A: 使用支持中文的 Embedding 模型，如 `paraphrase-multilingual-MiniLM-L12-v2`

---

## 实践建议

1. **从简单开始** - 先用小文档测试整个流程
2. **逐步调试** - 分别测试：解析 -> 分块 -> 向量 -> 搜索 -> 生成
3. **记录日志** - 在关键步骤添加日志，观察数据流转
4. **对比实验** - 调整参数，对比不同配置的效果
5. **阅读源码** - 深入理解每个组件的实现原理

---

## 下一步

1. 运行项目，体验完整 RAG 流程
2. 阅读代码，理解每个模块的实现
3. 尝试修改参数，观察效果变化
4. 添加新功能，如更多文件格式支持
5. 探索更高级的 RAG 技术
