"""Logging configuration for PRAMAAN AI."""

import sys
from loguru import logger
from typing import Optional


def setup_logger(log_level: str = "INFO") -> None:
    """Configure the application logger."""
    logger.remove()
    
    # Console handler with color
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=log_level,
        colorize=True,
    )
    
    # File handler for persistent logs
    logger.add(
        "logs/pramaan.log",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
        level=log_level,
        rotation="10 MB",
        retention="7 days",
        compression="zip",
        encoding="utf-8",
    )
    
    logger.info(f"Logger initialized with level: {log_level}")


def get_logger(name: Optional[str] = None):
    """Get a logger instance."""
    if name:
        return logger.bind(name=name)
    return logger
