
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="MeetGraph AI API",
    description=(
        "Backend API for meeting transcription, "
        "decision extraction, task tracking and knowledge retrieval."
    ),
    version="1.0.0",
)

# Allow the local React/Vite frontend to communicate with FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def root():
    return {
        "message": "Welcome to MeetGraph AI API",
        "documentation": "/docs",
        "health": "/api/v1/health",
    }


@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "application": "MeetGraph AI",
            "version": "1.0.0",
            "services": {
                "fastapi": "running",
                "postgresql": "not_configured",
                "neo4j": "not_configured",
                "vector_store": "not_configured",
                "transcription": "not_configured",
                "speaker_diarization": "not_configured",
                "llm": "not_configured",
            },
        },
    )
