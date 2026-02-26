import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import DocumentUpload from './components/DocumentUpload'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import AnswerDisplay from './components/AnswerDisplay'
import DocumentList from './components/DocumentList'
import type { SearchResult, Document } from './types'

function App() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [answer, setAnswer] = useState<string>('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasUploaded, setHasUploaded] = useState(false)

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('获取文档列表失败:', error)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleUploadSuccess = () => {
    setHasUploaded(true)
    fetchDocuments()
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    setSearchResults([])
    setAnswer('')
    
    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 5 }),
      })
      
      const data = await response.json()
      setSearchResults(data.sources || [])
      setAnswer(data.answer || '')
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <Toaster position="top-right" />
      
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">🤖</span>
            RAG 学习项目
          </h1>
          <p className="text-white/80 mt-2">
            检索增强生成 (Retrieval-Augmented Generation) 智能文档问答系统
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <DocumentUpload onSuccess={handleUploadSuccess} />
            <DocumentList documents={documents} onRefresh={fetchDocuments} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <SearchBar 
              onSearch={handleSearch} 
              isSearching={isSearching}
              disabled={!hasUploaded && documents.length === 0}
            />

            <div className="space-y-6">
              {answer && <AnswerDisplay answer={answer} />}
              {searchResults.length > 0 && <SearchResults results={searchResults} />}

              {!hasUploaded && documents.length === 0 && !answer && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    欢迎使用 RAG 智能问答系统
                  </h2>
                  <p className="text-white/70">
                    请先上传文档，然后提出问题开始体验
                  </p>
                </div>
              )}

              {isSearching && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
                  <p className="text-white/70">正在搜索和生成回答...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 py-6 text-center text-white/50">
        <p>RAG Learning Project - 基于 FastAPI + React 构建</p>
      </footer>
    </div>
  )
}

export default App
