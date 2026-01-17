import os
import json
# --- THE FIX STARTS HERE ---
# This tells the library: "If Google adds extra scopes (like OpenID), don't crash."
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
# --- THE FIX ENDS HERE ---

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Scopes: What we are allowed to touch
SCOPES = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/gmail.send",
    "openid"
]

def create_flow():
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=f"{BACKEND_URL}/auth/callback"
    )

@router.get("/auth/login")
async def login():
    """Redirects the user to Google to log in."""
    flow = create_flow()
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    return RedirectResponse(authorization_url)

@router.get("/auth/callback")
async def callback(request: Request):
    """Google sends the user back here with a code."""
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Code not found")

    try:
        # Exchange the code for a Token
        flow = create_flow()
        flow.fetch_token(code=code)
        credentials = flow.credentials

        # --- NEW: SAVE TO FILE ---
        creds_data = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes
        }
        with open("token.json", "w") as f:
            json.dump(creds_data, f)
        # -------------------------

        print("SUCCESS: Token saved to token.json")

        # Redirect back to the Frontend Dashboard
        return RedirectResponse(url=f"{FRONTEND_URL}?status=success")
        
    except Exception as e:
        return {"error": str(e)}