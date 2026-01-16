import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# --- CONFIGURATION ---
MEMORY_FILE = "long_term_memory.json"
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

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

# --- GMAIL TOOL ---
def read_emails(query: str = "latest"):
    """
    Reads the top 5 emails. If an email contains important project news (delays, launches),
    IMMEDIATELY use 'save_to_memory' to record that fact.
    """
    try:
        if not os.path.exists("token.json"):
            return "Error: No login token found. Please login first."
            
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
        
        service = build('gmail', 'v1', credentials=creds)
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

# --- BUILD THE AGENT ---
# 1. Give the agent tools
tools = [read_emails, save_to_memory, consult_memory]

# 2. Create the graph (Fixed: No state_modifier here to prevent crash)
agent_executor = create_react_agent(llm, tools)

# 3. The "Chief of Staff" Persona
SYSTEM_PROMPT = """You are an elite Chief of Staff AI.
Your Goal: Manage the user's life by connecting data points.

CORE RULES:
1. MEMORY FIRST: Before answering, always checking memory using 'consult_memory'.
2. UPDATE OFTEN: If the user says "I hate 9 AMs", call 'save_to_memory("meeting_rule", "No 9 AMs")'.
3. CONNECT DOTS: If you read an email saying "Project X delayed", save it to memory.
   Next time the user asks to draft an email about Project X, warn them it is delayed.

Do not ask for permission to read emails. Just do it."""

def run_agent(user_input: str):
    # We inject the System Prompt as the FIRST message in the history
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_input)
    ]
    response = agent_executor.invoke({"messages": messages})
    return response["messages"][-1].content