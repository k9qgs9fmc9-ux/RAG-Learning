import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import DocumentUpload from './DocumentUpload'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import AnswerDisplay from './AnswerDisplay'
import type { Document, SearchResult, ChatResponse } from '../types'

export default function ChatPanel() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [answer, setAnswer] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    fetchDocuments()
  }, [refreshTrigger])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('获取文档失败:', error)
    }
  }

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    setSearchResults([])
    setAnswer('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, use_rag: true })
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data: ChatResponse = await response.json()
      setSearchResults(data.sources || [])
      setAnswer(data.answer)
      
      if (!data.answer) {
        toast.error('未找到相关内容，请尝试其他问题或上传更多文档')
      }
    } catch (error) {
      console.error('搜索错误:', error)
      toast.error('搜索失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    fetchDocuments()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🤖 RAG 智能问答系统
        </h1>
        <p className="text-white/60">
          基于检索增强生成的智能问答助手
        </p>
      </div>

      {/* 文档状态 */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-white font-medium">
                知识库状态
              </p>
              <p className="text-white/60 text-sm">
                {documents.length > 0 
                  ? `${documents.length} 个文档，${documents.reduce((sum, doc) => sum + doc.chunk_count, 0)} 个文本块`
                  : '尚未上传文档'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <SearchBar 
        onSearch={handleSearch} 
        isSearching={isSearching}
        disabled={documents.length === 0}
      />

      {/* 搜索结果 */}
      {searchResults.length > 0 && (
        <SearchResults results={searchResults} />
      )}

      {/* AI回答 */}
      {answer && <AnswerDisplay answer={answer} />}

      {/* 上传区域 */}
      <DocumentUpload onSuccess={handleUploadSuccess} />
    </div>
  )
}
