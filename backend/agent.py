import os
import json
import base64
import psycopg2
import datetime
from email.mime.text import MIMEText
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


DB_URL = os.getenv("DATABASE_URL")
llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.1)

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
    """Wipes the database memory AND the chat history."""
    global chat_history
    chat_history = [] # <--- WIPE SHORT TERM MEMORY
    
    conn = get_db_connection()
    if not conn: return "Error: Could not connect to database."
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM memory")
        conn.commit()
        cur.close()
        conn.close()
        return "Memory and Chat History have been wiped."
    except Exception as e:
        return f"Error wiping DB: {str(e)}"
    

# --- CALENDAR TOOLS (NEW) ---
def list_events():
    """Lists the next 5 upcoming calendar events with durations."""
    try:
        service = get_google_service('calendar', 'v3')
        if not service: return "Error: Login required."
        
        # Get UTC time now
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        
        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              maxResults=5, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])
        if not events: return "No upcoming events found."
        
        event_list = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            summary = event['summary']
            event_list.append(f"Event: {summary} | Start: {start} | End: {end}")
            
        return "\n".join(event_list)
    except Exception as e:
        return f"Error reading calendar: {str(e)}"

def schedule_event(summary: str, start_time: str, end_time: str):
    """
    Schedules a meeting. 
    IMPORTANT: Dates must be ISO strings, e.g., '2026-01-20T10:00:00'
    """
    try:
        service = get_google_service('calendar', 'v3')
        if not service: return "Error: Login required."
        
        event = {
            'summary': summary,
            'start': {'dateTime': start_time, 'timeZone': 'UTC'},
            'end': {'dateTime': end_time, 'timeZone': 'UTC'},
        }
        event = service.events().insert(calendarId='primary', body=event).execute()
        return f"SUCCESS: Event created: {event.get('htmlLink')}"
    except Exception as e:
        return f"Error creating event: {str(e)}"    

# --- GMAIL TOOLS ---
def get_google_service(service_name, version):
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
    return build(service_name, version, credentials=creds)

def read_emails(search_term: str = "latest"):
    """
    Reads emails from Gmail. Returns FULL BODY content, not just snippets.
    - If search_term is 'latest', returns the top 5.
    - If search_term is specific, searches for it.
    """
    try:
        service = get_google_service('gmail', 'v1')
        if not service: return "Error: No login token found. Please login first."
        
        if search_term == "latest":
            results = service.users().messages().list(userId='me', maxResults=5).execute()
        else:
            results = service.users().messages().list(userId='me', q=search_term, maxResults=5).execute()
            
        messages = results.get('messages', [])
        if not messages: return "No emails found."
        
        email_data = []
        for msg in messages:
            txt = service.users().messages().get(userId='me', id=msg['id']).execute()
            payload = txt.get('payload', {})
            headers = payload.get('headers', [])
            
            # 1. Extract Headers
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown Sender')
            
            # 2. Extract Full Body (Decode from Base64)
            body = "No Body Found"
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data')
                        if data:
                            body = base64.urlsafe_b64decode(data).decode()
                        break
            elif 'body' in payload:
                data = payload['body'].get('data')
                if data:
                    body = base64.urlsafe_b64decode(data).decode()

            # 3. Clean up the body (truncate if massive to save tokens)
            clean_body = body[:2000] # Limit to 2000 chars to avoid token overflow
            
            email_data.append(f"email_id: {msg['id']}\nFROM: {sender}\nSUBJECT: {subject}\nBODY: {clean_body}\n---")
            
        return "\n".join(email_data)
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
        service = get_google_service('gmail', 'v1')
        if not service: return "Error: Please login first."

        message = MIMEText(body)
        message['to'] = to
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        message_body = {'raw': raw}

        service.users().messages().send(userId='me', body=message_body).execute()
        return f"SUCCESS: Email sent to {to}. IMPORTANT: If this email proposed a meeting time, call 'save_to_memory' now to record it."
    except Exception as e:
        return f"Error sending email: {str(e)}"

