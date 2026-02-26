# AGENTS.md - RAG Learning Project Developer Guide

This file provides guidelines for AI agents working on the RAG Learning Project.

## Project Overview

A full-stack RAG (Retrieval-Augmented Generation) application with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **Vector Store**: FAISS + sentence-transformers
- **LLM**: OpenAI API integration

---

## Build / Lint / Test Commands

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Development server (port 3000)
npm start

# Production build
npm run build

# Run tests
npm test

# Run single test file
npm test -- --watchAll=false --testPathPattern="SearchBar"

# Run tests in watch mode
npm test -- --watch
```

### Backend (Python)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend (port 8000)
uvicorn main:app --reload --port 8000

# Run with Python directly
python main.py
```

### Running Tests

- Frontend uses react-scripts (Jest + React Testing Library)
- Backend has no formal test framework currently
- API docs available at http://localhost:8000/docs

---

## Code Style Guidelines

### General Principles

1. **Write concise code** - Minimal boilerplate, avoid unnecessary complexity
2. **Add comments for complex logic** - Especially in RAG pipeline components
3. **Handle errors gracefully** - Never expose raw exceptions to users

---

### Frontend (TypeScript / React)

#### Imports
```typescript
// Order: external → internal → relative
import React from 'react'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { SearchResult, Document } from '../types'
import DocumentUpload from './components/DocumentUpload'
```

#### Types
- Use TypeScript interfaces for component props and data models
- Define shared types in `src/types.ts`
- Avoid `any`, use `unknown` when type is uncertain

```typescript
interface Document {
  document_id: string
  filename: string
  chunk_count: number
}
```

#### Naming Conventions
- **Components**: PascalCase (e.g., `ChatPanel.tsx`)
- **Files**: camelCase (e.g., `documentProcessor.ts`)
- **Interfaces**: PascalCase with descriptive names
- **Variables**: camelCase

#### React Patterns
- Use functional components with hooks
- Destructure props properly
- Extract complex logic into custom hooks

```typescript
// Good
export default function ChatPanel() {
  const [query, setQuery] = useState('')
  const { data, loading } = useQueryDocuments()

  return <div>...</div>
}
```

#### Error Handling
```typescript
try {
  const response = await fetch('/api/query', {...})
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
} catch (error) {
  console.error('Search error:', error)
  toast.error('搜索失败，请重试')
}
```

---

### Backend (Python / FastAPI)

#### Imports
```python
# Order: stdlib → third-party → local
import os
import uuid
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel

from services.document_processor import DocumentParser
from core.config import settings
```

#### Type Hints
- Use Python 3.9+ type hints
- Be explicit with return types

```python
def search(self, query: str, top_k: int = 5) -> List[Tuple[dict, float]]:
    """Search documents by query text."""
    ...
```

#### Naming Conventions
- **Functions**: snake_case (e.g., `def process_document()`)
- **Classes**: PascalCase (e.g., `class VectorStore`)
- **Constants**: UPPER_SNAKE_CASE
- **Private methods**: prefix with underscore

#### FastAPI Patterns
```python
@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document."""
    try:
        # business logic
        return {"success": True, "message": "..."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Error Handling
- Use HTTPException for API errors
- Log errors for debugging
- Return meaningful error messages

```python
# Good
raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file.content_type}")

# Bad - never expose raw exceptions
raise HTTPException(status_code=500, detail=e)
```

---

### Configuration

- Store config in `backend/core/config.py` using Pydantic Settings
- Environment variables in `.env` (never commit secrets)
- Use `.env.example` for template

---

### File Structure

```
backend/
├── api/routes.py          # API endpoints
├── core/config.py         # Configuration
├── models/schemas.py      # Pydantic models
├── services/              # Business logic
│   ├── document_processor.py
│   ├── embedding_service.py
│   ├── vector_store.py
│   └── llm_service.py
└── main.py                # App entry point

frontend/src/
├── components/            # React components
├── types.ts              # Shared types
├── App.tsx               # Root component
└── index.tsx             # Entry point
```

---

### Git Conventions

- Commit messages: clear, concise, imperative mood
- Example: "fix: handle empty search results" not "fixed bug"
- Never commit secrets, node_modules, or build artifacts

---

### Testing Guidelines

1. Test component rendering and user interactions (frontend)
2. Test API endpoints return correct status codes (backend)
3. Use descriptive test names
4. Mock external services (OpenAI API)

---

### Key Files Reference

| File | Purpose |
|------|---------|
| `backend/api/routes.py` | All API endpoints |
| `backend/services/vector_store.py` | FAISS vector operations |
| `backend/services/embedding_service.py` | Text embeddings |
| `frontend/src/components/ChatPanel.tsx` | Main Q&A interface |
| `frontend/src/types.ts` | Shared TypeScript types |
