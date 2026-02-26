from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DocumentBase(BaseModel):
    filename: str
    content_type: str


class DocumentCreate(DocumentBase):
    pass


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    metadata: dict = {}


class Document(DocumentBase):
    id: str
    created_at: datetime
    chunks: List[DocumentChunk] = []
    
    class Config:
        from_attributes = True


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    content: str
    score: float
    metadata: dict = {}


class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


class QueryResponse(BaseModel):
    answer: str
    sources: List[SearchResult]
    query: str


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    chunk_count: int
    message: str


class HealthResponse(BaseModel):
    status: str
    embedding_model: str
    vector_store: str
    document_count: int
