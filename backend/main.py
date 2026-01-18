from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware 
from auth import router as auth_router
from agent import run_agent
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from agent import run_agent, get_upcoming_events_list

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://personal-ai-frontend-l6wt.onrender.com"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "secret"))

app.include_router(auth_router)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(request: ChatRequest):
    """Send a message to the AI Agent."""
    response = run_agent(request.message)
    return {"response": response}


@app.get("/next-event")
def get_next_event():
    events = get_upcoming_events_list()
    if not events:
        return [] # Return empty list if nothing found
    return events

@app.get("/")
def read_root():
    return {"status": "active", "message": "Personal AI Agent Backend is Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}



