"""Qdrant Service for PRAMAAN AI.

This service provides vector database operations using Qdrant.
"""

from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from app.utils.logger import get_logger

logger = get_logger(__name__)


class QdrantService:
    """Service for Qdrant vector database operations."""
    
    def __init__(self, url: str = None, api_key: str = None, collection_name: str = "pramaan"):
        """Initialize the Qdrant service.
        
        Args:
            url: Qdrant server URL
            api_key: Optional API key for Qdrant Cloud
            collection_name: Name of the collection
        """
        self.url = url or "localhost:6333"
        self.api_key = api_key
        self.collection_name = collection_name
        self.client = None
        
    def connect(self):
        """Connect to Qdrant server."""
        try:
            if self.api_key:
                self.client = QdrantClient(url=self.url, api_key=self.api_key)
            else:
                self.client = QdrantClient(url=self.url)
            logger.info(f"Connected to Qdrant at {self.url}")
        except Exception as e:
            logger.error(f"Error connecting to Qdrant: {e}")
            raise
            
    def create_collection(self, vector_size: int = 384):
        """Create a new collection.
        
        Args:
            vector_size: Size of the embedding vectors
        """
        try:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
            )
            logger.info(f"Created collection: {self.collection_name}")
        except Exception as e:
            logger.error(f"Error creating collection: {e}")
            if "already exists" not in str(e):
                raise
                
    def insert_points(self, points: List[Dict[str, Any]]):
        """Insert points into the collection.
        
        Args:
            points: List of point dictionaries with id, vector, and payload
        """
        try:
            qdrant_points = [
                PointStruct(
                    id=p["id"],
                    vector=p["vector"],
                    payload=p.get("payload", {})
                )
                for p in points
            ]
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=qdrant_points
            )
            logger.info(f"Inserted {len(points)} points")
        except Exception as e:
            logger.error(f"Error inserting points: {e}")
            raise
            
    def search(
        self,
        query_vector: List[float],
        limit: int = 5,
        score_threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Search for similar vectors.
        
        Args:
            query_vector: Query embedding vector
            limit: Number of results to return
            score_threshold: Minimum similarity score
            
        Returns:
            List of search results with payloads
        """
        try:
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=score_threshold
            )
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "id": result.id,
                    "score": result.score,
                    "payload": result.payload
                })
            
            logger.info(f"Found {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching: {e}")
            return []
            
    def delete_points(self, point_ids: List[int]):
        """Delete points by IDs.
        
        Args:
            point_ids: List of point IDs to delete
        """
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=point_ids
            )
            logger.info(f"Deleted {len(point_ids)} points")
        except Exception as e:
            logger.error(f"Error deleting points: {e}")
            raise
