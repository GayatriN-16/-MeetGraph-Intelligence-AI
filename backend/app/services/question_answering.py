
import re

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Meeting, TranscriptSegment, ActionItem, Decision


STOP_WORDS = {
    "what", "which", "who", "when", "where", "why", "how",
    "the", "is", "are", "was", "were", "a", "an", "to",
    "of", "in", "on", "for", "and", "or", "with", "about",
    "me", "tell", "show", "give", "please", "did", "do",
    "does", "happened", "happen", "meeting", "project",
    "all", "any", "from", "between", "assigned", "responsible",
    "work", "done", "still", "remaining", "remain", "left",
    "discussed", "discuss", "talked", "talk", "covered",
}


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return {word for word in words if word not in STOP_WORDS}


def format_deadline(value):
    if not value:
        return "No deadline specified"
    return value.strftime("%d %B %Y")


def build_grouped_transcript(segments, meeting):
    """Combine consecutive transcript fragments into readable sentences."""
    grouped = []

    for segment in segments:
        speaker = (
            segment.speaker.display_name
            if segment.speaker else None
        )

        if (
            grouped
            and grouped[-1]["speaker"] == speaker
            and not re.search(r'[.!?]["\']?$', grouped[-1]["text"].strip())
        ):
            grouped[-1]["text"] += " " + segment.text.strip()
            grouped[-1]["end_seconds"] = segment.end_seconds
        else:
            grouped.append({
                "text": segment.text.strip(),
                "speaker": speaker,
                "start_seconds": segment.start_seconds,
                "end_seconds": segment.end_seconds,
            })

    return [
        {
            "meeting_id": meeting.id,
            "meeting_title": meeting.title,
            "source_type": "transcript",
            "evidence_text": item["text"],
            "speaker": item["speaker"],
            "start_seconds": item["start_seconds"],
            "end_seconds": item["end_seconds"],
        }
        for item in grouped
    ]


def format_action_assignee(item):
    if item.assignee_name:
        return item.assignee_name

    if item.assignee:
        return item.assignee.display_name

    return "Unassigned"