# --- BUILD THE AGENT ---
# 1. Give the agent tools (Added send_email)
tools = [read_emails, send_email, list_events, schedule_event, save_to_memory, consult_memory, clear_memory]

# 2. Create the graph
agent_executor = create_react_agent(llm, tools)


# 3. The "Chief of Staff" Persona
BASE_SYSTEM_PROMPT = """You are an elite Personal Agentic AI Assistant that acts as a Chief of Staff.
Your Goal: Manage the user's life by connecting data points, but NEVER compromise accuracy or safety.

CURRENT CONTEXT:
- **Today's Date & Time:** {current_time}
- **Timezone:** UTC (Convert to local time if requested).

CORE RULES:

1. **PASSIVE MEMORY (CRITICAL):** - When you use 'read_emails', you must ACTIVELY look for new facts (e.g., "Project X is delayed", "New deadline is Friday").
   - If you find a new fact, **IMMEDIATELY call 'save_to_memory'** to store it. Do not ask for permission. Just save it.
   - Example: If email says "Project X delayed", call `save_to_memory("Project X Status", "Delayed by 2 weeks")`.

2. **MEMORY FIRST:** - Always check memory using 'consult_memory' before acting.

3. **RECIPIENT ACCURACY:** - When drafting a reply, YOU MUST use the exact 'FROM' address found in the 'read_emails' output.
   - Never use 'example.com' or generic placeholders. 
   - If the user says "Send it", look back at your draft and extract that specific 'To' address. DO NOT default to the user's own email.

4. **DRAFT VS SEND:** - If the user says "Draft a reply", generate the text and ask "Shall I send this?". DO NOT use the 'send_email' tool yet.
   - If the user says "Send an email", you may use 'send_email' immediately.

5. **CALENDAR MANAGEMENT:** - **Check First:** BEFORE scheduling, ALWAYS call 'list_events' to see what is already booked.
   - **Conflict Check:** If 'list_events' shows a meeting from 10:00 to 11:00, DO NOT book another one at 10:30.
   - **Duration:** If the user doesn't specify a duration, assume 1 hour. Calculate the 'end_time' accordingly.
   - **ISO Format:** You must use this format: 'YYYY-MM-DDTHH:MM:SS' (e.g., '2026-01-20T14:00:00').
   - **Date Calculation:** Use "Today's Date" (provided above) to calculate "Tomorrow" or "Next Monday" accurately.   

6. **INTELLIGENT INTERVENTION:** - If the user asks for a 10 AM meeting, but memory says "Hates 10 AMs", CHANGE it to 11 AM in the draft.
   - CRITICAL: If you change a detail based on memory, you MUST explain why and ask for confirmation before sending.

7. **RESET:** - If the user asks to "forget everything", use 'clear_memory' to wipe the database.

You have permission to send emails, prefer verification for important messages.
You have permission to update memory autonomously. 
You have permission to manage and update calendar autonomously. """

chat_history = []

def run_agent(user_input: str):
    global chat_history
    
    # 1. Get real-time date (UTC to match server time)
    now = datetime.datetime.utcnow().strftime("%A, %Y-%m-%d %H:%M:%S UTC")
    
    # 2. Inject date into the Base Prompt
    # Note: We renamed SYSTEM_PROMPT to BASE_SYSTEM_PROMPT above
    current_system_prompt = BASE_SYSTEM_PROMPT.format(current_time=now)
    
    # 3. Initialize history or Update the System Prompt
    if not chat_history:
        chat_history.append(SystemMessage(content=current_system_prompt))
    else:
        # FORCE update the first message (System Prompt) so the date is always fresh
        chat_history[0] = SystemMessage(content=current_system_prompt)
    
    # 4. Add User Input
    chat_history.append(HumanMessage(content=user_input))
    
    # 5. Invoke Agent
    response = agent_executor.invoke({"messages": chat_history})
    agent_output = response["messages"][-1]
    chat_history.append(agent_output)
    
    # 6. Response Handling
    content = agent_output.content
    if isinstance(content, list):
        final_text = ""
        for block in content:
            if isinstance(block, dict) and "text" in block:
                final_text += block["text"]
        return final_text
    return str(content)