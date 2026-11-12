
import asyncio
import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.models import (
    ActionItem,
    Decision,
    Meeting,
    Project,
    Speaker,
    TranscriptSegment,
    User,
)
from app.services.storage import UPLOAD_DIR, MAX_FILE_SIZE
from app.services.transcription import transcribe_recording
from app.services.extraction import extract_meeting_intelligence


router = APIRouter(tags=["Live Meetings"])


ALLOWED_ORIGINS = {
    origin.strip()
    for origin in settings.FRONTEND_ORIGINS.split(",")
    if origin.strip()
}


# ---------------------------------------------------------
# LIVE SESSION AUTHENTICATION
# ---------------------------------------------------------

@router.post("/live-sessions/ticket")
def create_live_session_ticket(
    project_id: int,
    current_user: User = Depends(get_current_user),
):
    """
    Issue a short-lived WebSocket ticket for an authenticated
    user who owns the requested project.
    """

    with SessionLocal() as db:
        project = db.scalar(
            select(Project).where(
                Project.id == project_id,
                Project.owner_id == current_user.id,
            )
        )

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

    now = datetime.now(timezone.utc)

    payload = {
        "sub": str(current_user.id),
        "project_id": project_id,
        "purpose": "live_session",
        "iat": now,
        "exp": now + timedelta(seconds=30),
        "jti": uuid4().hex,
    }

    ticket = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    return {
        "ticket": ticket,
        "expires_in": 30,
    }


# ---------------------------------------------------------
# INTERRUPTED MEETING HANDLING
# ---------------------------------------------------------

def update_interrupted_meeting(
    meeting_id: int,
    file_size: int,
    error: str,
):
    with SessionLocal() as db:
        meeting = db.get(Meeting, meeting_id)

        if meeting:
            meeting.file_size_bytes = file_size
            meeting.status = "interrupted"
            meeting.processing_error = error[:2000]
            db.commit()


# ---------------------------------------------------------
# TRANSCRIPTION AND INTELLIGENCE STORAGE
# ---------------------------------------------------------

def save_transcription(meeting_id: int, result: dict):
    """
    Save transcript first, then extract and persist meeting intelligence.
    If intelligence extraction fails, preserve the transcript.
    """

    # Phase 1: Save transcript.

    with SessionLocal() as db:
        meeting = db.get(Meeting, meeting_id)

        if not meeting:
            raise RuntimeError("Live meeting record was not found.")

        db.execute(
            delete(TranscriptSegment).where(
                TranscriptSegment.meeting_id == meeting_id
            )
        )

        db.execute(
            delete(Speaker).where(
                Speaker.meeting_id == meeting_id
            )
        )

        for item in result["segments"]:
            db.add(
                TranscriptSegment(
                    meeting_id=meeting_id,
                    start_seconds=item["start_seconds"],
                    end_seconds=item["end_seconds"],
                    text=item["text"],
                    confidence=item.get("confidence"),
                )
            )

        meeting.duration_seconds = result["duration_seconds"]
        meeting.status = "transcribed"
        meeting.processing_error = None

        db.commit()

    # Phase 2: Extract and save action items and decisions.

    try:
        with SessionLocal() as db:
            meeting = db.get(Meeting, meeting_id)

            if not meeting:
                raise RuntimeError(
                    "Meeting not found during extraction."
                )

            segments = db.scalars(
                select(TranscriptSegment)
                .options(
                    selectinload(TranscriptSegment.speaker)
                )
                .where(
                    TranscriptSegment.meeting_id == meeting_id
                )
                .order_by(TranscriptSegment.start_seconds)
            ).all()

            if not segments:
                raise RuntimeError(
                    "No transcript segments available."
                )

            year = (
                meeting.created_at.year
                if meeting.created_at
                else datetime.now().year
            )

            intelligence = extract_meeting_intelligence(
                segments,
                year,
            )

            # Remove previous extraction results when retranscribing.

            db.execute(
                delete(ActionItem).where(
                    ActionItem.meeting_id == meeting_id
                )
            )

            db.execute(
                delete(Decision).where(
                    Decision.meeting_id == meeting_id
                )
            )

            # Persist action items.

            for item in intelligence["action_items"]:
                db.add(
                    ActionItem(
                        meeting_id=meeting_id,
                        task_description=item["task_description"],
                        assignee_name=item.get("assignee_name"),
                        assignee_speaker_id=item.get(
                            "assignee_speaker_id"
                        ),
                        due_date=item.get("due_date"),
                        estimated_duration_minutes=item.get(
                            "estimated_duration_minutes"
                        ),
                        evidence_text=item.get("evidence_text"),
                        start_seconds=item.get("start_seconds"),
                        end_seconds=item.get("end_seconds"),
                    )
                )

            # Persist decisions.

            for item in intelligence["decisions"]:
                db.add(
                    Decision(
                        meeting_id=meeting_id,
                        title=item["title"],
                        description=item.get("description"),
                        speaker_id=item.get("speaker_id"),
                        evidence_text=item.get("evidence_text"),
                        start_seconds=item.get("start_seconds"),
                        end_seconds=item.get("end_seconds"),
                        confidence=item.get("confidence"),
                    )
                )

            db.commit()

            return {
                "action_items_count": len(
                    intelligence["action_items"]
                ),
                "decisions_count": len(
                    intelligence["decisions"]
                ),
                "extraction_error": None,
            }

    except Exception as exc:
        # Keep the successfully saved transcript.

        with SessionLocal() as db:
            meeting = db.get(Meeting, meeting_id)

            if meeting:
                meeting.status = "transcribed"
                meeting.processing_error = (
                    "Transcript saved, but intelligence extraction failed: "
                    + str(exc)[:1800]
                )
                db.commit()

        return {
            "action_items_count": 0,
            "decisions_count": 0,
            "extraction_error": str(exc)[:1000],
        }


