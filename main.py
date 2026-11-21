"""
Deathcon API - AI Wrapper + Webhook Handler
Built by Deathconbot ⚰️
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from secrets import compare_digest
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import logging
from datetime import datetime
from anthropic import Anthropic
from anthropic.types import MessageParam

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Deathcon API", description="AI Wrapper + Webhook Handler")

# CORS configuration - read from env with secure fallback
cors_origins = (
    os.getenv("CORS_ORIGINS", "*").split(",")
    if os.getenv("CORS_ORIGINS") != "*"
    else ["*"]
)
allow_credentials = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() == "true"

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=allow_credentials,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

bearer = HTTPBearer(auto_error=False)


def require_token(setting):
    def authorize(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    ):
        expected = os.getenv(setting)
        if not expected:
            raise HTTPException(
                status_code=503, detail="Access token is not configured"
            )
        if credentials is None or not compare_digest(
            credentials.credentials.encode(), expected.encode()
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid access token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return Depends(authorize)


operator_access = require_token("DEATHCON_OPERATOR_TOKEN")
webhook_access = require_token("DEATHCON_WEBHOOK_TOKEN")


# Models
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "claude"
    context: Optional[str] = None


class WebhookPayload(BaseModel):
    source: str
    data: Dict[str, Any]
    timestamp: Optional[str] = None


# In-memory storage (replace with database in production)
chat_history: List[Dict] = []
webhook_logs: List[Dict] = []

# Storage limits
MAX_HISTORY_SIZE = 100
MAX_LOGS_SIZE = 100

# Initialize Anthropic client
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    logger.warning("ANTHROPIC_API_KEY not set - chat endpoint will fail")
client = Anthropic(api_key=api_key) if api_key else None


@app.get("/")
def root():
    return {
        "name": "Deathcon API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /chat": "Send message to AI",
            "GET /history": "Get chat history",
            "POST /webhook": "Handle incoming webhooks",
            "GET /logs": "Get webhook logs",
            "GET /health": "Health check",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/chat", dependencies=[operator_access])
async def chat(request: ChatRequest):
    """AI Chat endpoint - wraps Claude"""
    try:
        if not client:
            raise HTTPException(
                status_code=500, detail="API not configured - missing ANTHROPIC_API_KEY"
            )

        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        # Add to history
        chat_history.append(
            {
                "role": "user",
                "content": request.message,
                "timestamp": datetime.now().isoformat(),
            }
        )

        # Enforce history size limit
        if len(chat_history) > MAX_HISTORY_SIZE:
            chat_history.pop(0)

        # Prepare messages for API (remove timestamps for API call)
        messages: List[MessageParam] = [
            {"role": msg["role"], "content": msg["content"]} for msg in chat_history
        ]

        # Call Claude API
        model = request.model or "claude-3-5-haiku-20241022"
        response = client.messages.create(
            model=model, max_tokens=1024, messages=messages
        )

        # Extract response content
        assistant_message = next(
            (block.text for block in response.content if block.type == "text"), None
        )
        if assistant_message is None:
            raise HTTPException(status_code=502, detail="No text returned by the model")

        # Add to history
        chat_history.append(
            {
                "role": "assistant",
                "content": assistant_message,
                "timestamp": datetime.now().isoformat(),
            }
        )

        # Enforce history size limit again
        if len(chat_history) > MAX_HISTORY_SIZE:
            chat_history.pop(0)

        return {
            "response": assistant_message,
            "model": model,
            "timestamp": datetime.now().isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process chat request")


@app.get("/history", dependencies=[operator_access])
def get_history():
    """Get chat history"""
    return {"history": chat_history}


@app.post("/webhook", dependencies=[webhook_access])
async def handle_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """Handle incoming webhooks"""
    try:
        # Validate input
        if not payload.source or not payload.source.strip():
            raise HTTPException(status_code=400, detail="Source cannot be empty")

        log_entry = {
            "source": payload.source,
            "data": payload.data,
            "timestamp": payload.timestamp or datetime.now().isoformat(),
            "received_at": datetime.now().isoformat(),
        }

        webhook_logs.append(log_entry)

        # Enforce logs size limit
        if len(webhook_logs) > MAX_LOGS_SIZE:
            webhook_logs.pop(0)

        # Process webhook based on source
        if payload.source == "github":
            # Handle GitHub webhooks
            return {"status": "processed", "action": "github_event"}
        elif payload.source == "telegram":
            # Handle Telegram webhooks
            return {"status": "processed", "action": "telegram_message"}
        elif payload.source == "n8n":
            # Handle n8n webhooks
            return {"status": "processed", "action": "n8n_trigger"}
        else:
            return {"status": "processed", "action": "unknown_source"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process webhook")


@app.get("/logs", dependencies=[operator_access])
def get_logs():
    """Get webhook logs"""
    return {"logs": webhook_logs}


@app.delete("/history", dependencies=[operator_access])
def clear_history():
    """Clear chat history"""
    chat_history.clear()
    return {"status": "cleared"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
