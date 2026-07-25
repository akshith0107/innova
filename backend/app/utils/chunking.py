"""Text Chunking Utility for PRAMAAN AI RAG.

This module provides text chunking strategies for RAG pipelines.
"""

from typing import List, Optional
import re
from app.utils.logger import get_logger

logger = get_logger(__name__)


class TextChunker:
    """Utility for chunking text into smaller segments for RAG."""
    
    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        separator: str = "\n\n"
    ):
        """Initialize the text chunker.
        
        Args:
            chunk_size: Maximum characters per chunk
            chunk_overlap: Number of characters to overlap between chunks
            separator: Separator to use for splitting
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separator = separator
        
    def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks.
        
        Args:
            text: Input text to chunk
            
        Returns:
            List of text chunks
        """
        if not text:
            return []
            
        logger.info(f"Chunking text ({len(text)} characters)")
        
        # First try to split by separator (paragraphs)
        chunks = self._split_by_separator(text)
        
        # If chunks are too large, split them further
        final_chunks = []
        for chunk in chunks:
            if len(chunk) > self.chunk_size:
                sub_chunks = self._split_by_size(chunk)
                final_chunks.extend(sub_chunks)
            else:
                final_chunks.append(chunk)
        
        # Add overlap between chunks
        if self.chunk_overlap > 0:
            final_chunks = self._add_overlap(final_chunks)
        
        logger.info(f"Created {len(final_chunks)} chunks")
        return final_chunks
        
    def _split_by_separator(self, text: str) -> List[str]:
        """Split text by separator.
        
        Args:
            text: Input text
            
        Returns:
            List of chunks
        """
        chunks = text.split(self.separator)
        return [chunk.strip() for chunk in chunks if chunk.strip()]
        
    def _split_by_size(self, text: str) -> List[str]:
        """Split text by size while preserving word boundaries.
        
        Args:
            text: Input text
            
        Returns:
            List of chunks
        """
        chunks = []
        current_chunk = ""
        words = text.split()
        
        for word in words:
            if len(current_chunk) + len(word) + 1 <= self.chunk_size:
                current_chunk += " " + word if current_chunk else word
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = word
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
        
    def _add_overlap(self, chunks: List[str]) -> List[str]:
        """Add overlap between chunks.
        
        Args:
            chunks: List of chunks
            
        Returns:
            List of chunks with overlap
        """
        if len(chunks) <= 1:
            return chunks
            
        overlapped_chunks = [chunks[0]]
        
        for i in range(1, len(chunks)):
            prev_chunk = chunks[i-1]
            current_chunk = chunks[i]
            
            # Add overlap from previous chunk
            if len(prev_chunk) > self.chunk_overlap:
                overlap_text = prev_chunk[-self.chunk_overlap:]
                overlapped_chunk = overlap_text + " " + current_chunk
                overlapped_chunks.append(overlapped_chunk)
            else:
                overlapped_chunks.append(current_chunk)
        
        return overlapped_chunks
        
    def chunk_by_sentences(self, text: str, sentences_per_chunk: int = 3) -> List[str]:
        """Chunk text by sentences.
        
        Args:
            text: Input text
            sentences_per_chunk: Number of sentences per chunk
            
        Returns:
            List of chunks
        """
        # Split by sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        chunks = []
        current_chunk = []
        
        for sentence in sentences:
            current_chunk.append(sentence)
            
            if len(current_chunk) >= sentences_per_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        return chunks
