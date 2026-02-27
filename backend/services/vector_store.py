import os
import pickle
from typing import List, Optional, Tuple
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

from core.config import settings
from services.embedding_service import EmbeddingService


class VectorStore:
    """向量存储与检索服务 - 使用 FAISS 实现高效向量搜索"""
    
    def __init__(self, embedding_service: Optional[EmbeddingService] = None):
        self.embedding_service = embedding_service or EmbeddingService()
        self.dimension = self.embedding_service.get_embedding_dimension()
        self.index: Optional[faiss.IndexFlatIP] = None
        self.chunks: List[dict] = []
        self.document_ids: List[str] = []
    
    def _create_index(self) -> faiss.Index:
        index = faiss.IndexFlatIP(self.dimension)
        index = faiss.IndexIDMap(index)
        return index
    
    def add_chunks(self, chunks: List[dict]) -> None:
        if not chunks:
            return
        
        texts = [chunk['content'] for chunk in chunks]
        embeddings = self.embedding_service.embed_texts(texts)
        
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)
        normalized_embeddings = embeddings / norms
        
        if self.index is None:
            self.index = self._create_index()
        
        start_id = len(self.chunks)
        ids = np.array(range(start_id, start_id + len(chunks)))
        
        self.index.add_with_ids(normalized_embeddings, ids)
        self.chunks.extend(chunks)
        
        for chunk in chunks:
            doc_id = chunk.get('chunk_id', '').split('_chunk_')[0]
            self.document_ids.append(doc_id)
        
        self._save_index()
    
    def search(
        self, 
        query: str, 
        top_k: Optional[int] = None,
        filter_document_id: Optional[str] = None
    ) -> List[Tuple[dict, float]]:
        top_k = top_k or settings.similarity_top_k
        
        if self.index is None or len(self.chunks) == 0:
            return []
        
        query_embedding = self.embedding_service.embed_text(query)
        
        query_norm = np.linalg.norm(query_embedding)
        if query_norm > 0:
            query_embedding = query_embedding / query_norm
        
        query_embedding = query_embedding.reshape(1, -1).astype(np.float32)
        
        search_k = min(top_k * 2, self.index.ntotal)
        scores, indices = self.index.search(query_embedding, search_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx >= len(self.chunks):
                continue
            
            chunk = self.chunks[idx]
            
            if filter_document_id:
                chunk_doc_id = chunk.get('chunk_id', '').split('_chunk_')[0]
                if chunk_doc_id != filter_document_id:
                    continue
            
            results.append((chunk, float(score)))
            
            if len(results) >= top_k:
                break
        
        return results
    
    def get_all_chunks(self) -> List[dict]:
        return self.chunks
    
    def get_chunk_count(self) -> int:
        return len(self.chunks)
    
    def clear(self) -> None:
        self.index = None
        self.chunks = []
        self.document_ids = []
        
        index_file = os.path.join(settings.index_dir, 'faiss.index')
        chunks_file = os.path.join(settings.index_dir, 'chunks.pkl')
        
        for f in [index_file, chunks_file]:
            if os.path.exists(f):
                os.remove(f)
    
    def _save_index(self) -> None:
        if self.index is None:
            return
        
        index_file = os.path.join(settings.index_dir, 'faiss.index')
        chunks_file = os.path.join(settings.index_dir, 'chunks.pkl')
        
        faiss.write_index(self.index, index_file)
        
        with open(chunks_file, 'wb') as f:
            pickle.dump({'chunks': self.chunks, 'document_ids': self.document_ids}, f)
    
    def _load_index(self) -> None:
        index_file = os.path.join(settings.index_dir, 'faiss.index')
        chunks_file = os.path.join(settings.index_dir, 'chunks.pkl')
        
        if not os.path.exists(index_file) or not os.path.exists(chunks_file):
            return
        
        try:
            self.index = faiss.read_index(index_file)
            with open(chunks_file, 'rb') as f:
                data = pickle.load(f)
                self.chunks = data.get('chunks', [])
                self.document_ids = data.get('document_ids', [])
        except Exception as e:
            print(f"加载索引失败: {e}")
            self.index = None
            self.chunks = []
            self.document_ids = []
