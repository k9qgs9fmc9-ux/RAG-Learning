interface AnswerDisplayProps {
  answer: string
}

export default function AnswerDisplay({ answer }: AnswerDisplayProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <span>🤖</span>
        AI 回答
      </h2>

      <div className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl p-5 border border-white/10">
        <div className="prose prose-invert max-w-none">
          {answer.split('\n').map((line, index) => (
            <p key={index} className="text-white/90 leading-relaxed mb-2">
              {line || <br />}
            </p>
          ))}
        </div>
      </div>

      <p className="text-white/40 text-xs mt-4 flex items-center gap-1">
        <span>💡</span>
        回答基于检索到的文档内容生成
      </p>
    </div>
  )
}
