import os
import re
from typing import List
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None


class DocumentParser:
    """文档解析器 - 支持多种格式转换为纯文本"""
    
    @staticmethod
    def parse_file(file_path: str, content_type: str) -> str:
        parsers = {
            'text/plain': DocumentParser.parse_txt,
            'application/pdf': DocumentParser.parse_pdf,
            'text/markdown': DocumentParser.parse_markdown,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': DocumentParser.parse_docx,
        }
        
        parser = parsers.get(content_type)
        if not parser:
            raise ValueError(f"不支持的文件类型: {content_type}")
        
        return parser(file_path)
    
    @staticmethod
    def parse_txt(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    @staticmethod
    def parse_markdown(file_path: str) -> str:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = re.sub(r'^#{1,6}\s+', '', content, flags=re.MULTILINE)
        content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content)
        content = re.sub(r'\*([^*]+)\*', r'\1', content)
        content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)
        content = re.sub(r'```[\s\S]*?```', '', content)
        content = re.sub(r'`([^`]+)`', r'\1', content)
        return content
    
    @staticmethod
    def parse_pdf(file_path: str) -> str:
        if PyPDF2 is None:
            raise ImportError("请安装 PyPDF2: pip install PyPDF2")
        
        text_parts = []
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text_parts.append(page.extract_text())
        
        return '\n'.join(text_parts)
    
    @staticmethod
    def parse_docx(file_path: str) -> str:
        if docx is None:
            raise ImportError("请安装 python-docx: pip install python-docx")
        
        doc = docx.Document(file_path)
        paragraphs = [para.text for para in doc.paragraphs]
        return '\n'.join(paragraphs)


class TextChunker:
    """文本分块处理器 - 将长文本分割成重叠的小块"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def chunk_text(self, text: str, document_id: str) -> List[dict]:
        sentences = self._split_into_sentences(text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        chunk_id = 0
        
        for sentence in sentences:
            sentence_length = len(sentence)
            
            if sentence_length > self.chunk_size:
                if current_chunk:
                    chunks.append(self._create_chunk(current_chunk, document_id, chunk_id))
                    chunk_id += 1
                    current_chunk = []
                    current_length = 0
                
                sub_chunks = self._split_long_sentence(sentence, document_id, chunk_id)
                chunks.extend(sub_chunks)
                chunk_id += len(sub_chunks)
                continue
            
            if current_length + sentence_length > self.chunk_size and current_chunk:
                chunks.append(self._create_chunk(current_chunk, document_id, chunk_id))
                chunk_id += 1
                
                overlap_text = current_chunk[-2:] if len(current_chunk) >= 2 else current_chunk
                current_chunk = overlap_text
                current_length = sum(len(s) for s in overlap_text)
            
            current_chunk.append(sentence)
            current_length += sentence_length
        
        if current_chunk:
            chunks.append(self._create_chunk(current_chunk, document_id, chunk_id))
        
        return chunks
    
    def _split_into_sentences(self, text: str) -> List[str]:
        sentences = re.split(r'([。！？\n])', text)
        result = []
        for i in range(0, len(sentences) - 1, 2):
            if i + 1 < len(sentences):
                result.append(sentences[i] + sentences[i + 1])
            else:
                result.append(sentences[i])
        return [s.strip() for s in result if s.strip()]
    
    def _split_long_sentence(self, text: str, document_id: str, start_id: int) -> List[dict]:
        chunks = []
        for i in range(0, len(text), self.chunk_size):
            chunk_text = text[i:i + self.chunk_size]
            chunks.append({
                'chunk_id': f"{document_id}_chunk_{start_id}",
                'content': chunk_text,
                'metadata': {'position': i, 'is_split': True}
            })
        return chunks
    
    def _create_chunk(self, sentences: List[str], document_id: str, chunk_id: int) -> dict:
        content = ' '.join(sentences)
        return {
            'chunk_id': f"{document_id}_chunk_{chunk_id}",
            'content': content,
            'metadata': {'char_count': len(content), 'sentence_count': len(sentences)}
        }
