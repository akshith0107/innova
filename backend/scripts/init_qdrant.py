"""Qdrant initialization script for PRAMAAN AI.

This script creates the Qdrant collection for RAG operations.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.qdrant_service import QdrantService
from app.utils.config import get_settings
from app.utils.logger import setup_logger, get_logger

def main():
    """Initialize Qdrant collection."""
    setup_logger("INFO")
    logger = get_logger(__name__)
    settings = get_settings()
    
    try:
        logger.info("Starting Qdrant initialization...")
        
        # Initialize Qdrant service
        qdrant_service = QdrantService(
            url=settings.qdrant_url,
            api_key=getattr(settings, 'qdrant_api_key', None),
            collection_name=settings.qdrant_collection_name
        )
        
        # Connect to Qdrant
        qdrant_service.connect()
        
        # Create collection (vector size depends on embedding model)
        # BAAI/bge-small-en-v1.5 produces 384-dimensional vectors
        vector_size = 384
        qdrant_service.create_collection(vector_size=vector_size)
        
        logger.info(f"Qdrant collection '{settings.qdrant_collection_name}' initialized successfully!")
        logger.info(f"Vector size: {vector_size}")
        
    except Exception as e:
        logger.error(f"Qdrant initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
