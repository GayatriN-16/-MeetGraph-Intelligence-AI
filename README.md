# MeetGraph AI – Enterprise Meeting Intelligence Platform

**Final Year BE Computer Engineering Project**

**Developed collaboratively by:**
- Gayatri Nikam
- Vaibhav Pawar
- Rutuja Jadhav
- Yash Kumbhar

**GitHub Repository:** [MeetGraph AI](https://github.com/GayatriN-16/-MeetGraph-Intelligence-AI)

**Live Application:** [MeetGraph AI](https://ais-dev-l4aknxur6g64jcbniqpmfm-330250524849.asia-southeast1.run.app)

---

## 1. Project Overview

MeetGraph AI is an AI-powered meeting intelligence platform designed to reduce the effort required to review and manage meeting discussions.

Users can upload meeting recordings, process audio into timestamped transcripts, identify speakers, generate AI-powered meeting summaries, extract action items and decisions, and ask questions about individual meetings or an entire project.

The platform aims to create a connected knowledge base from multiple meetings, helping users retrieve important information without manually reviewing complete recordings.

### Problem Statement

Organizations conduct multiple meetings to discuss projects, assign responsibilities, make decisions and track progress. However, important information is often distributed across recordings, notes and conversations.

MeetGraph AI addresses this problem by providing a centralized platform for meeting transcription, information extraction, summaries and evidence-based question answering.

## 2. Key Features

- **Meeting Management:** Upload and manage multiple meeting recordings under a project.
- **Audio Transcription:** Convert supported audio and video recordings into text using Faster-Whisper.
- **Speaker Diarization:** Identify different speakers and associate transcript segments with speaker information using pyannote.audio.
- **AI Meeting Summaries:** Generate structured meeting summaries, discussion topics and key points using Google Gemini.
- **Action Item Extraction:** Identify tasks, assigned people and explicitly mentioned deadlines.
- **Decision Extraction:** Extract meeting decisions from available transcript evidence.
- **Project Intelligence Dashboard:** View meeting statistics, processing status, action items and decisions.
- **Ask AI:** Ask questions about a selected meeting or multiple meetings within a project.
- **Evidence-Based Responses:** Retrieve supporting transcript excerpts with meeting references, speaker information and timestamps.
- **Meeting-Specific Intelligence:** Review the discussion, topics and extracted information from individual meetings.

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript |
| UI and Styling | Tailwind CSS, Lucide React, Motion |
| Frontend Build Tool | Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Speech-to-Text | Faster-Whisper |
| Speaker Diarization | pyannote.audio |
| Audio Processing | PyAV |
| Generative AI | Google Gemini API |
| Development Tools | VS Code, Git, GitHub |

## 4. System Architecture

```text
                 USER
                   |
                   v
       REACT + TYPESCRIPT FRONTEND
                   |
             REST API Requests
                   |
                   v
             FASTAPI BACKEND
                   |
          +--------+---------+
          |                  |
          v                  v
     POSTGRESQL          AUDIO STORAGE
          |                  |
          |                  v
          |          AUDIO PREPROCESSING
          |                  |
          |                  v
          |          FASTER-WHISPER
          |                  |
          |                  v
          |          SPEAKER DIARIZATION
          |             (pyannote)
          |                  |
          |                  v
          |        TIMESTAMPED TRANSCRIPT
          |                  |
          |                  v
          |          GEMINI AI ANALYSIS
          |                  |
          |          +-------+-------+
          |          |       |       |
          |          v       v       v
          |        SUMMARY  TOPICS  INSIGHTS
          |          |       |       |
          |          +-------+-------+
          |                  |
          v                  v
       PROJECT DATA     QUESTION ANSWERING
          |                  |
          +--------+---------+
                   |
                   v
          FRONTEND RESULTS
```

**Architecture note:** PostgreSQL stores application data. Audio files are stored using the configured filesystem storage directory. Gemini provides AI-powered meeting summaries, while the current question-answering implementation uses local transcript and extracted evidence retrieval.

Neo4j, ChromaDB and GraphRAG are planned extensions and should not be considered implemented components of the current version.

## 5. Application Modules

### Dashboard

Provides an overview of project meetings, processing information, extracted tasks and decisions.

### Meetings

Allows users to upload, view and manage meeting recordings.

### Meeting Intelligence

Processes meeting recordings and presents transcripts, summaries, discussion topics and extracted information.

### Ask AI

Allows users to ask natural-language questions about one meeting or across meetings within a project. Responses can include supporting transcript evidence.

### Tasks and Decisions

Displays extracted action items, assignees, deadlines and meeting decisions.

### Knowledge Graph

Provides the frontend module for knowledge graph exploration. Full Neo4j-backed graph storage and GraphRAG functionality remain future development work.

## 6. Backend API Overview

The backend exposes REST APIs under the `/api/v1` prefix.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Check application and database health |
| GET | `/api/v1/projects` | Retrieve projects |
| GET | `/api/v1/meetings` | Retrieve project meetings |
| POST | `/api/v1/meetings/upload` | Upload a meeting recording |
| POST | `/api/v1/meetings/{meeting_id}/transcribe` | Transcribe a recording |
| POST | `/api/v1/meetings/{meeting_id}/extract` | Extract meeting intelligence |
| GET | `/api/v1/meetings/{meeting_id}/intelligence` | Retrieve meeting intelligence |
| GET | `/api/v1/projects/{project_id}/intelligence` | Retrieve project intelligence |
| POST | `/api/v1/meetings/{meeting_id}/ai-summary` | Generate an AI meeting summary |
| POST | `/api/v1/meetings/{meeting_id}/evidence-insights` | Generate transcript-supported insights |
| POST | `/api/v1/projects/{project_id}/ask` | Ask questions about project meetings |

For complete request and response specifications, run the backend and visit `/docs` for interactive Swagger API documentation.

## 7. Getting Started

### Prerequisites

- Python 3.10
- Node.js and npm
- PostgreSQL
- Google Gemini API key
- Hugging Face access token for the diarization model

### Step 1: Clone the Repository

```bash
git clone https://github.com/GayatriN-16/-MeetGraph-Intelligence-AI.git

cd -MeetGraph-Intelligence-AI
```

### Step 2: Configure the Backend

```bash
cd backend

python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create `backend/.env` using `backend/.env.example` as a reference.

Configure the following values:

```env
POSTGRES_USER=your_database_user
POSTGRES_PASSWORD=your_database_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=meetgraph_ai

HF_TOKEN=your_huggingface_token

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_configured_gemini_model
```

Do not upload `.env` or API keys to GitHub.

### Step 4: Run Database Migrations

From the `backend` directory:

```bash
alembic upgrade head
```

### Step 5: Start the Backend

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### Step 6: Start the Frontend

Open another terminal at the repository root:

```bash
npm install
npm run dev
```

Open the frontend URL displayed by Vite, normally:

```text
http://localhost:5173
```

The frontend uses the Vite development proxy to communicate with the local FastAPI backend.

### Step 7: Build the Frontend

```bash
npm run build
npm run lint
```

## 8. Repository Structure

```text
MeetGraph-Intelligence-AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │       ├── extraction.py
│   │       ├── gemini_service.py
│   │       ├── question_answering.py
│   │       ├── diarization.py
│   │       └── storage.py
│   │
│   ├── migrations/
│   ├── scripts/
│   ├── tests/
│   ├── storage/
│   ├── requirements.txt
│   └── alembic.ini
│
├── docs/
│   └── UI-Review/
│
├── public/
│
├── src/
│   ├── api/
│   │   └── client.ts
│   ├── components/
│   │   └── layout/
│   ├── pages/
│   │   ├── AskAI.tsx
│   │   ├── Dashboard.tsx
│   │   ├── KnowledgeGraph.tsx
│   │   ├── Meetings.tsx
│   │   └── TasksAndDecisions.tsx
│   ├── App.tsx
│   └── index.css
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 9. Team Members and Contributions

MeetGraph AI is a collaborative final-year engineering project developed by all four team members. Each member contributed to a different area of the project.

| Team Member | Role | Responsibilities |
|---|---|---|
| **Gayatri Nikam** | Frontend Development | Frontend architecture, dashboard development, UI design and user interface implementation |
| **Vaibhav Pawar** | Backend Development | FastAPI backend development, REST APIs, database integration, backend testing and deployment |
| **Rutuja Jadhav** | AI and Testing | Meeting intelligence, transcription workflow, AI-related functionality and application testing |
| **Yash Kumbhar** | Documentation and Integration | Project documentation, technical documentation and integration support |

### Shared Project Responsibilities

All team members contributed to the overall development process through project discussions, requirement understanding, coordination, testing and review.

**Credits and Recognition:** All four members are equally recognized as developers and contributors to MeetGraph AI. Individual responsibilities are documented to acknowledge each member's work and contribution to the project.

## 10. Future Scope

The following capabilities are planned extensions beyond the currently implemented functionality:

- Neo4j-based connected meeting knowledge graph.
- GraphRAG for relationship-aware retrieval across meetings.
- ChromaDB or another vector database for semantic transcript search.
- Live meeting capture and transcription through a browser extension.
- Advanced cross-meeting decision and timeline conflict detection.
- Integrations with collaboration and project management platforms.
- Enhanced user authentication, role-based permissions and audit logging.
- Persistent cloud-based recording storage and scalable processing.

## 11. Testing and Verification

The current development version has undergone the following local checks:

- Python backend compilation.
- Backend automated test suite: 20 tests passed.
- Frontend production build using Vite.
- TypeScript verification using `npm run lint`.
- Local PostgreSQL connectivity verification.
- Local recording storage verification.

These results describe the tested local development environment and do not independently certify every production deployment capability.

## 12. Credits and Acknowledgements

MeetGraph AI is a collaborative final-year BE Computer Engineering project developed by:

1. **Gayatri Nikam**
2. **Vaibhav Pawar**
3. **Rutuja Jadhav**
4. **Yash Kumbhar**

All four members are recognized as contributors and developers of MeetGraph AI. The project represents our collective effort in planning, designing, developing, integrating and testing the application.

We acknowledge the open-source communities and technologies that supported this project, including React, FastAPI, PostgreSQL, Faster-Whisper, pyannote.audio and Google Gemini.

**Project Name:** MeetGraph AI – Enterprise Meeting Intelligence Platform

**Project Type:** Final Year BE Computer Engineering Project

---

*MeetGraph AI: Transforming meeting conversations into searchable organizational knowledge.*