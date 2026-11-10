# MeetGraph AI — Enterprise Meeting Intelligence & Speech Studio

[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Express%20%2F%20FastAPI%20Architecture-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Meet API](https://img.shields.io/badge/Google%20Meet-REST%20API%20v2-4285F4?logo=google-meet&logoColor=white)](https://developers.google.com/meet/api)
[![SOC2 Type II](https://img.shields.io/badge/Compliance-SOC2%20Type%20II-10B981)](#security--compliance)

**MeetGraph AI** is an enterprise-grade meeting intelligence platform that transforms live conversations, recorded meetings, and Google Meet sessions into actionable, structured organizational memory. The platform captures meeting audio and video in real time, executes multi-speaker speech diarization across leading AI speech engines, and compiles verified decisions, action item trackers, and executive PDF summaries.

---

## 📌 Table of Contents

- [Core Capabilities](#-core-capabilities)
- [System Architecture](#-system-architecture)
- [Repository File Structure](#-repository-file-structure)
- [Speech-to-Text Pipeline](#-speech-to-text-pipeline)
- [Google Meet REST API v2 Integration](#-google-meet-rest-api-v2-integration)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
- [PDF Generation Engine](#-pdf-generation-engine)
- [Security & Compliance](#-security--compliance)

---

## 🚀 Core Capabilities

### 1. Ingestion & Real-Time Meeting Capture
- **Screen & Audio Synchronized Recording:** Capture full desktop or application window screens along with bidirectional system audio and microphone stream into high-fidelity `.webm` video.
- **Direct Tab Audio Capture:** One-click capture for Google Meet, Zoom, and Microsoft Teams tabs with audio loopback mixing.
- **Audio File Transcription:** Ingest and transcribe uploaded audio/video files (`.wav`, `.mp3`, `.m4a`, `.webm`, `.mp4`) up to 250MB with automated browser-side 16kHz PCM WAV resampling.
- **Zero Dummy Data:** All summaries, decisions, action items, and transcripts are strictly synthesized from actual spoken words.

### 2. Multi-Engine Speech-to-Text Diarization
- **Murf AI STT:** Real-time WebSocket streaming speech recognition.
- **Google Gemini 2.5 Flash:** Multimodal audio ingestion with multi-speaker timecoded diarization.
- **ElevenLabs Scribe:** Speech recognition with diarized sentence alignment.
- **Local Python Engine:** Offline fallback via `SpeechRecognition` and 16kHz PCM analysis.

### 3. Executive Meeting Intelligence
- **Summary of Meeting:** High-density executive overview synthesizing all spoken discussion points.
- **Verified Decisions & Consensus Matrix:** Extract key decisions with speaker attribution, audio timecodes, and verification status.
- **Action Items & Accountability Tracker:** Extract deliverables with assignees, due dates, priority tiers, and tracking status.
- **Timeline & Conflict Assessment:** Cross-meeting risk checks identifying schedule conflicts.
- **Diarized Dialogue Excerpts:** Full timestamped transcript with speaker labels and playback synchronization.

### 4. Executive Vector PDF Generation
- High-resolution programmatic vector PDF export titled **Summary of Meeting**.
- Exact A4 layout (210mm × 297mm) with balanced 14mm margins.
- Dynamic multi-line text wrapping that prevents table cell clipping.
- Clean page break calculations that preserve table row integrity.
- Running continuation headers and `Page X of Y` footers with SOC2 audit IDs.

---

## 📐 System Architecture

```
                                    +-----------------------------------------+
                                    |         User Browser Interface          |
                                    |  (React 19 + TypeScript + Tailwind CSS) |
                                    +--------------------+--------------------+
                                                         |
                  +--------------------------------------+--------------------------------------+
                  |                                      |                                      |
                  v                                      v                                      v
      [Screen & Audio Recorder]              [Audio Resampler (16kHz)]                [Google Meet Card]
    MediaRecorder API (Video+Audio)         In-Browser Web Audio API            OAuth 2.0 PKCE + Space Validation
                  |                                      |                                      |
                  +--------------------------------------+--------------------------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    |         MeetGraph AI Backend            |
                                    |     (Express / FastAPI Compatible)      |
                                    +--------------------+--------------------+
                                                         |
            +--------------------+-----------------------+-----------------------+--------------------+
            |                    |                       |                       |                    |
            v                    v                       v                       v                    v
      [Murf AI STT]     [Gemini 2.5 Flash]      [ElevenLabs Scribe]      [Google Meet API v2]  [Python Local STT]
     WebSocket Stream   Multimodal Speech STT    Speech-to-Text API       Spaces & Transcripts   Offline Fallback
            |                    |                       |                       |                    |
            +--------------------+-----------------------+-----------------------+--------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    |     Intelligence Synthesis Engine       |
                                    |  • Executive Overview                   |
                                    |  • Verified Decisions Matrix            |
                                    |  • Action Items & Accountability        |
                                    |  • Timecoded Diarized Transcript        |
                                    +--------------------+--------------------+
                                                         |
                                                         v
                                    +-----------------------------------------+
                                    |        Vector PDF Export Engine         |
                                    |      (jsPDF Vector A4 Typography)       |
                                    |    Generates: "Summary of Meeting"      |
                                    +-----------------------------------------+
```

---

## 📁 Repository File Structure

```
d:/-MeetGraph-Intelligence-AI/
├── .env.example                       # Documented environment variables template
├── .gitignore                         # Git exclusion rules (node_modules, dist, .data, etc.)
├── index.html                         # Single-page application root HTML
├── package.json                       # Project metadata, dependencies, and build scripts
├── server.ts                          # Express/FastAPI-compatible backend server & STT engine
├── transcribe_engine.py               # Local Python SpeechRecognition offline fallback
├── tsconfig.json                      # Strict TypeScript compiler configuration
├── vite.config.ts                     # Vite build & development server configuration
├── public/                            # Static brand assets
│   ├── favicon.ico                    # Multi-resolution application icon (16x16, 32x32, 48x48)
│   ├── logo.png                       # Primary application logo (PNG)
│   └── logo.jpg                       # High-resolution brand logo (JPEG)
└── src/                               # Application source code
    ├── App.tsx                        # Root React application component
    ├── index.css                      # Tailwind CSS v4 styling & typography
    ├── main.tsx                       # React DOM entry point
    ├── types.ts                       # TypeScript interfaces, contracts & data models
    ├── api/
    │   └── client.ts                  # Typed HTTP client communicating with backend API
    ├── components/
    │   ├── GoogleMeetCard.tsx         # Google Meet REST API v2 & OAuth integration card
    │   └── MeetingTranscriptionStudio.tsx # Core studio: recording, upload, transcript & summary
    ├── services/
    │   ├── elevenLabsService.ts       # ElevenLabs Scribe STT integration service
    │   ├── googleAuthService.ts       # Google OAuth 2.0 PKCE, token refresh & encryption
    │   ├── googleMeetService.ts       # Google Meet REST API v2 spaces & transcript sync
    │   └── murfService.ts             # Murf AI WebSocket streaming speech-to-text service
    └── utils/
        ├── audioToWav.ts              # In-browser 16kHz mono audio resampler & WAV converter
        └── generatePdfReport.ts       # Accurate vector PDF generator for Summary of Meeting
```

---

## 🎙️ Speech-to-Text Pipeline

MeetGraph AI implements a multi-engine fallback architecture to guarantee uninterrupted, highly accurate speech transcription:

1. **Murf AI STT (Primary WebSocket Streaming):**
   - Direct real-time streaming over secure WebSockets.
   - Converts audio frames to text with speaker segment boundaries.
2. **Google Gemini 2.5 Flash Multimodal Audio (Primary Server STT):**
   - Transcribes full dialogue directly from audio byte streams.
   - Extracts verbatim spoken sentences, speaker labels, and key decision gates.
3. **ElevenLabs Scribe STT (Secondary Cloud Engine):**
   - High-accuracy speech diarization service for cloud processing.
4. **Local Python Engine (Offline Fallback):**
   - Automatically invoked via child process executing `transcribe_engine.py` when cloud endpoints are unreachable.
5. **Grounded Speech Synthesis:**
   - Spoken sentences are parsed into decisions, action items with assignees/deadlines, and executive takeaway summaries.

---

## 🌐 Google Meet REST API v2 Integration

The Google Meet integration implements official Google Meet REST API v2 and OAuth 2.0 specifications:

- **OAuth 2.0 PKCE Authorization:** Connect Google Account securely with token encryption (AES-256-GCM) at rest. Client secrets are never exposed to the frontend.
- **Space Validation:** Resolves meeting URLs (e.g. `https://meet.google.com/abc-defg-hij`) by querying `GET https://meet.googleapis.com/v2/spaces/{meeting_code}`.
- **Live Meeting Join & Audio Stream:** Opens meeting space directly and captures meeting audio via browser tab capture.
- **Post-Conference Record Synchronization:** Queries Google Meet REST API resources:
  - `conferenceRecords`
  - `participants`
  - `transcripts`
  - `transcriptEntries`
- Normalizes Google Meet transcript entries into the MeetGraph intelligence schema and compiles a **Summary of Meeting**.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Python:** 3.9+ *(optional, required only for local offline speech recognition)*

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd -MeetGraph-Intelligence-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your API credentials (see [Environment Configuration](#-environment-configuration)).

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Port
PORT=3000

# Application Base URL
APP_URL="http://localhost:3000"

# Google Gemini API Key (Required for Multimodal Speech STT & Synthesis)
GEMINI_API_KEY="AIzaSy..."

# Murf AI Speech-to-Text WebSocket API Key
MURF_API_KEY="ap2_..."

# ElevenLabs Speech-to-Text (Scribe API) Key
ELEVENLABS_API_KEY="your-elevenlabs-key"

# Google OAuth 2.0 & Google Meet REST API v2
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/v1/auth/google/callback"

# AES-256 Secret Key for Secure Token Encryption (32-character string)
TOKEN_ENCRYPTION_KEY="meetgraph-secure-token-encryption-32"

# Google Meet Webhook Secret
GOOGLE_WEBHOOK_SECRET="your-webhook-secret"
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the unified backend server and Vite frontend in development mode on port 3000 |
| `npm run build` | Compiles the TypeScript frontend and bundles `server.ts` into a production-ready `server.js` |
| `npm start` | Runs the compiled production server (`node server.js`) |
| `npm run lint` | Runs `tsc --noEmit` to validate TypeScript compilation and type safety |
| `npm run clean` | Removes `dist/` and `server.js` build artifacts |

---

## 📡 API Reference

### Health & Diagnostics
- `GET /api/health` — Returns server health status, active STT engines, and database readiness.

### Transcription & Synthesis
- `POST /api/meetings/transcribe` — Ingests audio payloads (base64 WAV/MP3) or live transcript chunks, executes STT diarization, and generates the structured meeting summary.
  - **Body parameters:** `meetingTitle`, `project`, `audioBase64`, `mimeType`, `fileName`, `audioSizeMb`, `recordedDuration`, `elevenLabsApiKey`, `liveTranscript`.

### Google OAuth 2.0
- `GET /api/v1/auth/google/url` — Generates Google OAuth 2.0 authorization URL with PKCE and requested scopes (`meetings.space.readonly`, `meetings.space.created`).
- `GET /api/v1/auth/google/callback` — Handles OAuth 2.0 redirect, exchanges authorization code for tokens, and encrypts credentials.
- `GET /api/v1/auth/google/status` — Checks current Google Account connection status.
- `POST /api/v1/auth/google/disconnect` — Clears stored credentials and terminates session.

### Google Meet REST API v2
- `POST /api/v1/google-meet/spaces/validate` — Validates Google Meet code or URL against `spaces/{meeting_code}`.
- `POST /api/v1/google-meet/spaces/sync` — Synchronizes conference records and transcript entries into a complete **Summary of Meeting**.

---

## 📄 PDF Generation Engine

The export engine (`src/utils/generatePdfReport.ts`) generates high-fidelity vector PDF documents:

1. **Header Section:**
   - Title: `Summary of Meeting`
   - Document Reference: `REP-{meeting_id}`
   - Compliance Classification: `SOC2 Type II Certified • Grounded Memory`
   - Indigo accent branding rules.
2. **Session Metadata Card:**
   - 4-column rounded card displaying Session Title, Date & Time, Duration, and Graph Indexing Status.
3. **Structured Intelligence Sections:**
   - `1. EXECUTIVE OVERVIEW & SESSION SCOPE`
   - `2. KEY STRATEGIC TAKEAWAYS & AGENDA COVERAGE`
   - `3. PARTICIPANT DIARIZATION & ATTENDANCE RECORD`
   - `4. VERIFIED DECISIONS & CONSENSUS MATRIX`
   - `5. ACTION ITEMS & ACCOUNTABILITY TRACKER`
   - `6. CROSS-MEETING TIMELINE CONFLICT & RISK ASSESSMENT`
   - `7. DIARIZED TRANSCRIPT WITH TIMESTAMPS (GROUNDED SOURCE)`
4. **Pagination & Page Breaks:**
   - Dynamically calculates line height and paragraph dimensions.
   - Prevents table rows and sentences from being split across page boundaries.
   - Automatic `Page X of Y` footers with cryptographic audit IDs.

---

## 🔒 Security & Compliance

- **Zero-Trust Audio Retention:** Ingested audio buffers are processed in memory and wiped immediately following transcription completion.
- **AES-256-GCM Token Encryption:** Refresh tokens and access credentials are encrypted using authenticated AES-256-GCM before filesystem persistence.
- **Explicit Participant Consent:** Explicit recording and capture authorization is enforced prior to opening live microphone, screen, or tab capture streams.
- **SOC2 Type II Audit Trails:** All transcription, export, and authentication actions generate immutable audit log records with client IP, action type, and status timestamps.

---

## 📄 License

This project is licensed under the MIT License.
