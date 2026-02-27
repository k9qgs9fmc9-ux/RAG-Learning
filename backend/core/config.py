from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    openai_api_key: str = "sk-62c624e8f0f2403da26b02aa348ec860"
    openai_model: str = "qwen3.5-flash"
    openai_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    openai_temperature: float = 0.7
    openai_max_tokens: int = 2000
    
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    
    vector_store_type: str = "faiss"
    upload_dir: str = "./uploads"
    index_dir: str = "./indexes"
    
    chunk_size: int = 500
    chunk_overlap: int = 50
    
    similarity_top_k: int = 5
    
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.index_dir).mkdir(parents=True, exist_ok=True)
    return settings


settings = get_settings()
