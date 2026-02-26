import { useState, useEffect } from 'react'
import SearchBar from './SearchBar'
import SearchResults from './SearchResults'
import DocumentList from './DocumentList'
import type { Document, SearchResult, SearchResponse } from '../types'

export default function SearchPanel() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
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

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 10 })
      })

      if (!response.ok) {
        throw new Error('搜索失败')
      }

      const data: SearchResponse = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error('搜索错误:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          🔍 语义搜索
        </h1>
        <p className="text-white/60">
          在文档知识库中进行语义检索
        </p>
      </div>

      {/* 搜索栏 */}
      <SearchBar 
        onSearch={handleSearch} 
        isSearching={isSearching}
        disabled={documents.length === 0}
      />

      {/* 搜索结果 */}
      {searchResults.length > 0 ? (
        <SearchResults results={searchResults} />
      ) : !isSearching && (
        <div className="text-center py-12 text-white/40">
          <div className="text-6xl mb-4">🔎</div>
          <p>输入关键词开始搜索</p>
        </div>
      )}

      {/* 文档列表 */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            📚 知识库文档
          </h2>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors"
          >
            刷新
          </button>
        </div>
        <DocumentList 
          documents={documents} 
          onRefresh={fetchDocuments} 
        />
      </div>
    </div>
  )
}
