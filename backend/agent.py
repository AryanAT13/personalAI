import os
import json
import base64
import psycopg2
from email.mime.text import MIMEText
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


DB_URL = os.getenv("DATABASE_URL")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.1)

# --- DATABASE TOOLS (The Immortal Brain) ---
def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    try:
        conn = psycopg2.connect(DB_URL, sslmode='require')
        return conn
    except Exception as e:
        return None

def init_db():
    """Creates the memory table if it doesn't exist."""
    conn = get_db_connection()
    if not conn: return
    try:
        cur = conn.cursor()
        # Create a simple table: Key (Topic) -> Value (Fact)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS memory (
                key TEXT PRIMARY KEY,
                value TEXT
            );
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Init DB Error: {e}")

# Initialize DB immediately on startup
if DB_URL:
    init_db()

def save_to_memory(key: str, value: str):
    """Saves a fact to the PostgreSQL database (Persistent)."""
    conn = get_db_connection()
    if not conn: return "Error: Could not connect to database."
    try:
        cur = conn.cursor()
        # Upsert: Insert new, or Update if key exists
        cur.execute("""
            INSERT INTO memory (key, value)
            VALUES (%s, %s)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
        """, (key, value))
        conn.commit()
        cur.close()
        conn.close()
        return f"Memory updated (Saved to DB): {key} -> {value}"
    except Exception as e:
        return f"Error saving to DB: {str(e)}"

def consult_memory(query: str = "all"):
    """Retrieves facts from the PostgreSQL database."""
    conn = get_db_connection()
    if not conn: return "Error: Could not connect to database."
    try:
        cur = conn.cursor()
        cur.execute("SELECT key, value FROM memory")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        if not rows:
            return "Memory is empty."
        
        # Format as JSON for the AI to read
        memory_dict = {row[0]: row[1] for row in rows}
        return f"Current Long-Term Memory: {json.dumps(memory_dict, indent=2)}"
    except Exception as e:
        return f"Error reading DB: {str(e)}"

def clear_memory():
    """Wipes the database memory."""
    conn = get_db_connection()
    if not conn: return "Error: Could not connect to database."
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM memory")
        conn.commit()
        cur.close()
        conn.close()
        return "Memory database has been completely wiped."
    except Exception as e:
        return f"Error wiping DB: {str(e)}"

# --- GMAIL TOOLS ---
def get_gmail_service():
    """Helper to authenticate and get the Gmail service."""
    if not os.path.exists("token.json"):
        return None
        
    with open("token.json", "r") as f:
        creds_data = json.load(f)
        
    creds = Credentials(
        token=creds_data["token"],
        refresh_token=creds_data["refresh_token"],
        token_uri=creds_data["token_uri"],
        client_id=creds_data["client_id"],
        client_secret=creds_data["client_secret"],
        scopes=creds_data["scopes"]
    )
    return build('gmail', 'v1', credentials=creds)

def read_emails(search_term: str = "latest"):
    """
    Reads emails from Gmail. 
    - If search_term is 'latest', returns the top 10 emails.
    - If search_term is specific (e.g., 'Project X'), searches for that phrase.
    """
    try:
        service = get_gmail_service()
        if not service: return "Error: No login token found. Please login first."
        
        # Decide: List latest OR Search specific
        if search_term == "latest":
            results = service.users().messages().list(userId='me', maxResults=10).execute()
        else:
            # Gmail API uses 'q' for search (e.g., "subject:Project X")
            results = service.users().messages().list(userId='me', q=search_term, maxResults=5).execute()
            
        messages = results.get('messages', [])
        
        if not messages:
            return "No emails found matching your query."
        
        email_summaries = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            headers = txt['payload']['headers']
            
            # --- UPGRADE: EXTRACT SENDER ---
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown Sender')
            # -------------------------------
            
            snippet = txt.get('snippet', '')
            
            # Feed the 'From' address to the AI so it knows who to reply to
            email_summaries.append(f"From: {sender} | Subject: {subject} | Body: {snippet}")
            
        return "\n".join(email_summaries)
        
    except Exception as e:
        return f"Error reading emails: {str(e)}"
    
def send_email(to: str, subject: str, body: str):
    """
    Sends an email using the user's Gmail account.
    ARGS:
    - to: The email address of the recipient (e.g., 'boss@example.com')
    - subject: The subject line
    - body: The plain text content of the email
    """
    try:
        service = get_gmail_service()
        if not service: return "Error: Please login first."

        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message_body = {'raw': raw}

        service.users().messages().send(userId='me', body=message_body).execute()
        return f"SUCCESS: Email sent to {to} with subject '{subject}'"
    except Exception as e:
        return f"Error sending email: {str(e)}"

# --- BUILD THE AGENT ---
# 1. Give the agent tools (Added send_email)
tools = [read_emails, send_email, save_to_memory, consult_memory, clear_memory]

# 2. Create the graph
agent_executor = create_react_agent(llm, tools)

# 3. The "Chief of Staff" Persona
SYSTEM_PROMPT = """You are an elite Chief of Staff AI.
Your Goal: Manage the user's life by connecting data points, but NEVER compromise accuracy or safety.

CORE RULES:
1. MEMORY FIRST: Always check memory using 'consult_memory' before acting.
2. DRAFT VS SEND: 
   - If the user says "Draft a reply", generate the text and ask "Shall I send this?". DO NOT use the 'send_email' tool yet.
   - If the user says "Send an email", you may use 'send_email' immediately.
   - When the user says "Send it", YOU MUST look back at the draft you created.
   - Extract the 'To' address from that draft.
   - DO NOT send the email to the user's own address unless explicitly asked.
   - Always verify: Am I replying to the sender?
3. INTELLIGENT INTERVENTION: 
   - If the user asks for a 10 AM meeting, but memory says "Hates 10 AMs", CHANGE it to 11 AM in the draft.
   - CRITICAL: If you change a detail based on memory, you MUST explain why and ask for confirmation before sending.
4. ACCURACY: When replying to an email, always use the 'From' address found in the search results as the recipient.
5. RESET: If the user asks to "forget everything", use 'clear_memory' to wipe the database

You have permission to send emails, but prefer verification for important messages."""

def run_agent(user_input: str):
    # We inject the System Prompt as the FIRST message in the history
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_input)
    ]
    response = agent_executor.invoke({"messages": messages})
    
    # --- HANDLE COMPLEX RESPONSE TYPES ---
    content = response["messages"][-1].content
    
    # If the AI returns a list of blocks (common with Gemini), extract the text
    if isinstance(content, list):
        final_text = ""
        for block in content:
            if isinstance(block, dict) and "text" in block:
                final_text += block["text"]
        return final_text
    
    # If it's already a string, just return it
    return str(content)