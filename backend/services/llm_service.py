from typing import List, Optional
from core.config import settings


class LLMService:
    """大语言模型服务 - 与 DeepSeek 集成"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.openai_api_key
        self.model = model or settings.openai_model
        self.base_url = settings.openai_base_url
        self.temperature = settings.openai_temperature
        self.max_tokens = settings.openai_max_tokens
        self._client = None
    
    @property
    def client(self):
        if self._client is None:
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)
            except ImportError:
                raise ImportError("请安装 openai: pip install openai")
        return self._client
    
    def generate_answer(self, query: str, context_chunks: List[dict]) -> str:
        context = self._build_context(context_chunks)
        prompt = self._build_prompt(query, context)
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "你是一个智能助手，基于提供的文档上下文回答用户问题。"},
                    {"role": "user", "content": prompt}
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"生成回答时出错: {str(e)}"
    
    def _build_context(self, chunks: List[dict]) -> str:
        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            content = chunk.get('content', '')
            metadata = chunk.get('metadata', {})
            source = metadata.get('source', f'来源 {i}')
            context_parts.append(f"【{source}】\n{content}")
        return '\n\n'.join(context_parts)
    
    def _build_prompt(self, query: str, context: str) -> str:
        return f"""请根据以下上下文信息回答用户的问题。

上下文信息：
{context}

用户问题：{query}

请根据上下文提供准确回答。"""


class MockLLMService:
    """模拟 LLM 服务 - 用于测试"""
    
    def __init__(self, **kwargs):
        pass
    
    def generate_answer(self, query: str, context_chunks: List[dict]) -> str:
        if not context_chunks:
            return "抱歉，我没有找到与您问题相关的文档内容。"
        
        context = '\n\n'.join([chunk.get('content', '')[:200] for chunk in context_chunks[:3]])
        return f"基于检索到的文档内容，我为您提供以下回答：\n\n{context}\n\n如需更详细的信息，请告诉我您想了解的具体方面。"
