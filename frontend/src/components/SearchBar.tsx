import { useState, FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isSearching: boolean
  disabled?: boolean
}

export default function SearchBar({ onSearch, isSearching, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim() && !isSearching && !disabled) {
      onSearch(query)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>🔍</span>
        智能问答
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "请先上传文档" : "输入您的问题..."}
            disabled={disabled || isSearching}
            className="
              w-full px-5 py-4 pr-14 rounded-xl
              bg-white/90 text-gray-800
              placeholder-gray-400
              border-2 border-transparent
              focus:border-primary-500 focus:outline-none
              disabled:bg-white/50 disabled:cursor-not-allowed
              transition-all duration-200
              text-lg
            "
          />
          
          {/* 搜索按钮 */}
          <button
            type="submit"
            disabled={!query.trim() || isSearching || disabled}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              px-4 py-2 rounded-lg
              bg-gradient-to-r from-primary-500 to-primary-600
              text-white font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:from-primary-600 hover:to-primary-700
              transition-all duration-200
            "
          >
            {isSearching ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>搜索</span>
            )}
          </button>
        </div>

        {/* 提示信息 */}
        <p className="text-white/50 text-sm">
          {disabled 
            ? "系统提示：请先上传文档到知识库" 
            : "基于已上传的文档进行语义搜索和智能问答"
          }
        </p>
      </form>
    </div>
  )
}
