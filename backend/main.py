from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
from auth import router as auth_router
from agent import run_agent
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# --- FIX: ALLOW FRONTEND TO TALK TO BACKEND ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------------

# Session Middleware (Required for Google Auth)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "secret"))

# Include Auth Routes
app.include_router(auth_router)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    """Send a message to the AI Agent."""
    response = run_agent(request.message)
    return {"response": response}

@app.get("/")
def read_root():
    return {"status": "active", "message": "Personal AI Agent Backend is Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}