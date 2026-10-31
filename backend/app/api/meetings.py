
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
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Meeting, Project
from app.schemas.meeting import MeetingResponse
from app.services.storage import save_recording, delete_recording

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
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

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
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    return meeting


@router.delete("/meetings/{meeting_id}")
def remove_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    storage_path = meeting.storage_path

    db.delete(meeting)
    db.commit()

    try:
        delete_recording(storage_path)
    except (OSError, ValueError):
        # The database record is deleted. A leftover file can be
        # cleaned up manually if filesystem deletion fails.
        pass

    return {
        "message": "Meeting deleted successfully.",
        "meeting_id": meeting_id,
    }
