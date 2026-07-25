"""PRAMAAN AI - Main Application Entry Point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import get_settings
from app.utils.logger import setup_logger, get_logger
from app.utils.middleware import log_requests
from app.utils.rate_limit import rate_limit_middleware
from app.utils.metrics import get_metrics_collector
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    settings = get_settings()
    setup_logger(settings.log_level)
    logger = get_logger(__name__)
    
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Groq model: {settings.groq_model}")
    logger.info(f"Embedding model: {settings.embedding_model}")
    
    try:
        from app.database.connection import init_async_db
        await init_async_db()
    except Exception as e:
        logger.warning(f"Could not auto-initialize DB tables: {e}")
    
    yield
    
    logger.info("Shutting down application")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Autonomous Multi-Agent Fact Verification Platform",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # Add CORS middleware
    origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
    if "*" in origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    
    # Add rate limiting middleware
    app.middleware("http")(rate_limit_middleware)
    
    # Add request logging middleware
    app.middleware("http")(log_requests)
    
    # Include API routes
    app.include_router(router)
    
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
