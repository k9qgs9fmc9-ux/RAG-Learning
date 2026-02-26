import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import type { UploadResponse } from '../types'

interface DocumentUploadProps {
  onSuccess: () => void
}

export default function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    try {
      // 模拟进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data: UploadResponse = await response.json()
      
      toast.success(`${file.name} 上传成功！处理为 ${data.chunk_count} 个文本块`)
      onSuccess()
      
    } catch (error) {
      console.error('上传错误:', error)
      toast.error('文件上传失败，请重试')
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 500)
    }
  }, [onSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md', '.markdown'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>📄</span>
        文档上传
      </h2>

      {/* 拖放区域 */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300
          ${isDragActive 
            ? 'border-white bg-white/20' 
            : 'border-white/30 hover:border-white/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white mx-auto"></div>
            <p className="text-white/70">正在上传和处理...</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <p className="text-white font-medium">
              {isDragActive ? '释放以上传文件' : '拖放文件到此处'}
            </p>
            <p className="text-white/60 text-sm">
              或点击选择文件
            </p>
            <p className="text-white/50 text-xs mt-4">
              支持 TXT、PDF、Markdown、DOCX 格式
            </p>
          </div>
        )}
      </div>

      {/* 支持格式说明 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['TXT', 'PDF', 'MD', 'DOCX'].map(format => (
          <span 
            key={format}
            className="px-2 py-1 bg-white/10 rounded-md text-xs text-white/70"
          >
            {format}
          </span>
        ))}
      </div>
    </div>
  )
}
