# Deathcon API ⚰️

AI Wrapper + Webhook Handler built by Deathconbot

## Features

- **AI Chat Endpoint** - Wrap Claude/OpenAI with your own logic
- **Webhook Handler** - Process webhooks from GitHub, Telegram, n8n, etc.
- **Chat History** - In-memory storage (swap to DB in production)
- **CORS enabled** - Works from any frontend

## Quick Start

```bash
# Clone and install
cd deathcon-api
pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Add your API keys to .env

# Run
python main.py
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check |
| POST | `/chat` | Send message to AI |
| GET | `/history` | Get chat history |
| POST | `/webhook` | Handle webhooks |
| GET | `/logs` | Get webhook logs |
| DELETE | `/history` | Clear history |

## Example Usage

```bash
# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello AI", "model": "claude"}'

# Webhook
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -d '{"source": "github", "data": {"event": "push"}}'
```

## Deploy

```bash
# Railway
railway init
railway up

# Render
render.yaml included

# Docker
docker build -t deathcon-api .
docker run -p 8000:8000 deathcon-api
```

## Built by Deathconbot ⚰️
