# Sentient

> **Your Second Brain. Powered by Logic.**
> 
> An autonomous "Chief of Staff" agent that manages your inbox, calendar, and memory.

---

## ✦ The Vision

**Sentient** is not just a chatbot; it is an agentic workflow engine designed to reclaim your time. Unlike standard assistants that wait for commands, Sentient actively manages your digital life.

It connects a **Reactive Frontend** (Next.js/Tailwind) with a **Cognitive Backend** (LangGraph/Gemini), allowing it to:
* **Read & Reason:** Analyze emails and calendar for action items, not just keywords.
* **Act Autonomously:** Schedule, reschedule, and delete meetings based on deep context.
* **Remember Forever:** Utilizes vector-based/PostgreSQL long-term memory to recall user preferences.

---

##  Key Capabilities

### 1. Inbox Intelligence 
Sentient connects to Gmail via OAuth to perform semantic analysis on your inbox.
* **Summarization:** Condenses long thread chains into actionable bullet points.
* **Contextual Drafting:** Drafts replies using the correct "From" aliases and historical context.

### 2. Time Sovereignty 
Full bi-directional control of Google Calendar.
* **Conflict Resolution:** Checks for overlaps before proposing times.
* **Smart Scheduling:** "Book a meeting with Joel" automatically finds the best slot based on your preferences.
* **Management:** Can delete and reschedule events autonomously when plans change.

### 3. Infinite Context (Active Memory) 
Powered by **PostgreSQL**, Sentient maintains a persistent user profile.
* **Fact Extraction:** Automatically extracts constraints from emails and saves them.
* **Preference Recall:** Consults memory before every action.

---

##  Tech Stack & Architecture

### **Frontend (The Face)**
* **Framework:** Next.js 14 (React)
* **Styling:** Tailwind CSS v4 + Framer Motion (Animations)
* **UI/UX:** Glassmorphism, Fluid Mesh Gradients, Lucide Icons

### **Backend (The Brain)**
* **Core:** Python FastAPI
* **Agent Framework:** LangGraph + LangChain
* **LLM:** Google Gemini 3.0 Flash (optimized for speed/cost)
* **Database:** PostgreSQL (hosted on Render)

### **Infrastructure (The Cloud)**
* **Containerization:** Docker (Multi-stage builds)
* **Deployment:** Render (Auto-Deploy from GitHub) 
* **CI/CD:** Automated pipelines trigger on every push to `main`.
  
<details>
<summary><em> Why Render instead of AWS?</em></summary>
  
AWS didn't like my debit cards, cancelled 4 of them! so couldn't set up billing.
</details>  

---

## Getting Started

### Prerequisites
* Docker & Docker Compose
* Google Cloud Console Project (with Gmail/Calendar APIs enabled)
* Google Gemini API Key

### 1. Installation

```bash
# Clone the repository
git clone [https://github.com/yourusername/sentient.git](https://github.com/yourusername/sentient.git)
cd sentient

# Setup Backend Environment
cd backend
cp .env.example .env
# Fill in your GOOGLE_CLIENT_ID, SECRET, and GEMINI_API_KEY
```
### 2. Run with Docker (Recommended)
Sentient is fully containerized. You can spin up the entire stack (Frontend + Backend) with one command:

```bash

docker-compose up --build
The app will be available at:

Frontend: http://localhost:3000
Backend: http://localhost:8000
```

### 3. Deployment Strategy
This project utilizes a Microservices Architecture deployed on Render.

* **Frontend Service:** Deployed as a Static Site (Next.js export).
* **Backend Service:** Deployed as a Web Service (Python/FastAPI) running inside a Docker Container.
* **Database:** Managed PostgreSQL instance on Render.

### 4. CI/CD Pipeline
Deployment is fully automated. Pushing to the main branch triggers Render's build pipeline, which:

* Builds the Docker image from backend/Dockerfile.
* Runs health checks.
* Performs a zero-downtime rollout.

### 5. Security & Privacy

* **OAuth 2.0:** Uses Google's official OAuth flow. User tokens are stored securely and never exposed to the client.
* **Data Isolation:** User memory is isolated in the database.
* **No Training:** User data is processed ephemerally by the LLM and is not used for model training.
