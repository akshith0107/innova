"""Database initialization script for PRAMAAN AI.

This script creates all database tables in Neon DB.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import init_db
from app.utils.logger import setup_logger, get_logger

def main():
    """Initialize database tables."""
    setup_logger("INFO")
    logger = get_logger(__name__)
    
    try:
        logger.info("Starting database initialization...")
        init_db()
        logger.info("Database initialization completed successfully!")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
