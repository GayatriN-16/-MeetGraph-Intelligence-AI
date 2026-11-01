
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Meeting, Project, TranscriptSegment, Decision, ActionItem
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
        "meeting_id": item.meeting_id,
        "task_description": item.task_description,
        "assignee_name": item.assignee_name,
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
        "meeting_id": item.meeting_id,
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

    year = meeting.created_at.year if meeting.created_at else 2026
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
            db.add(
                ActionItem(
                    meeting_id=meeting_id,
                    task_description=item["task_description"],
                    assignee_name=item.get("assignee_name"),
                    assignee_speaker_id=item.get("assignee_speaker_id"),
                    due_date=item["due_date"],
                    estimated_duration_minutes=item[
                        "estimated_duration_minutes"
                    ],
                    evidence_text=item["evidence_text"],
                    start_seconds=item["start_seconds"],
                    end_seconds=item["end_seconds"],
                )
            )

        for item in result["decisions"]:
            db.add(
                Decision(
                    meeting_id=meeting_id,
                    title=item["title"],
                    description=item["description"],
                    speaker_id=item["speaker_id"],
                    evidence_text=item["evidence_text"],
                    start_seconds=item["start_seconds"],
                    end_seconds=item["end_seconds"],
                    confidence=item["confidence"],
                )
            )

        db.commit()

    except Exception:
        db.rollback()
        raise

    saved_actions = db.scalars(
        select(ActionItem)
        .where(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.id)
    ).all()

    saved_decisions = db.scalars(
        select(Decision)
        .where(Decision.meeting_id == meeting_id)
        .order_by(Decision.id)
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
        select(ActionItem)
        .where(ActionItem.meeting_id == meeting_id)
        .order_by(ActionItem.id)
    ).all()

    decisions = db.scalars(
        select(Decision)
        .where(Decision.meeting_id == meeting_id)
        .order_by(Decision.id)
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


@router.get("/projects/{project_id}/intelligence")
def get_project_intelligence(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    meetings = db.scalars(
        select(Meeting)
        .where(Meeting.project_id == project_id)
        .order_by(Meeting.created_at.asc())
    ).all()

    meeting_ids = [meeting.id for meeting in meetings]

    if not meeting_ids:
        return {
            "project_id": project.id,
            "project_name": project.name,
            "total_meetings": 0,
            "processed_meetings": 0,
            "total_action_items": 0,
            "pending_action_items": 0,
            "completed_action_items": 0,
            "total_decisions": 0,
            "meetings": [],
            "action_items": [],
            "decisions": [],
        }

    actions = db.scalars(
        select(ActionItem)
        .where(ActionItem.meeting_id.in_(meeting_ids))
        .order_by(ActionItem.meeting_id, ActionItem.id)
    ).all()

    decisions = db.scalars(
        select(Decision)
        .where(Decision.meeting_id.in_(meeting_ids))
        .order_by(Decision.meeting_id, Decision.id)
    ).all()

    meeting_results = []

    for meeting in meetings:
        segments = get_segments(db, meeting.id)

        summary = ""
        key_points = []

        if segments:
            year = meeting.created_at.year if meeting.created_at else 2026
            result = extract_meeting_intelligence(segments, year)
            summary = result["summary"]
            key_points = result["key_points"]

        meeting_results.append({
            "meeting_id": meeting.id,
            "title": meeting.title,
            "status": meeting.status,
            "duration_seconds": meeting.duration_seconds,
            "summary": summary,
            "key_points": key_points,
            "action_item_count": sum(
                1 for item in actions
                if item.meeting_id == meeting.id
            ),
            "decision_count": sum(
                1 for item in decisions
                if item.meeting_id == meeting.id
            ),
        })

    action_results = [serialize_action(item) for item in actions]
    decision_results = [serialize_decision(item) for item in decisions]

    pending_count = sum(
        1 for item in actions
        if item.status.lower() == "open"
    )

    completed_count = sum(
        1 for item in actions
        if item.status.lower() == "completed"
    )

    processed_count = sum(
        1 for meeting in meetings
        if meeting.status == "transcribed"
    )

    return {
        "project_id": project.id,
        "project_name": project.name,
        "total_meetings": len(meetings),
        "processed_meetings": processed_count,
        "total_action_items": len(actions),
        "pending_action_items": pending_count,
        "completed_action_items": completed_count,
        "total_decisions": len(decisions),
        "meetings": meeting_results,
        "action_items": action_results,
        "decisions": decision_results,
    }
