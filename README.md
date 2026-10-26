# MeetGraph AI — Enterprise Meeting Intelligence & Connected Knowledge Graph Platform

> **Final Year BE Computer Engineering Project**  
> **Developer:** [Gayatri Nikam](https://github.com/GayatriN-16)  
> **Live Application:** [MeetGraph AI App](https://ais-dev-l4aknxur6g64jcbniqpmfm-330250524849.asia-southeast1.run.app)

---

## 📌 Project Overview

**MeetGraph AI** is an Enterprise Meeting Intelligence Platform that transforms conversational audio recordings into searchable, interconnected organizational memory. Beyond basic meeting transcription and summarization, MeetGraph AI synthesizes multi-meeting relationships into a **Neo4j Knowledge Graph** and leverages **GraphRAG (Graph-Augmented Retrieval)** to deliver evidence-grounded answers with exact source citations and timecodes.

### 🔄 Core Technical Pipeline
```
Upload Recording (MP3/MP4/WAV/M4A)
  └── 1. Audio Preprocessing & Faster-Whisper Speaker Diarization
        └── 2. Timestamped Transcript Generation & Sentiment Tagging
              └── 3. LLM Knowledge Extraction (Decisions, Tasks, Deadlines, Risks)
                    └── 4. Neo4j Knowledge Graph Mapping & ChromaDB Vector Embeddings
                          └── 5. GraphRAG Evidence-Grounded Natural Language QA
```

---

## ✨ Key Features & Product Capabilities

- 📊 **Executive Dashboard**: High-density analytics showing total meetings, verified decisions, open action items, knowledge entity counts, and real-time extraction pipeline progress.
- 🕸️ **Interactive React Flow Knowledge Graph (`@xyflow/react`)**: Spatial node-link visualization mapping connected entities (`Meeting`, `Person`, `Project`, `Task`, `Decision`, `Topic`, `Risk`) with zoom/pan, filters, and contextual detail inspector.
- ⚡ **Cross-Meeting Timeline Conflict Engine**: Automatically synthesizes cross-meeting dependency mismatches (e.g., 14-day schedule mismatch between Q3 Roadmap target and Client Review commit) marked as *"Possible conflict — review required"*.
- 🎙️ **Visual Meeting Briefs & Diarized Transcript Player**: Compact visual recaps linked to timestamped audio quotes, play/pause simulation, timecode seeking, and speaker filters.
- 💬 **GraphRAG Conversational Assistant**: Grounded AI query interface powered by **Google Gemini AI** that answers complex cross-meeting questions with clickable source citations `[41:05]`.
- 📋 **Tasks & Verified Decisions Hub**: Track multi-stakeholder consensus decisions, confidence verification percentages, assigned action items, and export task reports to Jira Software.
- 🔒 **JWT Role-Based Access Control (RBAC) & Audit Logging**: Multi-role security separating **Admin** (*User management, SOC2 audit trail*) from **Member** (*Project-scoped visibility*).
- ⚙️ **6-Stage System Architecture Visualizer**: Interactive architectural diagram covering Data Ingestion, AI Processing, Knowledge Storage, Applications, Webhook Integrations, and Security.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Tailwind CSS, `@xyflow/react`, Lucide React, Motion |
| **Backend REST API** | Express / Node.js (Compatible with Python FastAPI `/api/v1` PRD specification), `tsx` |
| **Database Architecture** | PostgreSQL (Relational Data), Neo4j (Knowledge Graph), ChromaDB (Vector Store) |
| **AI / Speech Pipeline** | `@google/genai` (Gemini 2.5 Flash), Faster-Whisper (Speaker Diarization), FFmpeg |
| **Security & Auth** | JWT Authentication, Role-Based Access Control (RBAC), SOC2 Type II Encryption |

---

## 📐 System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 WEB FRONTEND                                      |
|  React 19 + TypeScript + Tailwind CSS + @xyflow/react Knowledge Graph Visualizer |
+----------------------------------------+------------------------------------------+
                                         | REST APIs (/api/v1/*)
                                         v
+-----------------------------------------------------------------------------------+
|                             FASTAPI / EXPRESS BACKEND                             |
|  - Auth Middleware (JWT & RBAC)             - Meeting Processing & Job Status     |
|  - GraphRAG Query Synthesis Engine          - Jira & Slack Webhook Dispatch       |
+-----------+----------------------------+-----------------------------+------------+
            |                            |                             |
            v                            v                             v
+-----------------------+  +---------------------------+  +-------------------------+
|     POSTGRESQL DB     |  |    NEO4J GRAPH CLUSTER    |  |  CHROMADB VECTOR STORE  |
| Users, Meetings,      |  | Multi-hop Relationships:  |  | 1536-dim Embeddings     |
| Projects, Tasks, Logs |  | People, Decisions, Risks  |  | Semantic Transcript Search|
+-----------------------+  +---------------------------+  +-------------------------+
```

---

## 🔌 API Endpoints Specification (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Issue JWT token & return user profile |
| `GET` | `/api/v1/auth/me` | Fetch active user credentials and permissions |
| `GET` | `/api/v1/projects` | List projects with member counts and health |
| `GET` | `/api/v1/meetings` | Retrieve meetings library filtered by project scope |
| `POST` | `/api/v1/meetings` | Ingest audio stream and trigger diarization pipeline |
| `GET` | `/api/v1/tasks` | Fetch open action items with owner and due dates |
| `POST` | `/api/v1/tasks` | Create new action item and assign to team member |
| `PATCH` | `/api/v1/tasks/:id/toggle` | Toggle task completion status |
| `GET` | `/api/v1/decisions` | Retrieve AI-extracted and user-verified decisions |
| `GET` | `/api/v1/graph` | Return `@xyflow/react` spatial nodes and edges |
| `GET` | `/api/v1/risks` | Retrieve detected cross-meeting timeline conflicts |
| `POST` | `/api/v1/search` | GraphRAG evidence-grounded search with citations |
| `GET` | `/api/v1/audit-logs` | Fetch system security and processing audit trail |

---

## 🚀 Getting Started locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Gemini API Key (Configure in `.env`)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GayatriN-16/MeetGraph-AI.git
   cd MeetGraph-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Repository Folder Structure

```
.
├── server.ts                       # REST API Backend Entry Point (/api/v1)
├── package.json                    # Dependencies and scripts
├── vite.config.ts                  # Vite build configuration
├── public/                         # Static assets and media attachments
├── src/
│   ├── App.tsx                     # Main application layout and tab router
│   ├── types.ts                    # Complete TypeScript interfaces
│   ├── api/
│   │   └── client.ts               # API Client with JWT authorization headers
│   ├── services/
│   │   └── aiService.ts            # Replaceable LLM client abstraction (Gemini API)
│   ├── data/
│   │   └── mockData.ts             # PRD seed data (Meetings, Decisions, Tasks, Nodes)
│   └── components/
│       ├── Dashboard.tsx           # Executive Analytics Console
│       ├── MeetingsLibrary.tsx     # Filterable Meetings Grid
│       ├── VisualMeetingBrief.tsx  # Compact Visual Summary
│       ├── MeetingDetailModal.tsx  # Diarized Transcript & Audio Player
│       ├── ReactFlowKnowledgeGraph.tsx # Interactive @xyflow/react Visualizer
│       ├── TasksAndDecisions.tsx   # Verified Decisions & Task Management
│       ├── AskAI.tsx               # Evidence-grounded GraphRAG Assistant
│       ├── ArchitecturePipeline.tsx # 6-Stage System Architecture Spec
│       ├── ExternalIntegrations.tsx# Webhooks for Google Meet, Teams, Zoom, Jira, Slack
│       ├── AdminAuditLogs.tsx      # Admin User Management & SOC2 Audit Trail
│       ├── AuthModal.tsx           # JWT Sign-In & Role Switcher
│       ├── ConflictEvidenceModal.tsx # Timeline Conflict Analyzer
│       └── UploadMeetingModal.tsx  # Audio Ingestion & Extraction Stepper
```

---

## 👩‍💻 Author & Credits

- **Developer:** [Gayatri Nikam](https://github.com/GayatriN-16)
- **Project:** Final Year BE Computer Engineering Project (MeetGraph AI)
- **License:** Apache 2.0
