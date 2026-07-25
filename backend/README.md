# PRAMAAN AI Backend

Autonomous Multi-Agent Fact Verification Platform for National Hackathon

## Architecture

```
User → LLM Response → FastAPI → LangGraph → 8 Agents → JSON Response
```

### Components

- **FastAPI**: Async REST API server
- **LangGraph**: Multi-agent workflow orchestration
- **Groq API**: High-speed LLM inference (Llama 3.3 70B)
- **Tavily Search**: AI-powered web search
- **OpenAlex**: Academic research database
- **Semantic Scholar**: Scientific literature search
- **Wikipedia/Wikidata**: Knowledge graph integration
- **Qdrant**: Vector database for RAG and semantic search
- **Neon DB**: Serverless PostgreSQL for data persistence
- **Redis**: Caching and session management
- **Celery**: Background task processing
- **BAAI/bge-small-en-v1.5**: Embedding model

### 8-Agent Workflow

1. **Planner Agent**: Understands task and generates verification plan
2. **Claim Extraction Agent**: Extracts factual claims from LLM response
3. **Research Agent**: Retrieves information from multiple sources in parallel
4. **Evidence Agent**: Extracts relevant evidence from retrieved documents
5. **Source Ranking Agent**: Ranks sources by credibility, recency, and relevance
6. **Debate Agent (DUAL)**: Two LLMs debate the claim (Pro vs Con) using evidence
7. **Judge Agent**: Evaluates the debate and evidence to give a verdict and confidence score
8. **Report Agent**: Generates explainable reports with citations, timeline, and insights

### RAG Pipeline

```
Document Upload → PyMuPDF → Cleaning → Chunking → Embedding → Qdrant → Semantic Retrieval
```

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

```bash
cp .env.example .env
# Edit .env with your API keys
```

Required environment variables:
- `GROQ_API_KEY`: Your Groq API key from console.groq.com
- `TAVILY_API_KEY`: Your Tavily Search API key
- `DATABASE_URL`: Your Neon DB connection string from console.neon.tech

Optional:
- `QDRANT_URL`: Qdrant server URL (default: localhost:6333)
- `QDRANT_API_KEY`: Qdrant Cloud API key (if using cloud)
- `REDIS_URL`: Redis server URL (default: redis://localhost:6379/0)

### Neon DB Setup

PRAMAAN AI uses Neon DB as the default serverless PostgreSQL database:

1. **Create a Neon DB account** at https://console.neon.tech
2. **Create a new project** in the Neon console
3. **Copy the connection string** from your project dashboard
4. **Update your .env file** with the connection string:

```bash
DATABASE_URL=postgresql://username:password@ep-xxx.aws.neon.tech/neondb?sslmode=require
```

Neon DB advantages:
- Serverless PostgreSQL with auto-scaling
- Built-in connection pooling
- SSL encryption by default
- Branching for development/testing
- No infrastructure management required

## Running

```bash
python main.py
```

API available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/          # REST endpoints
│   ├── agents/       # 8 AI agents (Planner, ClaimExtraction, Research, Evidence, Ranking, Debate, Judge, Report)
│   ├── services/     # External services (Groq, Tavily, Wikipedia, OpenAlex, SemanticScholar, Qdrant, Embedding)
│   ├── graph/        # LangGraph workflow orchestration
│   ├── database/     # SQLAlchemy models (User, Session, Verification, Claim, Source, Evidence, Report)
│   ├── models/       # Pydantic schemas
│   └── utils/        # Utilities (config, logger, middleware, cache)
├── tests/            # Test suite
├── uploads/          # Document uploads for RAG
├── main.py           # Application entry point
└── requirements.txt  # Dependencies
```

## API Endpoints

- `GET /health` - Health check
- `POST /verify` - Verify LLM-generated response using 8-agent workflow
- `GET /report/{id}` - Get verification report by ID
- `GET /history` - Query verification history
- `POST /upload` - Upload documents for RAG
- `POST /search` - Direct search across multiple sources

## Database Schema

- **Users**: User accounts and preferences
- **Sessions**: Verification sessions per LLM platform
- **Verifications**: Verification requests and results
- **Claims**: Extracted factual claims
- **Sources**: Information sources with credibility scores
- **Evidence**: Extracted evidence from sources
- **Reports**: Final verification reports

## Testing

```bash
pytest tests/
```

## Browser Extension Integration

The backend is designed to work with the PRAMAAN browser extension that:
- Captures LLM responses from ChatGPT, Gemini, Claude, Perplexity, Grok
- Displays trust scores inline with responses
- Shows claim-by-claim verification results
- Provides evidence panels with source credibility ratings
