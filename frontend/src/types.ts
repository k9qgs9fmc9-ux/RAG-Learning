// RAG 系统类型定义

export interface Document {
  document_id: string
  filename: string
  chunk_count: number
}

export interface SearchResult {
  chunk_id: string
  document_id: string
  content: string
  score: number
  metadata: {
    document_id: string
    filename: string
    source: string
    [key: string]: any
  }
}

export interface QueryResponse {
  answer: string
  sources: SearchResult[]
  query: string
}

export type ChatResponse = QueryResponse
export type SearchResponse = QueryResponse

export interface UploadResponse {
  document_id: string
  filename: string
  chunk_count: number
  message: string
}

export interface HealthStatus {
  status: string
  embedding_model: string
  vector_store: string
  document_count: number
}
