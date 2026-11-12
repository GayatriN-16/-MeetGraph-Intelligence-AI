
# MeetGraph AI – Enterprise Meeting Intelligence Platform

**Final Year BE Computer Engineering Project**

**Developed collaboratively by:**
- Gayatri Nikam
- Vaibhav Pawar
- Rutuja Jadhav
- Yash Kumbhar

**GitHub Repository:** [MeetGraph AI](https://github.com/ivaibhavpawar1045/MeetGraph-AI-Preview)

**Live Application:** [MeetGraph AI](https://meet-graph-ai-preview.vercel.app/)

---

## 1. Project Overview

MeetGraph AI is an AI-powered meeting intelligence platform designed to simplify the process of reviewing, understanding, and managing meeting discussions.

Users can upload meeting recordings, generate timestamped transcripts, identify speakers, create AI-powered meeting summaries, extract action items and decisions, and ask questions about individual meetings or an entire project.

The platform transforms meeting conversations into structured and searchable information, helping users retrieve important details without manually reviewing complete recordings.

### Problem Statement

Organizations conduct multiple meetings to discuss projects, assign responsibilities, make decisions, and track progress. However, important information is often distributed across recordings, notes, and conversations.

Manually reviewing these recordings is time-consuming and makes it difficult to retrieve specific decisions, assigned tasks, and discussion details.

MeetGraph AI addresses this problem through centralized meeting transcription, information extraction, summarization, and evidence-based question answering.

## 2. Key Features

- **Meeting Management:** Upload and manage multiple meeting recordings under a project.
- **Audio Transcription:** Convert supported audio and video recordings into text using Faster-Whisper.
- **Speaker Diarization:** Identify different speakers and associate transcript segments with speaker information using pyannote.audio.
- **AI Meeting Summaries:** Generate structured meeting summaries, discussion topics, and key points using Google Gemini.
- **Action Item Extraction:** Identify tasks, assigned people, and explicitly mentioned deadlines.
- **Decision Extraction:** Extract meeting decisions from available transcript evidence.
- **Project Intelligence Dashboard:** View meeting statistics, processing information, action items, and decisions.
- **Ask AI:** Ask natural-language questions about a selected meeting or multiple meetings within a project.
- **Evidence-Based Responses:** Retrieve supporting transcript excerpts with meeting references, speaker information, and timestamps.
- **Meeting-Specific Intelligence:** Review discussions, topics, summaries, and extracted information from individual meetings.

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
           POSTGRESQL         AUDIO STORAGE
                |                  |
                |                  v
                |          AUDIO PREPROCESSING
                |                  |
                |                  v
                |           FASTER-WHISPER
                |                  |
                |                  v
                |          SPEAKER DIARIZATION
                |             (pyannote)
                |                  |
                |                  v
                |        TIMESTAMPED TRANSCRIPT
                |                  |
                |                  v
                |           GEMINI AI ANALYSIS
                |                  |
                |          +-------+-------+
                |          |       |       |
                |          v       v       v
                |       SUMMARY  TOPICS  INSIGHTS
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

### Architecture Notes

- PostgreSQL stores application data.
- Audio files are stored using the configured filesystem storage directory.
- Faster-Whisper handles speech-to-text transcription.
- pyannote.audio supports speaker diarization.
- Google Gemini provides AI-powered meeting summaries and analysis.
- The current question-answering implementation uses local transcript and extracted evidence retrieval.

**Planned architecture extensions:** Neo4j, ChromaDB, and GraphRAG are future development components. They should not be considered implemented components of the current version.

## 5. Application Modules

### Dashboard

Provides an overview of project meetings, processing information, extracted tasks, and decisions.

### Meetings

Allows users to upload, view, and manage meeting recordings.

### Meeting Intelligence

Processes meeting recordings and presents transcripts, summaries, discussion topics, and extracted information.

### Ask AI

Allows users to ask natural-language questions about one meeting or across meetings within a project. Responses can include supporting transcript evidence.

### Tasks and Decisions

Displays extracted action items, assignees, deadlines, and meeting decisions.

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

Follow these steps to set up MeetGraph AI locally.

### Prerequisites

- Python 3.10 or a compatible version supported by the backend dependencies
- Node.js and npm
- PostgreSQL
- Google Gemini API key
- Hugging Face access token for the diarization model

### Step 1: Clone the Repository

```bash
git clone https://github.com/ivaibhavpawar1045/MeetGraph-AI-Preview.git MeetGraph-Intelligence-AI

cd MeetGraph-Intelligence-AI
```

### Step 2: Configure the Backend

```bash
cd backend

python -m venv .venv
```

Activate the virtual environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create `backend/.env` using `backend/.env.example` as a reference.

Configure the required values:

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

Use the actual environment variable names expected by the backend configuration.

**Important:** Never upload `.env` files, API keys, passwords, or access tokens to GitHub.

### Step 4: Configure the Database

Create the PostgreSQL database using the name configured in your environment variables.

Run database migrations from the `backend` directory:

```bash
alembic upgrade head
```

### Step 5: Start the Backend

From the `backend` directory:

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

### Step 7: Build and Verify the Frontend

```bash
npm run lint
npm run build
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
│   │   ├── services/
│   │   │   ├── extraction.py
│   │   │   ├── gemini_service.py
│   │   │   ├── question_answering.py
│   │   │   ├── diarization.py
│   │   │   └── storage.py
│   │   └── main.py
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

The structure above highlights the main application directories and selected files. Additional files and modules may exist in the repository.

## 9. Team Members and Contributions

MeetGraph AI is a collaborative final-year engineering project developed by four team members.

| Team Member | Primary Role | Responsibilities |
|---|---|---|
| **Gayatri Nikam** | Frontend Development and Integration | Frontend architecture, dashboard development, backend testing, and user interface implementation |
| **Vaibhav Pawar** | Backend Development and AI Functionality | FastAPI backend development, REST APIs, database integration, AI-related functionality, backend testing, and deployment |
| **Rutuja Jadhav** | Testing and Transcription | Meeting intelligence, transcription workflow, and application testing |
| **Yash Kumbhar** | Documentation | Project documentation and technical documentation |

### Shared Project Responsibilities

All team members contributed to the overall development process through project discussions, requirement understanding, coordination, testing, and review.

All four members are acknowledged as developers and contributors to MeetGraph AI. The responsibilities listed above describe their primary areas of contribution.

## 10. Future Scope

The following capabilities are planned extensions beyond the currently implemented functionality:

- Neo4j-based connected meeting knowledge graph.
- GraphRAG for relationship-aware retrieval across meetings.
- ChromaDB or another vector database for semantic transcript search.
- Live meeting capture and transcription through a browser extension.
- Advanced cross-meeting decision and timeline conflict detection.
- Integrations with collaboration and project management platforms.
- Enhanced user authentication, role-based permissions, and audit logging.
- Persistent cloud-based recording storage and scalable processing.

## 11. Testing and Verification

The development workflow includes the following verification activities:

- Python backend compilation.
- Backend automated test suite.
- Frontend production build using Vite.
- TypeScript verification using `npm run lint`.
- Local PostgreSQL connectivity verification.
- Local recording storage verification.

Testing results should be reported using the latest test execution rather than a fixed historical test count.

These checks describe the tested development environment and do not independently certify every production deployment capability.

## 12. Credits and Acknowledgements

MeetGraph AI is a collaborative final-year BE Computer Engineering project developed by:

1. **Gayatri Nikam**
2. **Vaibhav Pawar**
3. **Rutuja Jadhav**
4. **Yash Kumbhar**

We acknowledge the open-source communities and technologies that supported this project, including React, FastAPI, PostgreSQL, Faster-Whisper, pyannote.audio, and Google Gemini.

---

**Project Name:** MeetGraph AI – Enterprise Meeting Intelligence Platform

**Project Type:** Final Year BE Computer Engineering Project

*MeetGraph AI: Transforming meeting conversations into searchable organizational knowledge.*
