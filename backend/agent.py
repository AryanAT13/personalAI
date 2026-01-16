import os
import json
import base64
from email.mime.text import MIMEText
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# --- CONFIGURATION ---
MEMORY_FILE = "long_term_memory.json"
# Using 1.5-flash as it is the current stable standard for this library version
llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0.3)

# --- MEMORY TOOLS (The Brain) ---
def _get_memory():
    if not os.path.exists(MEMORY_FILE):
        return {}
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def save_to_memory(key: str, value: str):
    """
    Saves a fact about the user or a project to long-term memory.
    Key examples: 'user_preference', 'project_status', 'meeting_rule'.
    Value examples: 'Hates 9 AM meetings', 'Project X is delayed'.
    """
    mem = _get_memory()
    mem[key] = value
    with open(MEMORY_FILE, "w") as f:
        json.dump(mem, f)
    return f"Memory updated: {key} -> {value}"

def consult_memory(query: str = "all"):
    """
    Retrieves facts from long-term memory to help answer questions.
    Always use this before drafting emails or scheduling to check for rules/status.
    """
    mem = _get_memory()
    return f"Current Long-Term Memory: {json.dumps(mem, indent=2)}"

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

def read_emails(query: str = "latest"):
    """
    Reads the top 5 emails. If an email contains important project news (delays, launches),
    IMMEDIATELY use 'save_to_memory' to record that fact.
    """
    try:
        service = get_gmail_service()
        if not service: return "Error: No login token found. Please login first."
        
        results = service.users().messages().list(userId='me', maxResults=5).execute()
        messages = results.get('messages', [])
        
        email_summaries = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            headers = txt['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            snippet = txt.get('snippet', '')
            email_summaries.append(f"Subject: {subject} | Body: {snippet}")
            
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
tools = [read_emails, send_email, save_to_memory, consult_memory]

# 2. Create the graph
agent_executor = create_react_agent(llm, tools)

# 3. The "Chief of Staff" Persona
SYSTEM_PROMPT = """You are an elite Chief of Staff AI.
Your Goal: Manage the user's life by connecting data points.

CORE RULES:
1. MEMORY FIRST: Always check memory using 'consult_memory' before acting.
2. ACTION OVER ASKING: If the user says "Reply to Bob", just draft and SEND the email using 'send_email'. 
   Do not ask for confirmation unless the topic is sensitive or ambiguous.
3. CONTEXT: If memory says "Project X is delayed", mention that in emails about Project X.

You have permission to send emails. Use the 'send_email' tool freely when asked."""

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