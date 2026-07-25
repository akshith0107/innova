"""Document Processing Service for PRAMAAN AI.

This service handles text extraction from PDF and DOCX files.
"""

import fitz  # PyMuPDF
from docx import Document
from typing import Optional
from pathlib import Path
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DocumentProcessor:
    """Service for processing and extracting text from documents."""
    
    def __init__(self):
        """Initialize the document processor."""
        self.supported_formats = {'.pdf', '.docx', '.txt'}
        
    def extract_text(self, file_path: str) -> str:
        """Extract text from a document file.
        
        Args:
            file_path: Path to the document file
            
        Returns:
            Extracted text as string
            
        Raises:
            ValueError: If file format is not supported
            Exception: If extraction fails
        """
        path = Path(file_path)
        file_ext = path.suffix.lower()
        
        if file_ext not in self.supported_formats:
            raise ValueError(f"Unsupported file format: {file_ext}. Supported: {self.supported_formats}")
        
        logger.info(f"Extracting text from {file_path}")
        
        try:
            if file_ext == '.pdf':
                return self._extract_from_pdf(file_path)
            elif file_ext == '.docx':
                return self._extract_from_docx(file_path)
            elif file_ext == '.txt':
                return self._extract_from_txt(file_path)
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            raise
            
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file using PyMuPDF.
        
        Args:
            file_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        text = []
        doc = fitz.open(file_path)
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text.append(page.get_text())
        
        doc.close()
        return "\n\n".join(text)
        
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file using python-docx.
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text
        """
        doc = Document(file_path)
        text = []
        
        for paragraph in doc.paragraphs:
            text.append(paragraph.text)
        
        return "\n\n".join(text)
        
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from plain text file.
        
        Args:
            file_path: Path to text file
            
        Returns:
            File contents
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
            
    def clean_text(self, text: str) -> str:
        """Clean and normalize extracted text.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        # Remove common artifacts
        text = text.replace('\x0c', '')  # Form feed character
        
        return text.strip()
