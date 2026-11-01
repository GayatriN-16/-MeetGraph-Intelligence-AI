from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Meeting, TranscriptSegment, Decision, ActionItem
from app.services.extraction import extract_meeting_intelligence

router = APIRouter(tags=["Meeting Intelligence"])


def get_segments(db: Session, meeting_id: int):
    return db.scalars(
        select(TranscriptSegment)
        .options(selectinload(TranscriptSegment.speaker))
        .where(TranscriptSegment.meeting_id == meeting_id)
        .order_by(TranscriptSegment.start_seconds)
    ).all()


def serialize_action(item):
    return {
        "id": item.id,
        "task_description": item.task_description,
        "assignee_speaker_id": item.assignee_speaker_id,
        "due_date": item.due_date.isoformat() if item.due_date else None,
        "estimated_duration_minutes": item.estimated_duration_minutes,
        "status": item.status,
        "evidence_text": item.evidence_text,
        "start_seconds": item.start_seconds,
        "end_seconds": item.end_seconds,
    }


def serialize_decision(item):
    return {
        "id": item.id,
        "title": item.title,
        "description": item.description,
        "speaker_id": item.speaker_id,
        "status": item.status,
        "evidence_text": item.evidence_text,
        "start_seconds": item.start_seconds,
        "end_seconds": item.end_seconds,
        "confidence": item.confidence,
    }


@router.post("/meetings/{meeting_id}/extract")
def extract_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    segments = get_segments(db, meeting_id)

    if not segments:
        raise HTTPException(
            status_code=409,
            detail="No transcript found. Transcribe the meeting first.",
        )

    year = (
        meeting.created_at.year
        if meeting.created_at
        else 2026
    )

    result = extract_meeting_intelligence(segments, year)

    try:
        # Replace previous extraction results on retry.
        db.execute(
            delete(ActionItem).where(ActionItem.meeting_id == meeting_id)
        )
        db.execute(
            delete(Decision).where(Decision.meeting_id == meeting_id)
        )

        for item in result["action_items"]:
            db.add(ActionItem(
                meeting_id=meeting_id,
                task_description=item["task_description"],
                assignee_speaker_id=item["assignee_speaker_id"],
                due_date=item["due_date"],
                estimated_duration_minutes=item["estimated_duration_minutes"],
                evidence_text=item["evidence_text"],
                start_seconds=item["start_seconds"],
                end_seconds=item["end_seconds"],
            ))

        for item in result["decisions"]:
            db.add(Decision(
                meeting_id=meeting_id,
                title=item["title"],
                description=item["description"],
                speaker_id=item["speaker_id"],
                evidence_text=item["evidence_text"],
                start_seconds=item["start_seconds"],
                end_seconds=item["end_seconds"],
                confidence=item["confidence"],
            ))

        db.commit()

    except Exception:
        db.rollback()
        raise

    saved_actions = db.scalars(
        select(ActionItem).where(ActionItem.meeting_id == meeting_id)
    ).all()

    saved_decisions = db.scalars(
        select(Decision).where(Decision.meeting_id == meeting_id)
    ).all()

    return {
        "message": "Meeting extraction completed.",
        "meeting_id": meeting_id,
        "extraction_method": "local_rule_based",
        "summary": result["summary"],
        "key_points": result["key_points"],
        "action_items": [serialize_action(x) for x in saved_actions],
        "decisions": [serialize_decision(x) for x in saved_decisions],
    }


@router.get("/meetings/{meeting_id}/intelligence")
def get_meeting_intelligence(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.get(Meeting, meeting_id)

    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    segments = get_segments(db, meeting_id)

    if not segments:
        raise HTTPException(status_code=409, detail="No transcript found.")

    year = meeting.created_at.year if meeting.created_at else 2026
    result = extract_meeting_intelligence(segments, year)

    actions = db.scalars(
        select(ActionItem).where(ActionItem.meeting_id == meeting_id)
    ).all()

    decisions = db.scalars(
        select(Decision).where(Decision.meeting_id == meeting_id)
    ).all()

    return {
        "meeting_id": meeting_id,
        "meeting_title": meeting.title,
        "extraction_method": "local_rule_based",
        "summary": result["summary"],
        "key_points": result["key_points"],
        "action_items": [serialize_action(x) for x in actions],
        "decisions": [serialize_decision(x) for x in decisions],
    }
