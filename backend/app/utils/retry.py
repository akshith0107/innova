"""Retry mechanism for external API calls with exponential backoff."""

import time
import functools
from typing import Callable, Any, Optional
from app.utils.logger import get_logger
from app.utils.config import get_settings


def retry_on_exception(
    max_attempts: int = 3,
    delay_seconds: int = 1,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,),
    logger_name: Optional[str] = None
):
    """Decorator to retry function calls on exception with exponential backoff.
    
    Args:
        max_attempts: Maximum number of retry attempts
        delay_seconds: Initial delay between retries in seconds
        backoff_factor: Multiplier for exponential backoff
        exceptions: Tuple of exceptions to catch and retry on
        logger_name: Optional logger name for logging retries
        
    Returns:
        Decorated function with retry logic
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            settings = get_settings()
            
            # Check if retry is enabled globally
            if not settings.retry_enabled:
                return func(*args, **kwargs)
            
            logger = get_logger(logger_name or func.__module__)
            max_attempts_config = settings.retry_max_attempts
            delay_config = settings.retry_delay_seconds
            
            # Use configured values if not explicitly provided
            actual_max_attempts = max_attempts if max_attempts != 3 else max_attempts_config
            actual_delay = delay_seconds if delay_seconds != 1 else delay_config
            
            last_exception = None
            
            for attempt in range(actual_max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < actual_max_attempts - 1:
                        # Calculate exponential backoff delay
                        current_delay = actual_delay * (backoff_factor ** attempt)
                        logger.warning(
                            f"Attempt {attempt + 1}/{actual_max_attempts} failed for {func.__name__}: {e}. "
                            f"Retrying in {current_delay:.2f}s..."
                        )
                        time.sleep(current_delay)
                    else:
                        logger.error(
                            f"All {actual_max_attempts} attempts failed for {func.__name__}: {e}"
                        )
            
            # Raise the last exception if all attempts failed
            raise last_exception
        
        return wrapper
    return decorator


class RetryHandler:
    """Handler for managing retry logic with configurable strategies."""
    
    def __init__(
        self,
        max_attempts: int = 3,
        delay_seconds: int = 1,
        backoff_factor: float = 2.0
    ):
        """Initialize the retry handler.
        
        Args:
            max_attempts: Maximum number of retry attempts
            delay_seconds: Initial delay between retries
            backoff_factor: Multiplier for exponential backoff
        """
        self.max_attempts = max_attempts
        self.delay_seconds = delay_seconds
        self.backoff_factor = backoff_factor
        self.logger = get_logger(__name__)
    
    def execute_with_retry(
        self,
        func: Callable,
        *args,
        exceptions: tuple = (Exception,),
        **kwargs
    ) -> Any:
        """Execute a function with retry logic.
        
        Args:
            func: Function to execute
            *args: Function arguments
            exceptions: Tuple of exceptions to catch and retry on
            **kwargs: Function keyword arguments
            
        Returns:
            Function result if successful
            
        Raises:
            Last exception if all attempts fail
        """
        settings = get_settings()
        
        if not settings.retry_enabled:
            return func(*args, **kwargs)
        
        actual_max_attempts = self.max_attempts if self.max_attempts != 3 else settings.retry_max_attempts
        actual_delay = self.delay_seconds if self.delay_seconds != 1 else settings.retry_delay_seconds
        
        last_exception = None
        
        for attempt in range(actual_max_attempts):
            try:
                return func(*args, **kwargs)
            except exceptions as e:
                last_exception = e
                
                if attempt < actual_max_attempts - 1:
                    current_delay = actual_delay * (self.backoff_factor ** attempt)
                    self.logger.warning(
                        f"Attempt {attempt + 1}/{actual_max_attempts} failed: {e}. "
                        f"Retrying in {current_delay:.2f}s..."
                    )
                    time.sleep(current_delay)
                else:
                    self.logger.error(
                        f"All {actual_max_attempts} attempts failed: {e}"
                    )
        
        raise last_exception
