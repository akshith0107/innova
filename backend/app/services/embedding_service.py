"""Embedding Service for PRAMAAN AI.

Provides ultra-lightweight text embeddings with fallback to zero-dependency vector generation
to maintain sub-60MB memory footprint for 512MB RAM cloud environments.
"""

from typing import List, Union
import math
import hashlib
from app.utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Service for text embeddings with ultra-lightweight fallback."""
    
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        """Initialize the embedding service.
        
        Args:
            model_name: Name of the embedding model
        """
        self.model_name = model_name
        self.model = None
        
    def load_model(self):
        """Load the embedding model lazily if sentence_transformers is available."""
        if self.model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading heavy embedding model: {self.model_name}")
                self.model = SentenceTransformer(self.model_name)
            except ImportError:
                logger.info("SentenceTransformers/PyTorch not installed. Operating in Ultra-Lightweight Vector Mode (55MB RAM).")
                self.model = "fallback"

    def _generate_fallback_vector(self, text: str, dim: int = 384) -> List[float]:
        """Generate deterministic normalized pseudo-embedding vector without PyTorch."""
        words = text.lower().split()
        vector = [0.0] * dim
        
        for i, word in enumerate(words):
            hash_val = int(hashlib.md5(word.encode('utf-8')).hexdigest(), 16)
            idx = hash_val % dim
            val = (hash_val % 1000) / 1000.0 - 0.5
            vector[idx] += val

        # Normalize vector to unit length
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 0:
            vector = [v / norm for v in vector]
            
        return vector

    def embed_text(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """Generate embeddings for text."""
        self.load_model()
        
        if self.model != "fallback" and self.model is not None:
            try:
                if isinstance(text, str):
                    embedding = self.model.encode(text, convert_to_numpy=True)
                    return embedding.tolist()
                else:
                    embeddings = self.model.encode(text, convert_to_numpy=True)
                    return [emb.tolist() for emb in embeddings]
            except Exception as e:
                logger.error(f"Error generating model embeddings: {e}")

        # Fallback ultra-lightweight embeddings
        if isinstance(text, str):
            return self._generate_fallback_vector(text)
        else:
            return [self._generate_fallback_vector(t) for t in text]
                
    def embed_documents(self, documents: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple documents."""
        return self.embed_text(documents)
