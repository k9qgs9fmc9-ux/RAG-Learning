import type { Document } from '../types'
import toast from 'react-hot-toast'

interface DocumentListProps {
  documents: Document[]
  onRefresh: () => void
}

export default function DocumentList({ documents, onRefresh }: DocumentListProps) {
  const handleDelete = async (documentId: string) => {
    if (!window.confirm('确定要清空知识库吗？')) return

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('知识库已清空')
        onRefresh()
      }
    } catch (error) {
      console.error('删除失败:', error)
      toast.error('删除失败')
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span>📚</span>
          知识库
        </h2>
        {documents.length > 0 && (
          <button
            onClick={() => handleDelete(documents[0]?.document_id || '')}
            className="text-xs text-white/50 hover:text-red-300 transition-colors"
          >
            清空知识库
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-white/50">暂无文档</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.document_id}
              className="bg-white/10 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">📄</span>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">
                    {doc.filename}
                  </p>
                  <p className="text-white/50 text-sm">
                    {doc.chunk_count} 个文本块
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* 统计信息 */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm text-white/60">
              <span>文档总数</span>
              <span>{documents.length}</span>
            </div>
            <div className="flex justify-between text-sm text-white/60 mt-1">
              <span>文本块总数</span>
              <span>{documents.reduce((sum, doc) => sum + doc.chunk_count, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
