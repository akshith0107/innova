"""Groq API service for LLM interactions."""

from typing import Optional, List, Dict, Any, Union
import json
from groq import Groq, AsyncGroq
from app.utils.config import get_settings
from app.utils.logger import get_logger


def normalize_messages(messages: List[Any]) -> List[Dict[str, str]]:
    """Normalize input messages (Dict or LangChain BaseMessage) to Groq API format."""
    normalized = []
    for msg in messages:
        if isinstance(msg, dict):
            normalized.append(msg)
        elif hasattr(msg, "type") and hasattr(msg, "content"):
            role = msg.type
            if role == "human":
                role = "user"
            elif role not in ("system", "user", "assistant"):
                role = "user"
            normalized.append({"role": role, "content": str(msg.content)})
        else:
            normalized.append({"role": "user", "content": str(msg)})
    return normalized


class GroqService:
    """Service for interacting with Groq API.
    
    Provides both synchronous and asynchronous interfaces using Groq and AsyncGroq SDK clients.
    Handles message normalization, JSON response parsing, and error handling.
    """
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        settings = get_settings()
        key = api_key or settings.groq_api_key
        
        self.client = Groq(api_key=key)
        self.async_client = AsyncGroq(api_key=key)
        self.model = model or settings.groq_model
        self.temperature = temperature or settings.groq_temperature
        self.max_tokens = max_tokens or settings.groq_max_tokens
        self.logger = get_logger(__name__)
        
        self.logger.info(f"GroqService initialized with model: {self.model}")
    
    def chat_completion(
        self,
        messages: List[Any],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """Generate a synchronous chat completion."""
        try:
            formatted_messages = normalize_messages(messages)
            self.logger.debug(f"Sending request to Groq API with {len(formatted_messages)} messages")
            
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                temperature=temperature if temperature is not None else self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                response_format=response_format
            )
            
            response = completion.choices[0].message.content
            if not response:
                raise ValueError("Groq API returned empty response")
            return response
            
        except Exception as e:
            self.logger.error(f"Groq API error: {str(e)}")
            raise ValueError(f"Failed to get completion from Groq: {str(e)}")
    
    def chat_completion_json(
        self,
        messages: List[Any],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate a synchronous chat completion with JSON response format."""
        response = self.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"}
        )
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON response: {str(e)}")
            raise ValueError(f"Failed to parse JSON response: {str(e)}")
            
    async def async_chat_completion(
        self,
        messages: List[Any],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """Generate an asynchronous chat completion using AsyncGroq."""
        try:
            formatted_messages = normalize_messages(messages)
            self.logger.debug(f"Sending async request to Groq API with {len(formatted_messages)} messages")
            
            completion = await self.async_client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                temperature=temperature if temperature is not None else self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                response_format=response_format
            )
            
            response = completion.choices[0].message.content
            if not response:
                raise ValueError("Groq API returned empty response")
            return response
            
        except Exception as e:
            self.logger.error(f"Groq Async API error: {str(e)}")
            raise ValueError(f"Failed to get async completion from Groq: {str(e)}")

    async def async_chat_completion_json(
        self,
        messages: List[Any],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> Dict[str, Any]:
        """Generate an asynchronous chat completion with JSON response format."""
        response = await self.async_chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"}
        )
        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON response: {str(e)}")
            raise ValueError(f"Failed to parse JSON response: {str(e)}")

    def stream_completion(
        self,
        messages: List[Any],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ):
        """Generate a streaming chat completion."""
        try:
            formatted_messages = normalize_messages(messages)
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                temperature=temperature if temperature is not None else self.temperature,
                max_tokens=max_tokens or self.max_tokens,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            self.logger.error(f"Groq API streaming error: {str(e)}")
            raise ValueError(f"Failed to stream completion from Groq: {str(e)}")


_groq_service: Optional[GroqService] = None


def get_groq_service() -> GroqService:
    """Get the global Groq service instance."""
    global _groq_service
    if _groq_service is None:
        _groq_service = GroqService()
    return _groq_service

