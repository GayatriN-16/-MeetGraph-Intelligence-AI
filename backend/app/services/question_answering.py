
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
    "this", "that", "involving", "related", "information",
    "details", "filter", "search", "across",
}


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z0-9]+", text.lower())
    return {word for word in words if word not in STOP_WORDS}


def format_deadline(value):
    return value.strftime("%d %B %Y") if value else "No deadline specified"


def format_action_assignee(item):
    if item.assignee_name:
        return item.assignee_name

    if item.assignee:
        return item.assignee.display_name

    return "Unassigned"


def build_grouped_transcript(segments, meeting):
    """Group consecutive transcript fragments from the same speaker."""

    grouped = []

    for segment in segments:
        text = (segment.text or "").strip()
        if not text:
            continue

        speaker = (
            segment.speaker.display_name
            if segment.speaker
            else None
        )

        if (
            grouped
            and grouped[-1]["speaker"] == speaker
            and not re.search(r'[.!?]["\']?$', grouped[-1]["text"])
        ):
            grouped[-1]["text"] += " " + text
            grouped[-1]["end_seconds"] = segment.end_seconds
        else:
            grouped.append({
                "text": text,
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


def find_meeting(question: str, meetings, requested_meeting_id=None):
    """Resolve an explicit meeting ID, title or ordinal reference."""

    if requested_meeting_id is not None:
        return next(
            (m for m in meetings if m.id == requested_meeting_id),
            None,
        )

    question_lower = question.lower()

    for meeting in meetings:
        title = (meeting.title or "").strip().lower()
        if title and title in question_lower:
            return meeting

    ordinal = re.search(r"\bmeeting\s*(\d+)\b", question_lower)
    if ordinal:
        number = int(ordinal.group(1))
        if 1 <= number <= len(meetings):
            return meetings[number - 1]

    return None


def make_action_source(item, meeting):
    return {
        "meeting_id": meeting.id,
        "meeting_title": meeting.title,
        "source_type": "action_item",
        "evidence_text": item.evidence_text or item.task_description,
        "speaker": format_action_assignee(item),
        "start_seconds": item.start_seconds,
        "end_seconds": item.end_seconds,
    }


def answer_project_question(
    db: Session,
    project_id: int,
    question: str,
    meeting_id: int | None = None,
):
    # Load only meeting metadata first. This is a small query.
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

    selected_meeting = find_meeting(
        question,
        meetings,
        requested_meeting_id=meeting_id,
    )

    if meeting_id is not None and selected_meeting is None:
        return {
            "answer": "The selected meeting was not found in this project.",
            "sources": [],
        }

    ordinal_match = re.search(r"\bmeeting\s*(\d+)\b", question.lower())

    if ordinal_match and selected_meeting is None:
        return {
            "answer": (
                f"Meeting {ordinal_match.group(1)} was not found. "
                f"This project contains {len(meetings)} meetings."
            ),
            "sources": [],
        }

    selected_meetings = (
        [selected_meeting] if selected_meeting else meetings
    )

    selected_ids = [meeting.id for meeting in selected_meetings]
    meeting_by_id = {meeting.id: meeting for meeting in selected_meetings}

    question_lower = question.lower()
    question_tokens = tokenize(question)

    # Identify the question category before loading large transcript data.
    asks_about_tasks = any(
        term in question_lower
        for term in (
            "task", "tasks", "assigned", "assignee",
            "responsible", "pending", "remaining", "remain",
            "deadline", "due date", "due", "still working",
        )
    )

    asks_about_deadlines = any(
        term in question_lower
        for term in (
            "deadline", "due date", "pending", "due",
            "remaining", "remain", "left", "still working",
        )
    )

    # ---------------------------------------------------------
    # 1. Task and deadline questions.
    #    Do not load transcript segments or decisions here.
    # ---------------------------------------------------------

    if asks_about_tasks:
        actions = db.scalars(
            select(ActionItem)
            .options(selectinload(ActionItem.assignee))
            .where(ActionItem.meeting_id.in_(selected_ids))
            .order_by(ActionItem.meeting_id, ActionItem.id)
        ).all()

        named_people = {
            item.assignee_name.strip().lower()
            for item in actions
            if item.assignee_name
        }

        matched_person = next(
            (
                person
                for person in named_people
                if re.search(
                    rf"\b{re.escape(person)}\b",
                    question_lower,
                )
            ),
            None,
        )

        if matched_person:
            relevant_actions = [
                item for item in actions
                if (item.assignee_name or "").strip().lower()
                == matched_person
            ]

            if relevant_actions:
                answer_parts = [
                    f"Tasks assigned to {matched_person.title()}:"
                ]
                sources = []

                for item in relevant_actions:
                    meeting = meeting_by_id[item.meeting_id]

                    answer_parts.append(
                        f"- {item.task_description}. "
                        f"Deadline: {format_deadline(item.due_date)}. "
                        f"Meeting: {meeting.title}."
                    )
                    sources.append(make_action_source(item, meeting))

                return {
                    "answer": "\n".join(answer_parts),
                    "sources": sources,
                }

        if asks_about_deadlines:
            pending = [
                item for item in actions
                if (item.status or "").lower()
                not in ("completed", "cancelled")
            ]

            if pending:
                answer_parts = ["Pending tasks and their deadlines:"]
                sources = []

                for item in pending:
                    meeting = meeting_by_id[item.meeting_id]

                    answer_parts.append(
                        f"- {item.task_description}. "
                        f"Assignee: {format_action_assignee(item)}. "
                        f"Deadline: {format_deadline(item.due_date)}. "
                        f"Meeting: {meeting.title}."
                    )
                    sources.append(make_action_source(item, meeting))

                return {
                    "answer": "\n".join(answer_parts),
                    "sources": sources,
                }

            return {
                "answer": "No pending tasks or deadlines were found in the selected meeting scope.",
                "sources": [],
            }

        if actions:
            sources = [
                make_action_source(item, meeting_by_id[item.meeting_id])
                for item in actions
            ]

            return {
                "answer": (
                    "Action items found in the selected meeting scope:\n"
                    + "\n".join(
                        f"- {item.task_description}. "
                        f"Assignee: {format_action_assignee(item)}."
                        for item in actions
                    )
                ),
                "sources": sources,
            }

    # ---------------------------------------------------------
    # 2. Meeting overview questions.
    # ---------------------------------------------------------

    asks_about_overview = any(
        term in question_lower
        for term in (
            "what happened", "what was discussed",
            "summarize", "summary", "overview",
            "discussed in",
        )
    )

    if selected_meeting and (
        asks_about_overview or not question_tokens
    ):
        segments = db.scalars(
            select(TranscriptSegment)
            .options(selectinload(TranscriptSegment.speaker))
            .where(TranscriptSegment.meeting_id == selected_meeting.id)
            .order_by(TranscriptSegment.start_seconds)
        ).all()

        sources = build_grouped_transcript(
            segments,
            selected_meeting,
        )[:10]

        if sources:
            return {
                "answer": (
                    f"Discussion summary for {selected_meeting.title}:\n"
                    + "\n".join(
                        f"- {source['evidence_text']}"
                        for source in sources
                    )
                ),
                "sources": sources,
            }

    # ---------------------------------------------------------
    # 3. General transcript and decision retrieval.
    #    Only load the selected project scope.
    # ---------------------------------------------------------

    segments = db.scalars(
        select(TranscriptSegment)
        .options(selectinload(TranscriptSegment.speaker))
        .where(TranscriptSegment.meeting_id.in_(selected_ids))
        .order_by(
            TranscriptSegment.meeting_id,
            TranscriptSegment.start_seconds,
        )
    ).all()

    segments_by_meeting = {}
    for segment in segments:
        segments_by_meeting.setdefault(segment.meeting_id, []).append(segment)

    scored_sources = []

    for meeting in selected_meetings:
        grouped_sources = build_grouped_transcript(
            segments_by_meeting.get(meeting.id, []),
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
            item[1]["start_seconds"]
            if item[1]["start_seconds"] is not None else 0,
        )
    )

    sources = [
        source for _, source in scored_sources[:8]
    ]

    # Retrieve decisions only for general retrieval questions.
    decisions = db.scalars(
        select(Decision)
        .where(Decision.meeting_id.in_(selected_ids))
        .order_by(Decision.meeting_id, Decision.id)
    ).all()

    for decision in decisions:
        decision_text = (
            f"{decision.title} "
            f"{decision.description or ''} "
            f"{decision.evidence_text or ''}"
        )

        if question_tokens.intersection(tokenize(decision_text)):
            meeting = meeting_by_id[decision.meeting_id]

            sources.append({
                "meeting_id": meeting.id,
                "meeting_title": meeting.title,
                "source_type": "decision",
                "evidence_text": decision.evidence_text or decision.title,
                "speaker": None,
                "start_seconds": decision.start_seconds,
                "end_seconds": decision.end_seconds,
            })

    if sources:
        scope_text = (
            f"{selected_meeting.title}:\n"
            if selected_meeting
            else "project meetings:\n"
        )

        return {
            "answer": (
                f"Relevant information found in {scope_text}"
                + "\n".join(
                    f"- {source['evidence_text']} "
                    f"(Meeting: {source['meeting_title']})"
                    for source in sources
                )
            ),
            "sources": sources,
        }

    scope_description = (
        f"the meeting '{selected_meeting.title}'"
        if selected_meeting
        else "the project's meetings"
    )

    return {
        "answer": (
            "I could not find sufficient supporting information "
            f"for this question in {scope_description}. "
            "Try rephrasing the question or checking the meeting transcript."
        ),
        "sources": [],
    }
