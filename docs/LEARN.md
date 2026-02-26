# RAG 技术学习指南

## 什么是 RAG?

RAG (Retrieval-Augmented Generation，检索增强生成) 是一种结合了信息检索和文本生成的技术。它通过以下流程工作：

1. **检索 (Retrieval)**: 从知识库中找到与问题相关的文档片段
2. **增强 (Augmentation)**: 将检索到的内容作为上下文提供给LLM
3. **生成 (Generation)**: LLM基于检索内容和问题生成回答

## 项目架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面 (React)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  文档上传    │  │   语义搜索   │  │      智能问答           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI 后端服务                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                     API 路由层                               ││
│  │   /upload  /search  /chat  /documents  /clear              ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   RAG 处理管道                               ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │  文档处理器   │─▶│  向量存储    │─▶│   搜索引擎       │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   LLM 客户端                                 ││
│  │              (OpenAI GPT-3.5/GPT-4)                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 核心组件详解

### 1. 文档处理 (Document Processor)

**文件**: `backend/rag/document_processor.py`

负责将各种格式的文档转换为纯文本：

```python
# 支持的格式
- PDF: 使用 PyPDF2 库解析
- TXT: 直接读取文本
- DOCX: 使用 python-docx 库解析
```

**文本分块**:
- 将长文本分割成 500 字符的小块
- 相邻块之间有 50 字符重叠，确保语义连贯

### 2. 向量存储 (Vector Store)

**文件**: `backend/rag/vector_store.py`

使用 **sentence-transformers** 生成文本嵌入：
```python
# 默认使用模型
model = SentenceTransformer('all-MiniLM-L6-v2')
```

使用 **FAISS** 进行向量索引和搜索：
```python
# 归一化向量，使用内积等价于余弦相似度
faiss.normalize_L2(embeddings)
index = faiss.IndexFlatIP(dimension)
```

### 3. 搜索引擎 (Search Engine)

**文件**: `backend/rag/search_engine.py`

提供多种搜索策略：
- **语义搜索**: 基于向量相似度
- **关键词搜索**: 简单的词频统计
- **混合搜索**: 结合语义和关键词

### 4. LLM 客户端

**文件**: `backend/rag/llm_client.py`

与 OpenAI API 集成，支持 RAG 模式：
```python
# RAG 模式提示词
system_prompt = """你是一个专业的AI助手，擅长根据提供的上下文回答用户的问题。

回答要求:
1. 只根据提供的上下文信息回答
2. 如果上下文中没有相关信息，请明确告知
3. 回答要准确、简洁、有条理"""
```

## 工作流程详解

### 文档上传流程

```
1. 用户上传文件 (PDF/TXT/DOCX)
         │
         ▼
2. FastAPI 接收文件并保存到磁盘
         │
         ▼
3. DocumentProcessor 解析文档
   - 提取文本内容
   - 清洗和规范化
         │
         ▼
4. 文本分块 (chunk_text)
   - 按句子分割
   - 合并为固定大小的块
         │
         ▼
5. VectorStore 生成向量嵌入
   - 使用 sentence-transformers
         │
         ▼
6. FAISS 索引添加向量
         │
         ▼
7. 保存文档和向量到磁盘
```

### 问答流程

```
1. 用户输入问题
         │
         ▼
2. 问题转换为向量
   - embed_text(query)
         │
         ▼
3. FAISS 相似度搜索
   - 找到 top-k 个最相似的文档块
         │
         ▼
4. 提取相关文档内容作为上下文
         │
         ▼
5. 构建提示词
   - system_prompt + 上下文 + 用户问题
         │
         ▼
6. 调用 OpenAI API 生成回答
         │
         ▼
7. 返回回答和来源文档
```

## 关键代码解析

### 向量相似度计算

```python
# 在 vector_store.py 中
def search(self, query_embedding, top_k=5):
    # 1. 归一化查询向量
    query_vec = query_embedding.reshape(1, -1).astype('float32')
    faiss.normalize_L2(query_vec)
    
    # 2. 搜索 (内积 = 余弦相似度)
    scores, indices = self.index.search(query_vec, top_k)
    
    # 3. 返回结果
    return results
```

### RAG 生成提示词

```python
# 在 llm_client.py 中
def generate_with_context(self, query, context_docs):
    # 构建上下文
    context = "\n\n".join([
        f"【文档 {i}】\n{doc}" 
        for i, doc in enumerate(context_docs, 1)
    ])
    
    # 构建消息
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"上下文:\n{context}\n\n问题: {query}"}
    ]
    
    # 调用 API
    response = self.client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages
    )
    
    return response.choices[0].message.content
```

## 扩展与优化

### 1. 更换嵌入模型

```python
# 在 vector_store.py 中修改
self.embedding_model = SentenceTransformer('all-mpnet-base-v2')
```

其他可用模型：
- `sentence-transformers/all-MiniLM-L6-v2` (轻量快速)
- `sentence-transformers/all-mpnet-base-v2` (效果更好)
- `BAAI/bge-large-zh-v1.5` (中文优化)

### 2. 更换向量数据库

```python
# 可选方案
# 1. Chroma
import chromadb

# 2. Weaviate
import weaviate

# 3. Pinecone (需要API key)
```

### 3. 更换 LLM

```python
# 在 llm_client.py 中修改模型
self.model = "gpt-4"  # 或 "gpt-4-turbo-preview"

# 也可以使用其他 LLM
# 例如: Claude, Gemini 等
```

## 性能优化建议

1. **批量处理**: 上传多个文档时使用批量嵌入
2. **缓存**: 缓存常用查询的向量
3. **异步**: 使用 async/await 提高并发
4. **索引优化**: 定期重建索引清理碎片

## 常见问题排查

### 问题 1: 搜索结果不准确

可能原因：
- 文档质量差
- 文本块太大或太小
- 嵌入模型不适合

解决方案：
- 调整 chunk_size 参数
- 尝试不同的嵌入模型

### 问题 2: 生成回答质量差

可能原因：
- 检索到的文档不相关
- prompt 不够具体

解决方案：
- 提高 top_k 获取更多候选
- 优化 system_prompt

### 问题 3: 内存占用高

可能原因：
- 向量索引太大
- 模型太大

解决方案：
- 使用更小的嵌入模型
- 实现向量索引分片

## 学习资源

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [FAISS 文档](https://faiss.ai/)
- [Sentence Transformers](https://sbert.net/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [RAG 原始论文](https://arxiv.org/abs/2005.11401)