# ---------------------------------------------------------
# AUTHENTICATED WEBSOCKET LIVE MEETING STREAM
# ---------------------------------------------------------

@router.websocket("/live-sessions/stream")
async def live_session_stream(websocket: WebSocket):

    # 1. Validate request origin.

    origin = websocket.headers.get("origin")

    if origin and origin not in ALLOWED_ORIGINS:
        await websocket.close(
            code=4403,
            reason="Origin not allowed.",
        )
        return

    # 2. Read the short-lived authentication ticket.

    ticket = websocket.query_params.get("ticket")

    if not ticket:
        await websocket.close(
            code=4401,
            reason="Authentication required.",
        )
        return

    # 3. Decode and validate the ticket.

    try:
        payload = jwt.decode(
            ticket,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        if payload.get("purpose") != "live_session":
            raise ValueError("Invalid ticket purpose.")

        user_id = int(payload["sub"])
        project_id = int(payload["project_id"])

    except (
        jwt.InvalidTokenError,
        KeyError,
        TypeError,
        ValueError,
    ):
        await websocket.close(
            code=4401,
            reason="Invalid or expired ticket.",
        )
        return

    # 4. Validate requested project ID.

    requested_project_id = websocket.query_params.get(
        "project_id"
    )

    try:
        requested_project_id = int(
            requested_project_id or ""
        )
    except ValueError:
        await websocket.close(
            code=4400,
            reason="Invalid project ID.",
        )
        return

    if requested_project_id != project_id:
        await websocket.close(
            code=4403,
            reason="Project access denied.",
        )
        return

    # 5. Validate meeting title.

    title = (
        websocket.query_params.get("title")
        or "Live Meeting"
    ).strip()

    if len(title) < 2 or len(title) > 250:
        await websocket.close(
            code=4400,
            reason="Meeting title must contain 2 to 250 characters.",
        )
        return

    # 6. Verify user is active and owns this project.

    with SessionLocal() as db:
        user = db.get(User, user_id)

        if user is None or not user.is_active:
            await websocket.close(
                code=4401,
                reason="User is not authorized.",
            )
            return

        project = db.scalar(
            select(Project).where(
                Project.id == project_id,
                Project.owner_id == user_id,
            )
        )

        if project is None:
            await websocket.close(
                code=4404,
                reason="Project not found.",
            )
            return

    # 7. Authentication and authorization succeeded.
    # Only now accept the WebSocket connection.

    await websocket.accept()

    file_name = f"live-meeting-{uuid4().hex}.webm"
    file_path = UPLOAD_DIR / file_name

    meeting_id = None
    total_size = 0
    recording_file = None
    stop_requested = False

    try:

        # 8. Create a meeting under the authenticated user's project.

        with SessionLocal() as db:
            project = db.scalar(
                select(Project).where(
                    Project.id == project_id,
                    Project.owner_id == user_id,
                )
            )

            if project is None:
                await websocket.send_json({
                    "type": "error",
                    "message": "Project not found.",
                })

                await websocket.close(code=4404)
                return

            meeting = Meeting(
                project_id=project_id,
                title=title,
                original_filename=file_name,
                storage_path=str(file_path),
                mime_type="audio/webm",
                file_size_bytes=0,
                status="recording",
            )

            db.add(meeting)
            db.commit()
            db.refresh(meeting)

            meeting_id = meeting.id

        # 9. Prepare recording storage.

        UPLOAD_DIR.mkdir(
            parents=True,
            exist_ok=True,
        )

        recording_file = file_path.open("wb")

        await websocket.send_json({
            "type": "started",
            "meeting_id": meeting_id,
            "message": "Live recording started.",
        })

        # 10. Receive audio chunks from the browser.

        while True:

            message = await websocket.receive()

            if message["type"] == "websocket.disconnect":
                break

            if message.get("bytes") is not None:

                chunk = message["bytes"]

                if not chunk:
                    continue

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:

                    await websocket.send_json({
                        "type": "error",
                        "message": "Recording exceeded the 500 MB limit.",
                    })

                    break

                recording_file.write(chunk)
                continue

            text = message.get("text")

            if text:

                try:
                    control = json.loads(text)

                except json.JSONDecodeError:
                    continue

                if control.get("action") == "stop":
                    stop_requested = True
                    break

        # 11. Close and flush recording file.

        recording_file.flush()
        recording_file.close()
        recording_file = None

        # 12. Handle unexpected disconnection.

        if not stop_requested:

            update_interrupted_meeting(
                meeting_id,
                total_size,
                "The browser connection ended before the recording was stopped.",
            )

            await websocket.send_json({
                "type": "interrupted",
                "meeting_id": meeting_id,
                "message": (
                    "Recording saved, but the session ended unexpectedly."
                ),
            })

            return

        # 13. Handle empty recording.

        if total_size == 0:

            with SessionLocal() as db:

                meeting = db.get(Meeting, meeting_id)

                if meeting:
                    meeting.status = "failed"
                    meeting.processing_error = (
                        "No audio data was received."
                    )
                    db.commit()

            await websocket.send_json({
                "type": "error",
                "meeting_id": meeting_id,
                "message": "No audio data was received.",
            })

            return

        # 14. Update meeting status.

        with SessionLocal() as db:

            meeting = db.get(Meeting, meeting_id)

            if meeting:
                meeting.file_size_bytes = total_size
                meeting.status = "transcribing"
                db.commit()

        await websocket.send_json({
            "type": "transcribing",
            "meeting_id": meeting_id,
            "message": "Recording saved. Transcription started.",
        })

        # 15. Transcribe the recording.

        result = await asyncio.to_thread(
            transcribe_recording,
            str(file_path),
        )

        # 16. Save transcript and extract intelligence.

        intelligence_result = await asyncio.to_thread(
            save_transcription,
            meeting_id,
            result,
        )

        # 17. Return completed meeting information.

        await websocket.send_json({
            "type": "completed",
            "meeting_id": meeting_id,
            "duration_seconds": result["duration_seconds"],
            "language": result["language"],
            "segments": result["segments"],
            "action_items_count": (
                intelligence_result["action_items_count"]
            ),
            "decisions_count": (
                intelligence_result["decisions_count"]
            ),
            "extraction_error": (
                intelligence_result["extraction_error"]
            ),
            "message": (
                "Live meeting saved and processed successfully."
            ),
        })

    except WebSocketDisconnect:

        if meeting_id is not None:

            if recording_file and not recording_file.closed:
                recording_file.flush()
                recording_file.close()
                recording_file = None

            update_interrupted_meeting(
                meeting_id,
                total_size,
                "WebSocket disconnected unexpectedly.",
            )

    except Exception as exc:

        if recording_file and not recording_file.closed:
            recording_file.flush()
            recording_file.close()
            recording_file = None

        if meeting_id is not None:

            with SessionLocal() as db:

                meeting = db.get(Meeting, meeting_id)

                if meeting:
                    meeting.file_size_bytes = total_size
                    meeting.status = "failed"
                    meeting.processing_error = str(exc)[:2000]
                    db.commit()

        try:

            await websocket.send_json({
                "type": "error",
                "meeting_id": meeting_id,
                "message": str(exc)[:1000],
            })

        except Exception:
            pass

    finally:

        if recording_file and not recording_file.closed:
            recording_file.close()