def answer_project_question(
    db: Session,
    project_id: int,
    question: str,
):
    meetings = db.scalars(
        select(Meeting)
        .where(Meeting.project_id == project_id)
        .order_by(Meeting.created_at.asc(), Meeting.id.asc())
    ).all()

    if not meetings:
        return {
            "answer": "This project does not contain any meetings yet.",
            "sources": [],
        }

    meeting_by_id = {meeting.id: meeting for meeting in meetings}
    meeting_ids = list(meeting_by_id.keys())

    segments = db.scalars(
        select(TranscriptSegment)
        .options(selectinload(TranscriptSegment.speaker))
        .where(TranscriptSegment.meeting_id.in_(meeting_ids))
        .order_by(
            TranscriptSegment.meeting_id,
            TranscriptSegment.start_seconds,
        )
    ).all()

    actions = db.scalars(
        select(ActionItem)
        .options(selectinload(ActionItem.assignee))
        .where(ActionItem.meeting_id.in_(meeting_ids))
        .order_by(ActionItem.meeting_id, ActionItem.id)
    ).all()

    decisions = db.scalars(
        select(Decision)
        .where(Decision.meeting_id.in_(meeting_ids))
        .order_by(Decision.meeting_id, Decision.id)
    ).all()

    question_lower = question.lower()
    question_tokens = tokenize(question)

    ordinal_match = re.search(
        r"\bmeeting\s*(\d+)\b",
        question_lower,
    )

    selected_meetings = meetings

    if ordinal_match:
        ordinal = int(ordinal_match.group(1))

        if ordinal < 1 or ordinal > len(meetings):
            return {
                "answer": (
                    f"Meeting {ordinal} was not found. "
                    f"This project contains {len(meetings)} meetings."
                ),
                "sources": [],
            }

        selected_meetings = [meetings[ordinal - 1]]

    selected_ids = {meeting.id for meeting in selected_meetings}

    selected_segments = [
        segment for segment in segments
        if segment.meeting_id in selected_ids
    ]

    selected_actions = [
        item for item in actions
        if item.meeting_id in selected_ids
    ]

    selected_decisions = [
        item for item in decisions
        if item.meeting_id in selected_ids
    ]

    # Find named assignees.
    named_people = {
        item.assignee_name.strip().lower()
        for item in selected_actions
        if item.assignee_name
    }

    matched_person = next(
        (
            person for person in named_people
            if re.search(
                rf"\b{re.escape(person)}\b",
                question_lower,
            )
        ),
        None,
    )

    if matched_person and any(
        word in question_lower
        for word in ("task", "assigned", "responsible", "work")
    ):
        person_actions = [
            item for item in selected_actions
            if (item.assignee_name or "").strip().lower()
            == matched_person
        ]

        if person_actions:
            answer_parts = [
                f"Tasks assigned to {matched_person.title()}:"
            ]
            sources = []

            for item in person_actions:
                meeting = meeting_by_id[item.meeting_id]

                answer_parts.append(
                    f"- {item.task_description}. "
                    f"Deadline: {format_deadline(item.due_date)}. "
                    f"Meeting: {meeting.title}."
                )

                sources.append({
                    "meeting_id": meeting.id,
                    "meeting_title": meeting.title,
                    "source_type": "action_item",
                    "evidence_text": (
                        item.evidence_text or item.task_description
                    ),
                    "speaker": None,
                    "start_seconds": item.start_seconds,
                    "end_seconds": item.end_seconds,
                })

            return {
                "answer": "\n".join(answer_parts),
                "sources": sources,
            }

    # Find pending tasks and deadlines.
    deadline_terms = (
        "deadline", "due date", "pending", "due",
        "remaining", "remain", "left", "still working",
    )

    if any(term in question_lower for term in deadline_terms):
        relevant_actions = [
            item for item in selected_actions
            if item.status.lower() not in ("completed", "cancelled")
        ]

        if relevant_actions:
            answer_parts = ["Pending tasks and their deadlines:"]
            sources = []

            for item in relevant_actions:
                meeting = meeting_by_id[item.meeting_id]

                answer_parts.append(
                    f"- {item.task_description}. "
                    f"Assignee: {format_action_assignee(item)}. "
                    f"Deadline: {format_deadline(item.due_date)}. "
                    f"Meeting: {meeting.title}."
                )

                sources.append({
                    "meeting_id": meeting.id,
                    "meeting_title": meeting.title,
                    "source_type": "action_item",
                    "evidence_text": (
                        item.evidence_text or item.task_description
                    ),
                    "speaker": (
                        item.assignee.display_name
                        if item.assignee else None
                    ),
                    "start_seconds": item.start_seconds,
                    "end_seconds": item.end_seconds,
                })

            return {
                "answer": "\n".join(answer_parts),
                "sources": sources,
            }

    # Meeting-specific discussion retrieval.
    if ordinal_match and selected_segments:
        meeting = selected_meetings[0]
        sources = build_grouped_transcript(
            selected_segments,
            meeting,
        )

        sources = sources[:10]

        answer = (
            f"Discussion summary for {meeting.title}:\n"
            + "\n".join(
                f"- {source['evidence_text']}"
                for source in sources
            )
        )

        return {
            "answer": answer,
            "sources": sources,
        }

    # General transcript retrieval across meetings.
    scored_sources = []

    for meeting in meetings:
        meeting_segments = [
            segment for segment in segments
            if segment.meeting_id == meeting.id
        ]

        grouped_sources = build_grouped_transcript(
            meeting_segments,
            meeting,
        )

        for source in grouped_sources:
            score = len(
                question_tokens.intersection(
                    tokenize(source["evidence_text"])
                )
            )

            if score > 0:
                scored_sources.append((score, source))

    scored_sources.sort(
        key=lambda item: (
            -item[0],
            item[1]["meeting_id"],
            item[1]["start_seconds"],
        )
    )

    sources = [
        source for _, source in scored_sources[:8]
    ]

    # Add relevant decisions.
    for decision in decisions:
        decision_text = (
            f"{decision.title} {decision.description or ''} "
            f"{decision.evidence_text or ''}"
        )

        if question_tokens.intersection(tokenize(decision_text)):
            meeting = meeting_by_id[decision.meeting_id]

            sources.append({
                "meeting_id": meeting.id,
                "meeting_title": meeting.title,
                "source_type": "decision",
                "evidence_text": (
                    decision.evidence_text or decision.title
                ),
                "speaker": None,
                "start_seconds": decision.start_seconds,
                "end_seconds": decision.end_seconds,
            })

    if sources:
        answer = (
            "Relevant information found in project meetings:\n"
            + "\n".join(
                f"- {source['evidence_text']} "
                f"(Meeting: {source['meeting_title']})"
                for source in sources
            )
        )

        return {
            "answer": answer,
            "sources": sources,
        }

    return {
        "answer": (
            "I could not find sufficient supporting information "
            "for this question in the project's saved meeting transcripts "
            "or extracted records."
        ),
        "sources": [],
    }
