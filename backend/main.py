"""
RAG Learning Project - FastAPI 后端主应用
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.routes import router
from core.config import settings
import os


app = FastAPI(
    title="RAG Learning Project API",
    description="检索增强生成 (Retrieval-Augmented Generation) 智能文档问答系统",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router, prefix="/api", tags=["RAG"])


@app.get("/")
async def root():
    return {
        "message": "RAG Learning Project API",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
