from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from auth import router as auth_router
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from agent import run_agent

load_dotenv()

app = FastAPI()

# Session Middleware is required for OAuth to remember state
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "secret"))

# Include the Auth Routes
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"status": "active", "message": "Personal AI Agent Backend is Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    """Send a message to the AI Agent."""
    response = run_agent(request.message)
    return {"response": response}