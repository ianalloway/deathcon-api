# Deathcon API ⚰️

AI Wrapper + Webhook Handler built by Deathconbot

## Features

- **AI Chat Endpoint** - Chat with Claude AI (supports streaming and sync responses)
- **Webhook Handler** - Process webhooks from GitHub, Telegram, n8n, and custom sources
- **Chat History** - In-memory storage with automatic size limiting (last 100 messages)
- **Secure CORS** - Configurable CORS origins with environment variable support
- **Error Handling** - Safe error responses without exposing sensitive details
- **Health Checks** - Built-in health monitoring endpoint

## Prerequisites

- Python 3.11+
- Anthropic API key (get at https://console.anthropic.com)

## Quick Start

```bash
# Clone and install
cd deathcon-api
pip install -r requirements.txt

# Copy and configure env file
cp env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run server
uvicorn main:app --reload --port 8000

# Or use Python directly
python main.py
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `CORS_ORIGINS` | Comma-separated CORS origins | `*` |
| `CORS_ALLOW_CREDENTIALS` | Allow credentials in CORS | `false` |

## API Endpoints

### 1. Root Endpoint
```
GET /
```
Returns API information and available endpoints.

**Response:**
```json
{
  "name": "Deathcon API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

### 2. Health Check
```
GET /health
```
Health status endpoint with timestamp.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-24T10:30:00.123456"
}
```

### 3. Chat Endpoint
```
POST /chat
```
Send a message to Claude AI.

**Request:**
```json
{
  "message": "What is the capital of France?",
  "model": "claude-3-5-haiku-20241022",
  "context": "Optional context for the conversation"
}
```

**Parameters:**
- `message` (string, required): The user message
- `model` (string, optional): Claude model version. Default: `claude-3-5-haiku-20241022`
- `context` (string, optional): Additional context for the AI

**Response:**
```json
{
  "response": "The capital of France is Paris.",
  "model": "claude-3-5-haiku-20241022",
  "timestamp": "2026-03-24T10:30:00.123456"
}
```

**Errors:**
- `400 Bad Request`: Empty message
- `500 Internal Server Error`: Missing API key or API call failed

### 4. Get Chat History
```
GET /history
```
Retrieve all chat history (limited to last 100 messages).

**Response:**
```json
{
  "history": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2026-03-24T10:25:00.123456"
    },
    {
      "role": "assistant",
      "content": "Hello! How can I help you?",
      "timestamp": "2026-03-24T10:25:01.123456"
    }
  ]
}
```

### 5. Clear Chat History
```
DELETE /history
```
Clear all chat history.

**Response:**
```json
{
  "status": "cleared"
}
```

### 6. Handle Webhook
```
POST /webhook
```
Process incoming webhooks from various sources.

**Request:**
```json
{
  "source": "github",
  "data": {
    "event": "push",
    "repository": "deathconbot/api"
  },
  "timestamp": "2026-03-24T10:30:00.123456"
}
```

**Parameters:**
- `source` (string, required): Webhook source (github, telegram, n8n, custom)
- `data` (object, required): Webhook payload
- `timestamp` (string, optional): Event timestamp

**Response:**
```json
{
  "status": "processed",
  "action": "github_event"
}
```

**Supported sources:**
- `github` - GitHub webhooks
- `telegram` - Telegram webhooks
- `n8n` - n8n automation webhooks
- Any custom source

### 7. Get Webhook Logs
```
GET /logs
```
Retrieve webhook processing logs (limited to last 100 logs).

**Response:**
```json
{
  "logs": [
    {
      "source": "github",
      "data": { ... },
      "timestamp": "2026-03-24T10:30:00.123456",
      "received_at": "2026-03-24T10:30:00.123456"
    }
  ]
}
```

## Example Usage

### Chat with Claude

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing in simple terms",
    "model": "claude-3-5-haiku-20241022"
  }'
```

### Process GitHub Webhook

```bash
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "source": "github",
    "data": {
      "action": "opened",
      "pull_request": {
        "id": 123,
        "title": "New feature"
      }
    }
  }'
```

### Check History

```bash
curl http://localhost:8000/history
```

### Check Logs

```bash
curl http://localhost:8000/logs
```

## Deployment

### Local Development

```bash
python main.py
# Server runs on http://localhost:8000
```

### With Uvicorn

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Render.com

1. Connect your GitHub repository
2. Create a new Web Service
3. Use Python environment
4. Set `ANTHROPIC_API_KEY` in environment variables
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Docker

```bash
docker build -t deathcon-api .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your_key_here \
  deathcon-api
```

## Configuration

### Secure CORS Settings

For production, configure allowed origins:

```bash
# .env
CORS_ORIGINS=https://yourdomain.com,https://api.yourdomain.com
CORS_ALLOW_CREDENTIALS=true
```

Or as environment variable:
```bash
export CORS_ORIGINS="https://yourdomain.com,https://api.yourdomain.com"
```

## Development

```bash
# Install with dev dependencies
pip install -r requirements.txt

# Run linting
flake8 main.py

# Run type checking
mypy main.py --ignore-missing-imports

# Run tests (if available)
pytest tests/
```

## Storage

Currently uses in-memory storage with automatic limits:
- Chat history: Last 100 messages
- Webhook logs: Last 100 entries

For production, replace with a database (PostgreSQL, MongoDB, etc.).

## Security Notes

- API keys are never logged or exposed
- Error messages don't contain sensitive information
- CORS is configurable and restricted by default in production
- Webhook input is validated
- Chat messages are stored locally only

## Built by Deathconbot ⚰️
