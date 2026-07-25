"""Embedding Service for PRAMAAN AI.

This service provides text embeddings using BAAI/bge-small-en-v1.5.
"""

from typing import List, Union
from sentence_transformers import SentenceTransformer
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Service for text embeddings."""
    
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        """Initialize the embedding service.
        
        Args:
            model_name: Name of the embedding model
        """
        self.model_name = model_name
        self.model = None
        
    def load_model(self):
        """Load the embedding model (lazy loading)."""
        if self.model is None:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            
    def embed_text(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate embeddings for text.
        
        Args:
            text: Single text string or list of text strings
            
        Returns:
            Embedding vector(s) as list(s) of floats
        """
        self.load_model()
        
        try:
            if isinstance(text, str):
                embedding = self.model.encode(text, convert_to_numpy=True)
                return embedding.tolist()
            else:
                embeddings = self.model.encode(text, convert_to_numpy=True)
                return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            # Return zero vector as fallback
            if isinstance(text, str):
                return [0.0] * 384  # bge-small-en-v1.5 dimension
            else:
                return [[0.0] * 384 for _ in text]
                
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple documents.
        
        Args:
            documents: List of document strings
            
        Returns:
            List of embedding vectors
        """
        return self.embed_text(documents)
