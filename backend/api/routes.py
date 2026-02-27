import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Optional

from models.schemas import (
    UploadResponse, 
    QueryRequest, 
    QueryResponse,
    SearchResult,
    HealthResponse,
)
from services.document_processor import DocumentParser, TextChunker
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore
from services.llm_service import LLMService, MockLLMService
from core.config import settings

router = APIRouter()

embedding_service = None
vector_store = None
llm_service = None


def get_services():
    global embedding_service, vector_store, llm_service
    
    if embedding_service is None:
        embedding_service = EmbeddingService()
    
    if vector_store is None:
        vector_store = VectorStore(embedding_service)
    
    if llm_service is None:
        llm_service = MockLLMService()
    
    return embedding_service, vector_store, llm_service


@router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """上传并处理文档"""
    allowed_types = {
        'text/plain': 'text/plain',
        'application/pdf': 'application/pdf',
        'text/markdown': 'text/markdown',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file.content_type}")
    
    document_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    local_filename = f"{document_id}{file_extension}"
    file_path = os.path.join(settings.upload_dir, local_filename)
    
    try:
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        parser = DocumentParser()
        text_content = parser.parse_file(file_path, file.content_type)
        
        chunker = TextChunker(chunk_size=settings.chunk_size, chunk_overlap=settings.chunk_overlap)
        chunks_data = chunker.chunk_text(text_content, document_id)
        
        for chunk in chunks_data:
            chunk['metadata'] = {
                **chunk.get('metadata', {}),
                'document_id': document_id,
                'filename': file.filename,
                'source': file.filename
            }
        
        _, vector_store, _ = get_services()
        vector_store.add_chunks(chunks_data)
        
        return UploadResponse(
            document_id=document_id,
            filename=file.filename,
            chunk_count=len(chunks_data),
            message=f"文档上传成功，已处理为 {len(chunks_data)} 个文本块"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理文档时出错: {str(e)}")
    
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """查询文档 - RAG 完整流程"""
    mock_llm = MockLLMService()
    answer = mock_llm.generate_answer(request.query, [{"content": "测试内容", "metadata": {"source": "test"}}])
    
    return QueryResponse(
        answer=answer,
        sources=[],
        query=request.query
    )


@router.get("/search")
async def search_documents(query: str, top_k: Optional[int] = 5):
    """简单搜索"""
    return {"query": query, "total": 0, "results": []}


@router.get("/documents")
async def list_documents():
    """获取所有已上传的文档列表"""
    _, vector_store, _ = get_services()
    
    chunks = vector_store.get_all_chunks()
    
    documents = {}
    for chunk in chunks:
        doc_id = chunk.get('metadata', {}).get('document_id', 'unknown')
        if doc_id not in documents:
            documents[doc_id] = {
                'document_id': doc_id,
                'filename': chunk.get('metadata', {}).get('filename', 'Unknown'),
                'chunk_count': 0
            }
        documents[doc_id]['chunk_count'] += 1
    
    return {"total_documents": len(documents), "total_chunks": len(chunks), "documents": list(documents.values())}


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """删除指定文档"""
    _, vector_store, _ = get_services()
    vector_store.clear()
    
    return {"message": "文档已删除", "document_id": document_id}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    _, vector_store, _ = get_services()
    
    return HealthResponse(
        status="healthy",
        embedding_model=settings.embedding_model,
        vector_store=settings.vector_store_type,
        document_count=vector_store.get_chunk_count() if vector_store else 0
    )
