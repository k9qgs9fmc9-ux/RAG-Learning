from typing import List, Optional
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

from core.config import settings


class EmbeddingService:
    """文本向量化服务 - 将文本转换为向量表示"""
    
    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.embedding_model
        self.dimension = settings.embedding_dimension
        self._model = None
    
    @property
    def model(self):
        if self._model is None:
            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                raise ImportError("请安装 sentence-transformers: pip install sentence-transformers")
            self._model = SentenceTransformer(self.model_name)
        return self._model
    
    def embed_text(self, text: str) -> np.ndarray:
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings
    
    def get_embedding_dimension(self) -> int:
        return self.dimension


class MockEmbeddingService:
    """模拟向量化服务 - 用于测试"""
    
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
    
    def embed_text(self, text: str) -> np.ndarray:
        np.random.seed(hash(text) % (2**32))
        return np.random.randn(self.dimension).astype(np.float32)
    
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        embeddings = []
        for text in texts:
            embeddings.append(self.embed_text(text))
        return np.array(embeddings)
    
    def get_embedding_dimension(self) -> int:
        return self.dimension
