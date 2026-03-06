"""
Deathcon API - AI Wrapper + Webhook Handler
Built by Deathconbot ⚰️
"""

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
import anthropic
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="Deathcon API", description="AI Wrapper + Webhook Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Anthropic client (uses ANTHROPIC_API_KEY from environment)
ai_client = anthropic.AsyncAnthropic()

# Model aliases
MODEL_MAP = {
    "claude": "claude-opus-4-6",
    "opus": "claude-opus-4-6",
    "sonnet": "claude-sonnet-4-6",
    "haiku": "claude-haiku-4-5",
}

def resolve_model(model: str) -> str:
    return MODEL_MAP.get(model.lower(), model)


# Models
class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "claude"
    context: Optional[str] = None  # System prompt / persona context
    stream: Optional[bool] = False
    conversation_id: Optional[str] = None  # Reserved for future session tracking

class WebhookPayload(BaseModel):
    source: str
    data: Dict[str, Any]
    timestamp: Optional[str] = None


# In-memory storage (replace with database in production)
chat_history: List[Dict] = []
webhook_logs: List[Dict] = []


@app.get("/")
def root():
    return {
        "name": "Deathcon API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /chat": "Send message to AI (set stream=true for SSE streaming)",
            "GET /history": "Get chat history",
            "DELETE /history": "Clear chat history",
            "POST /webhook": "Handle incoming webhooks",
            "GET /logs": "Get webhook logs",
            "GET /health": "Health check",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/chat")
async def chat(request: ChatRequest):
    """AI Chat endpoint — wraps Claude via the Anthropic API."""
    model = resolve_model(request.model or "claude")
    system_prompt = request.context or "You are a helpful AI assistant."

    # Build message history for this conversation (last 20 turns to keep context manageable)
    history_messages = [
        {"role": m["role"], "content": m["content"]}
        for m in chat_history[-40:]  # 20 user + 20 assistant turns
        if m["role"] in ("user", "assistant")
    ]
    history_messages.append({"role": "user", "content": request.message})

    # Record user message
    chat_history.append(
        {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat(),
        }
    )

    if request.stream:
        return StreamingResponse(
            _stream_chat(model, system_prompt, history_messages),
            media_type="text/event-stream",
        )

    # Non-streaming path
    try:
        response = await ai_client.messages.create(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            thinking={"type": "adaptive"},
            messages=history_messages,
        )

        assistant_text = next(
            (block.text for block in response.content if block.type == "text"), ""
        )

        chat_history.append(
            {
                "role": "assistant",
                "content": assistant_text,
                "timestamp": datetime.now().isoformat(),
            }
        )

        return {
            "response": assistant_text,
            "model": model,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
            "timestamp": datetime.now().isoformat(),
        }

    except anthropic.AuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid Anthropic API key. Set ANTHROPIC_API_KEY.")
    except anthropic.RateLimitError:
        raise HTTPException(status_code=429, detail="Anthropic rate limit reached. Try again shortly.")
    except anthropic.BadRequestError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


async def _stream_chat(model: str, system_prompt: str, messages: list):
    """Async generator that streams Claude responses as SSE."""
    full_text = ""
    try:
        async with ai_client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            thinking={"type": "adaptive"},
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                full_text += text
                yield f"data: {json.dumps({'delta': text})}\n\n"

            final = await stream.get_final_message()
            yield f"data: {json.dumps({'done': True, 'model': model, 'usage': {'input_tokens': final.usage.input_tokens, 'output_tokens': final.usage.output_tokens}})}\n\n"

    except anthropic.AuthenticationError:
        yield f"data: {json.dumps({'error': 'Invalid Anthropic API key'})}\n\n"
        return
    except anthropic.RateLimitError:
        yield f"data: {json.dumps({'error': 'Rate limit reached'})}\n\n"
        return
    except anthropic.APIStatusError as e:
        yield f"data: {json.dumps({'error': e.message})}\n\n"
        return

    # Persist assistant reply after stream completes
    chat_history.append(
        {
            "role": "assistant",
            "content": full_text,
            "timestamp": datetime.now().isoformat(),
        }
    )


@app.get("/history")
def get_history():
    """Get chat history (last 50 messages)."""
    return {"history": chat_history[-50:]}


@app.delete("/history")
def clear_history():
    """Clear chat history."""
    chat_history.clear()
    return {"status": "cleared"}


@app.post("/webhook")
async def handle_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """Handle incoming webhooks."""
    try:
        log_entry = {
            "source": payload.source,
            "data": payload.data,
            "timestamp": payload.timestamp or datetime.now().isoformat(),
            "received_at": datetime.now().isoformat(),
        }

        webhook_logs.append(log_entry)

        if payload.source == "github":
            return {"status": "processed", "action": "github_event"}
        elif payload.source == "telegram":
            return {"status": "processed", "action": "telegram_message"}
        elif payload.source == "n8n":
            return {"status": "processed", "action": "n8n_trigger"}
        else:
            return {"status": "processed", "action": "unknown_source"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/logs")
def get_logs():
    """Get webhook logs (last 50 entries)."""
    return {"logs": webhook_logs[-50:]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
