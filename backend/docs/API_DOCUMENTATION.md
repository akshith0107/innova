# PRAMAAN AI API Documentation

## Overview

PRAMAAN AI is an autonomous multi-agent fact verification platform that uses a layered trust architecture to verify LLM-generated responses. The API provides endpoints for verification, document upload, user authentication, and system monitoring.

**Base URL**: `http://localhost:8000/api/v1`

**Authentication**: JWT Bearer Token (required for protected endpoints)

## Authentication

### Register User

Register a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Login

Authenticate with existing credentials.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Get Current User

Get information about the authenticated user.

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## Verification Endpoints

### Health Check

Check API health status.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "PRAMAAN AI",
  "version": "1.0.0",
  "uptime_seconds": 3600.5
}
```

### Verify LLM Response

Submit an LLM response for verification using the 8-agent workflow.

**Endpoint**: `POST /verify`

**Request Body**:
```json
{
  "query": "What is the capital of France?",
  "llm_response": "The capital of France is Paris, which is known for the Eiffel Tower and rich cultural heritage.",
  "llm_platform": "chatgpt",
  "session_id": null
}
```

**Response**:
```json
{
  "verification_id": 123,
  "status": "processing",
  "trust_score": null,
  "message": "Verification started. Use GET /report/{id} to check results."
}
```

### Get Verification Report

Retrieve the complete verification report for a specific verification ID.

**Endpoint**: `GET /report/{verification_id}`

**Response**:
```json
{
  "verification_id": 123,
  "query": "What is the capital of France?",
  "llm_response": "The capital of France is Paris...",
  "trust_score": 0.85,
  "overall_verdict": "TRUE",
  "status": "completed",
  "report": {
    "summary": "The claim about Paris being the capital of France is verified as accurate.",
    "trust_level": "High",
    "claim_summary": "1 claim extracted and verified",
    "key_insights": [
      "Multiple academic sources confirm Paris as capital",
      "Wikipedia and government sources support the claim"
    ],
    "recommendations": [
      "Response is highly credible",
      "No factual corrections needed"
    ],
    "source_summary": "5 sources consulted: 3 academic, 2 knowledge"
  }
}
```

### Get Verification History

Retrieve paginated verification history.

**Endpoint**: `GET /history?skip=0&limit=10`

**Response**:
```json
{
  "total": 25,
  "verifications": [
    {
      "id": 123,
      "query": "What is the capital of France?",
      "trust_score": 0.85,
      "overall_verdict": "TRUE",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Document Upload

### Upload Document for RAG

Upload a PDF, DOCX, or text file for semantic indexing and retrieval.

**Endpoint**: `POST /upload`

**Request**: `multipart/form-data` with file

**Response**:
```json
{
  "document_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "research_paper.pdf",
  "status": "success",
  "total_chunks": 45,
  "total_points": 45,
  "message": "Document processed and indexed successfully"
}
```

## Search

### Direct Search

Perform search across multiple data sources without full verification.

**Endpoint**: `POST /search`

**Request Body**:
```json
{
  "query": "climate change effects",
  "limit": 10
}
```

**Response**:
```json
{
  "message": "Direct search endpoint - to be implemented",
  "query": "climate change effects"
}
```

## Metrics

### Get System Metrics

Retrieve application metrics including request counts, timing statistics, and system health.

**Endpoint**: `GET /metrics`

**Response**:
```json
{
  "uptime_seconds": 3600.5,
  "counters": {
    "requests.health_check.total": 150,
    "requests.verify.total": 25,
    "requests.verify.success": 23,
    "requests.verify.errors": 2
  },
  "gauges": {
    "active_connections": 5,
    "memory_usage_mb": 256.5
  },
  "timings": {
    "requests.verify.duration": {
      "count": 25,
      "min": 2.5,
      "max": 15.3,
      "avg": 8.7,
      "p50": 8.2,
      "p95": 12.1,
      "p99": 14.8
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per 60 seconds per IP
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Period`: Time window in seconds
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `Retry-After`: Seconds until retry is allowed (when limited)

**Rate Limit Exceeded Response**:
```json
{
  "error": "Rate limit exceeded",
  "limit": 100,
  "period": 60,
  "remaining": 0,
  "retry_after": 60
}
```

## Error Responses

### Standard Error Format

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Usage Examples

### Python Example

```python
import requests

# Base URL
BASE_URL = "http://localhost:8000/api/v1"

# Register user
response = requests.post(f"{BASE_URL}/auth/register", json={
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
})
token = response.json()["access_token"]

# Verify LLM response
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(f"{BASE_URL}/verify", 
    headers=headers,
    json={
        "query": "What is the capital of France?",
        "llm_response": "The capital of France is Paris...",
        "llm_platform": "chatgpt"
    }
)
verification_id = response.json()["verification_id"]

# Get report
response = requests.get(f"{BASE_URL}/report/{verification_id}", headers=headers)
report = response.json()
print(f"Trust Score: {report['trust_score']}")
print(f"Verdict: {report['overall_verdict']}")
```

### cURL Example

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123","name":"John Doe"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123"}'

# Verify response
curl -X POST http://localhost:8000/api/v1/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query":"What is the capital of France?","llm_response":"The capital of France is Paris...","llm_platform":"chatgpt"}'

# Get report
curl -X GET http://localhost:8000/api/v1/report/123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload document
curl -X POST http://localhost:8000/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

## Layered Trust Architecture

The verification system uses a 3-layer trust architecture:

### Layer 1 (Highest Trust): Academic Sources
- **OpenAlex**: Academic research database
- **Semantic Scholar**: Scientific literature
- **Credibility Boost**: +0.3

### Layer 2 (Medium Trust): Knowledge Sources
- **Wikipedia**: Encyclopedia
- **Wikidata**: Knowledge graph
- **RAG**: Uploaded documents
- **Credibility Boost**: +0.15

### Layer 3 (Base Trust): Web Sources
- **Tavily**: Web search
- **Credibility Boost**: 0.0

## 8-Agent Workflow

1. **Planner Agent**: Creates verification plan
2. **Claim Extraction Agent**: Extracts factual claims
3. **Research Agent**: Gathers information from all trust layers
4. **Evidence Agent**: Extracts relevant evidence
5. **Ranking Agent**: Ranks sources by credibility
6. **Debate Agent**: Conducts Pro/Con debate
7. **Judge Agent**: Evaluates claims and renders verdicts
8. **Report Agent**: Generates final verification report

## Interactive Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
