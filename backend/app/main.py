
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import check_database_connection


app = FastAPI(
    title="MeetGraph AI API",
    description=(
        "Backend API for meeting transcription, "
        "decision extraction, task tracking and knowledge retrieval."
    ),
    version="1.0.0",
)

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
    database_connected = check_database_connection()

    services = {
        "fastapi": "running",
        "postgresql": (
            "connected" if database_connected else "disconnected"
        ),
        "neo4j": "not_configured",
        "vector_store": "not_configured",
        "transcription": "not_configured",
        "speaker_diarization": "not_configured",
        "llm": "not_configured",
    }

    all_critical_services_healthy = database_connected

    return JSONResponse(
        status_code=200 if all_critical_services_healthy else 503,
        content={
            "status": (
                "healthy"
                if all_critical_services_healthy
                else "degraded"
            ),
            "application": "MeetGraph AI",
            "version": "1.0.0",
            "services": services,
        },
    )
