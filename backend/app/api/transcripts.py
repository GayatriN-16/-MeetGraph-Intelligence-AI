
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.authorization import get_owned_project
from app.models import User, Meeting, TranscriptSegment
from app.schemas.meeting import MeetingResponse
from app.services.storage import save_transcript, delete_recording
from app.services.transcript_parser import parse_transcript_content


router = APIRouter(tags=["Meetings"])


MIME_TYPES = {
    ".txt": "text/plain",
    ".srt": "application/x-subrip",
    ".vtt": "text/vtt",
}


@router.post(
    "/meetings/upload-transcript",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_meeting_transcript(
    project_id: int = Form(...),
    title: str = Form(...),
    transcript: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        get_owned_project(
            project_id,
            db,
            current_user,
        )
    except HTTPException:
        await transcript.close()
        raise

    clean_title = title.strip()

    if not clean_title:
        await transcript.close()
        raise HTTPException(
            status_code=422,
            detail="Meeting title cannot be empty.",
        )

    if len(clean_title) > 250:
        await transcript.close()
        raise HTTPException(
            status_code=422,
            detail="Meeting title cannot exceed 250 characters.",
        )

    original_filename = Path(transcript.filename or "").name

    if not original_filename:
        await transcript.close()
        raise HTTPException(
            status_code=400,
            detail="Transcript filename is missing.",
        )

    storage_path = None

    try:
        storage_path, file_size = await save_transcript(transcript)

        content = storage_path.read_bytes()

        segments = parse_transcript_content(
            original_filename,
            content,
        )

        extension = Path(original_filename).suffix.lower()

        timestamped_segments = [
            segment
            for segment in segments
            if segment["end_seconds"] > 0
        ]

        duration_seconds = (
            max(
                segment["end_seconds"]
                for segment in timestamped_segments
            )
            if timestamped_segments
            else None
        )

        meeting = Meeting(
            project_id=project_id,
            title=clean_title,
            original_filename=original_filename,
            storage_path=str(storage_path),
            mime_type=MIME_TYPES.get(extension),
            file_size_bytes=file_size,
            duration_seconds=duration_seconds,
            status="transcribed",
            processing_error=None,
        )

        db.add(meeting)
        db.flush()

        for segment in segments:
            db.add(
                TranscriptSegment(
                    meeting_id=meeting.id,
                    start_seconds=segment["start_seconds"],
                    end_seconds=segment["end_seconds"],
                    text=segment["text"],
                    confidence=segment["confidence"],
                )
            )

        db.commit()
        db.refresh(meeting)

        return meeting

    except ValueError as exc:
        db.rollback()

        if storage_path:
            delete_recording(str(storage_path))

        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception:
        db.rollback()

        if storage_path:
            try:
                delete_recording(str(storage_path))
            except (OSError, ValueError):
                pass

        raise
