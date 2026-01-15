from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "active", "message": "Personal AI Agent Backend is Running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}