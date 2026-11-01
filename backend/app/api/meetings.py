
import asyncio
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
from sqlalchemy import select, delete
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Meeting, Project, TranscriptSegment
from app.schemas.meeting import MeetingResponse
from app.services.storage import save_recording, delete_recording
from app.services.transcription import transcribe_recording

router = APIRouter(tags=["Meetings"])


@router.post(
    "/meetings/upload",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_meeting(
    title: str = Form(..., min_length=2, max_length=250),
    project_id: int = Form(...),
    recording: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    project = db.get(Project, project_id)

    if not project:
        await recording.close()
        raise HTTPException(status_code=404, detail="Project not found.")

    original_filename = Path(recording.filename or "").name

    if not original_filename:
        await recording.close()
        raise HTTPException(
            status_code=400,
            detail="A recording filename is required.",
        )

    storage_path, file_size = await save_recording(recording)

    meeting = Meeting(
        project_id=project_id,
        title=title.strip(),
        original_filename=original_filename,
        storage_path=str(storage_path),
        mime_type=recording.content_type,
        file_size_bytes=file_size,
        status="uploaded",
    )

    try:
        db.add(meeting)
        db.commit()
        db.refresh(meeting)
    except Exception:
        db.rollback()
        delete_recording(str(storage_path))
        raise

    return meeting


@router.get("/meetings", response_model=list[MeetingResponse])
def list_meetings(
    project_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = select(Meeting).order_by(Meeting.created_at.desc())

    if project_id is not None:
        query = query.where(Meeting.project_id == project_id)

    return db.scalars(query).all()


@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    return meeting


@router.post("/meetings/{meeting_id}/transcribe")
async def transcribe_meeting(
    meeting_id: int,
    language: str | None = None,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    if meeting.status == "transcribing":
        raise HTTPException(
            status_code=409,
            detail="This meeting is already being transcribed.",
        )

    if not Path(meeting.storage_path).is_file():
        raise HTTPException(
            status_code=404,
            detail="The original recording file is missing.",
        )

    meeting.status = "transcribing"
    meeting.processing_error = None
    db.commit()

    try:
        result = await asyncio.to_thread(
            transcribe_recording,
            meeting.storage_path,
            language,
        )

        # Replace prior transcript segments only after successful
        # transcription, so a failed retry does not destroy old data.
        db.execute(
            delete(TranscriptSegment).where(
                TranscriptSegment.meeting_id == meeting_id
            )
        )

        for item in result["segments"]:
            db.add(
                TranscriptSegment(
                    meeting_id=meeting_id,
                    start_seconds=item["start_seconds"],
                    end_seconds=item["end_seconds"],
                    text=item["text"],
                    confidence=item["confidence"],
                )
            )

        meeting.duration_seconds = result["duration_seconds"]
        meeting.status = "transcribed"
        meeting.processing_error = None

        db.commit()

        return {
            "message": "Transcription completed successfully.",
            "meeting_id": meeting_id,
            "status": meeting.status,
            "language": result["language"],
            "language_probability": result["language_probability"],
            "duration_seconds": result["duration_seconds"],
            "segments_saved": len(result["segments"]),
        }

    except Exception as exc:
        db.rollback()

        failed_meeting = db.get(Meeting, meeting_id)

        if failed_meeting:
            failed_meeting.status = "failed"
            failed_meeting.processing_error = str(exc)[:2000]
            db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(exc)}",
        )


@router.get("/meetings/{meeting_id}/transcript")
def get_meeting_transcript(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    segments = db.scalars(
        select(TranscriptSegment)
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_seconds)
    ).all()

    return {
        "meeting_id": meeting_id,
        "meeting_title": meeting.title,
        "status": meeting.status,
        "segments": [
            {
                "id": segment.id,
                "start_seconds": segment.start_seconds,
                "end_seconds": segment.end_seconds,
                "text": segment.text,
                "confidence": segment.confidence,
                "speaker_id": segment.speaker_id,
            }
            for segment in segments
        ],
    }


@router.delete("/meetings/{meeting_id}")
def remove_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    storage_path = meeting.storage_path

    db.delete(meeting)
    db.commit()

    try:
        delete_recording(storage_path)
    except (OSError, ValueError):
        pass

    return {
        "message": "Meeting deleted successfully.",
        "meeting_id": meeting_id,
    }
