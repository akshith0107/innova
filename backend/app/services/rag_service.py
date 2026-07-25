"""RAG Service for PRAMAAN AI.

This service orchestrates document processing, chunking, embedding, and storage for RAG.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import uuid
from datetime import datetime

from app.services.document_processor import DocumentProcessor
from app.services.embedding_service import EmbeddingService
from app.services.qdrant_service import QdrantService
from app.utils.chunking import TextChunker
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RAGService:
    """Service for RAG (Retrieval-Augmented Generation) operations."""
    
    def __init__(
        self,
        document_processor: DocumentProcessor,
        embedding_service: EmbeddingService,
        qdrant_service: QdrantService,
        chunker: TextChunker
    ):
        """Initialize the RAG service.
        
        Args:
            document_processor: Service for document text extraction
            embedding_service: Service for generating embeddings
            qdrant_service: Service for vector database operations
            chunker: Utility for text chunking
        """
        self.document_processor = document_processor
        self.embedding_service = embedding_service
        self.qdrant_service = qdrant_service
        self.chunker = chunker
        
    async def process_document(
        self,
        file_path: str,
        document_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a document and store in vector database.
        
        Args:
            file_path: Path to the document file
            document_id: Optional document ID (auto-generated if not provided)
            metadata: Optional metadata to attach to the document
            
        Returns:
            Dictionary with processing results
        """
        logger.info(f"Processing document: {file_path}")
        
        # Generate document ID if not provided
        if document_id is None:
            document_id = str(uuid.uuid4())
        
        # Extract text from document
        try:
            text = self.document_processor.extract_text(file_path)
            text = self.document_processor.clean_text(text)
            logger.info(f"Extracted {len(text)} characters")
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise
        
        # Chunk the text
        chunks = self.chunker.chunk_text(text)
        logger.info(f"Created {len(chunks)} chunks")
        
        # Generate embeddings for chunks
        embeddings = self.embedding_service.embed_documents(chunks)
        logger.info(f"Generated {len(embeddings)} embeddings")
        
        # Prepare points for Qdrant
        points = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            point_id = self._generate_point_id(document_id, i)
            payload = {
                "document_id": document_id,
                "chunk_id": i,
                "text": chunk,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "file_path": file_path,
                "processed_at": datetime.utcnow().isoformat(),
                **(metadata or {})
            }
            points.append({
                "id": point_id,
                "vector": embedding,
                "payload": payload
            })
        
        # Store in Qdrant
        try:
            self.qdrant_service.insert_points(points)
            logger.info(f"Stored {len(points)} points in Qdrant")
        except Exception as e:
            logger.error(f"Error storing in Qdrant: {e}")
            raise
        
        return {
            "document_id": document_id,
            "file_path": file_path,
            "total_chunks": len(chunks),
            "total_points": len(points),
            "status": "success",
            "processed_at": datetime.utcnow().isoformat()
        }
        
    async def retrieve_relevant(
        self,
        query: str,
        limit: int = 5,
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Retrieve relevant document chunks for a query.
        
        Args:
            query: Search query
            limit: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of relevant chunks with metadata
        """
        logger.info(f"Retrieving relevant chunks for query: {query[:100]}...")
        
        # Generate embedding for query
        query_embedding = self.embedding_service.embed_text(query)
        
        # Search in Qdrant
        results = self.qdrant_service.search(
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold
        )
        
        logger.info(f"Found {len(results)} relevant chunks")
        return results
        
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from the vector database.
        
        Args:
            document_id: ID of the document to delete
            
        Returns:
            True if successful
        """
        logger.info(f"Deleting document: {document_id}")
        
        # Get all point IDs for this document
        # Note: This requires Qdrant to support filtering by payload
        # For now, we'll need to implement a different approach
        
        # TODO: Implement proper document deletion
        # This would require:
        # 1. Querying Qdrant for all points with document_id
        # 2. Deleting those points
        
        logger.warning("Document deletion not fully implemented")
        return False
        
    def _generate_point_id(self, document_id: str, chunk_index: int) -> str:
        """Generate a unique point ID for a chunk.
        
        Args:
            document_id: Document ID
            chunk_index: Chunk index
            
        Returns:
            Unique point ID
        """
        # Combine document_id and chunk_index to create unique ID
        # Use hash to ensure it's a valid integer for Qdrant
        combined = f"{document_id}_{chunk_index}"
        return abs(hash(combined)) % (2**31)
        
    async def get_document_stats(self, document_id: str) -> Dict[str, Any]:
        """Get statistics for a document.
        
        Args:
            document_id: Document ID
            
        Returns:
            Dictionary with document statistics
        """
        # TODO: Implement document statistics retrieval
        # This would require querying Qdrant for all chunks with this document_id
        
        return {
            "document_id": document_id,
            "status": "not_implemented"
        }
