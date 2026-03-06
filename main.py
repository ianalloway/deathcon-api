"""
Deathcon API - AI Wrapper + Webhook Handler
Built by Deathconbot ⚰️
"""

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import json
from datetime import datetime

app = FastAPI(title="Deathcon API", description="AI Wrapper + Webhook Handler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            "GET /health": "Health check"
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/chat")
async def chat(request: ChatRequest):
    """AI Chat endpoint - wraps Claude/OpenAI"""
    try:
        # Add to history
        chat_history.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        })
        
        # TODO: Connect to actual AI
        # For now, echo back (placeholder)
        response = f"Echo: {request.message}"
        
        chat_history.append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        return {
            "response": response,
            "model": request.model,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    """Get chat history"""
    return {"history": chat_history[-50:]}  # Last 50 messages

@app.post("/webhook")
async def handle_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """Handle incoming webhooks"""
    try:
        log_entry = {
            "source": payload.source,
            "data": payload.data,
            "timestamp": payload.timestamp or datetime.now().isoformat(),
            "received_at": datetime.now().isoformat()
        }
        
        webhook_logs.append(log_entry)
        
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
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/logs")
def get_logs():
    """Get webhook logs"""
    return {"logs": webhook_logs[-50:]}  # Last 50 logs

@app.delete("/history")
def clear_history():
    """Clear chat history"""
    chat_history.clear()
    return {"status": "cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
