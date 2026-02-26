import type { SearchResult } from '../types'

interface SearchResultsProps {
  results: SearchResult[]
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>📋</span>
        检索结果
        <span className="text-sm font-normal text-white/60">
          ({results.length} 条相关文档)
        </span>
      </h2>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={result.chunk_id}
            className="bg-white/10 rounded-xl p-4 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* 相似度分数 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">
                来源: {result.metadata?.filename || '未知'}
              </span>
              <span className={`
                px-2 py-1 rounded-md text-xs font-medium
                ${result.score > 0.8 
                  ? 'bg-green-500/30 text-green-300' 
                  : result.score > 0.6 
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-red-500/30 text-red-300'
                }
              `}>
                相似度: {(result.score * 100).toFixed(1)}%
              </span>
            </div>

            {/* 内容预览 */}
            <p className="text-white/90 leading-relaxed">
              {result.content.length > 300 
                ? `${result.content.substring(0, 300)}...`
                : result.content
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
