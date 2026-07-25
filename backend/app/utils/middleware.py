"""Performance monitoring middleware for FastAPI."""

import time
from fastapi import Request, Response
from app.utils.logger import get_logger


async def log_requests(request: Request, call_next):
    """Middleware to log all requests with timing information."""
    logger = get_logger(__name__)
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    response.headers["X-Process-Time"] = str(process_time)
    
    return response
