
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import check_database_connection
from app.api.meetings import router as meetings_router
from app.api.projects import router as projects_router
from app.api.extraction import router as extraction_router

app = FastAPI(
    title="MeetGraph AI API",
    description=(
        "Backend API for meeting transcription, decisions, "
        "action items and connected meeting knowledge."
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

app.include_router(projects_router, prefix="/api/v1")
app.include_router(meetings_router, prefix="/api/v1")
app.include_router(extraction_router, prefix="/api/v1")


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
        "postgresql": "connected" if database_connected else "disconnected",
        "neo4j": "not_configured",
        "vector_store": "not_configured",
        "transcription": "available",
        "speaker_diarization": "available",
        "llm": "not_configured",
        "local_extraction": "available",
    }

    return JSONResponse(
        status_code=200 if database_connected else 503,
        content={
            "status": "healthy" if database_connected else "degraded",
            "application": "MeetGraph AI",
            "version": "1.0.0",
            "services": services,
        },
    )
