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
    "details", "filter", "search", "across", "main",
    "there", "their", "they", "its", "it", "be", "been",
    "will", "would", "could", "should", "can",
}


AGENDA_PATTERNS = [
    r"\b(today|now)\s+we\s+(will|are going to|want to)\s+discuss\b",
    r"\b(the\s+)?agenda\s+(is|includes|for today)\b",
    r"\bpurpose\s+of\s+this\s+meeting\b",
    r"\bobjective\s+of\s+this\s+meeting\b",
    r"\bwe\s+are\s+here\s+to\s+discuss\b",
    r"\bgoal\s+for\s+today\b",
    r"\btopics?\s+(for today|to discuss)\b",
    r"\btoday'?s\s+meeting\s+will\s+focus\s+on\b",
    r"\bthe\s+purpose\s+today\s+is\b",
]


TOPIC_CONCEPTS = {
    "project progress": [
        "project progress", "progress of the project",
        "project update", "project status",
    ],
    "backend integration": [
        "backend integration", "back-end integration",
        "api integration", "backend development",
    ],
    "frontend development": [
        "frontend", "user interface", "ui development",
    ],
    "team structure and responsibilities": [
        "team structure", "team restructuring",
        "new team", "team roles",
    ],
    "security and policies": [
        "security", "security policies", "secure",
        "security incident",
    ],
    "dynamic analysis": ["dynamic analysis"],
    "engineering velocity": [
        "engineering velocity", "development velocity",
    ],
    "planning and refinement": [
        "planning", "refinement", "milestones",
    ],
    "reliability and error budgets": [
        "reliability", "error budget",
    ],
    "data science and machine learning": [
        "data science", "machine learning", "applied ml",
    ],
    "customer escalations": [
        "customer escalation", "customer issue",
    ],
    "sample recordings": [
        "sample recordings", "recording preparation",
    ],
    "task assignments": [
        "assigned", "responsible for",
        "will prepare", "will complete",
    ],
}


def tokenize(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z0-9]+", (text or "").lower())
    return {word for word in words if word not in STOP_WORDS}


def filter_actions_by_question(actions, question_tokens):
    """Prefer action items whose descriptions match the question terms.

    If the question has no meaningful overlap with any task description,
    preserve the existing behavior and return all supplied actions.
    """
    if not actions or not question_tokens:
        return actions

    matched_actions = [
        item for item in actions
        if question_tokens.intersection(tokenize(item.task_description))
    ]

    return matched_actions or actions


def format_deadline(value):
    return value.strftime("%d %B %Y") if value else "Not specified"


def format_action_assignee(item):
    if item.assignee_name:
        return item.assignee_name

    if item.assignee:
        return item.assignee.display_name

    return "Unassigned"


def find_meeting(question: str, meetings, requested_meeting_id=None):
    """Resolve a meeting by ID, title or ordinal number."""

    if requested_meeting_id is not None:
        return next(
            (meeting for meeting in meetings
             if meeting.id == requested_meeting_id),
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


def build_grouped_transcript(segments, meeting):
    """Combine consecutive incomplete transcript fragments."""

    grouped = []

    for segment in segments:
        text = (segment.text or "").strip()

        if not text:
            continue

        speaker = (
            segment.speaker.display_name
            if segment.speaker else None
        )

        previous = grouped[-1] if grouped else None

        same_speaker = (
            previous is not None
            and previous["speaker"] == speaker
        )

        previous_is_incomplete = (
            previous is not None
            and not re.search(r'[.!?]["\']?$', previous["text"])
        )

        previous_end = (
            previous["end_seconds"] if previous else None
        )

        current_start = segment.start_seconds

        close_in_time = (
            previous_end is not None
            and current_start is not None
            and current_start - previous_end <= 2.0
        )

        if same_speaker and previous_is_incomplete and close_in_time:
            previous["text"] += " " + text
            previous["end_seconds"] = segment.end_seconds
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


def collect_meeting_transcript(db, meetings):
    """Retrieve transcript evidence for selected meetings."""

    results = []

    for meeting in meetings:
        segments = db.scalars(
            select(TranscriptSegment)
            .options(selectinload(TranscriptSegment.speaker))
            .where(TranscriptSegment.meeting_id == meeting.id)
            .order_by(TranscriptSegment.start_seconds)
        ).all()

        results.extend(build_grouped_transcript(segments, meeting))

    return results


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


def make_decision_source(decision, meeting):
    return {
        "meeting_id": meeting.id,
        "meeting_title": meeting.title,
        "source_type": "decision",
        "evidence_text": (
            decision.evidence_text
            or decision.description
            or decision.title
        ),
        "speaker": None,
        "start_seconds": decision.start_seconds,
        "end_seconds": decision.end_seconds,
    }


def make_transcript_answer(title, sources):
    return (
        f"{title}\n"
        + "\n".join(
            f"- {source['evidence_text']} "
            f"(Meeting: {source['meeting_title']})"
            for source in sources
        )
    )


def is_agenda_statement(text: str) -> bool:
    return any(
        re.search(pattern, text, re.IGNORECASE)
        for pattern in AGENDA_PATTERNS
    )


def identify_topic_labels(text: str) -> list[str]:
    text_lower = (text or "").lower()
    labels = []

    for label, phrases in TOPIC_CONCEPTS.items():
        if any(phrase in text_lower for phrase in phrases):
            labels.append(label)

    return labels


def make_topic_results(transcript_sources):
    topic_groups = {}

    for source in transcript_sources:
        labels = identify_topic_labels(source["evidence_text"])

        for label in labels:
            topic_groups.setdefault(label, [])

            if len(topic_groups[label]) < 3:
                topic_groups[label].append(source)

    return [
        {"label": label, "sources": evidence}
        for label, evidence in topic_groups.items()
    ]


def select_timeline_sources(sources, limit=12):
    if len(sources) <= limit:
        return sources

    ordered = sorted(
        sources,
        key=lambda source: (
            source["start_seconds"]
            if source["start_seconds"] is not None else 0
        ),
    )

    selected_indices = {
        round(i * (len(ordered) - 1) / (limit - 1))
        for i in range(limit)
    }

    return [
        ordered[index]
        for index in sorted(selected_indices)
    ]


def answer_project_question(
    db: Session,
    project_id: int,
    question: str,
    meeting_id: int | None = None,
):
    # 1. Load project meetings.

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

    ordinal_match = re.search(
        r"\bmeeting\s*(\d+)\b",
        question.lower(),
    )

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

    meeting_by_id = {
        meeting.id: meeting for meeting in selected_meetings
    }

    question_lower = question.lower()
    question_tokens = tokenize(question)

    # 2. Detect question categories.

    asks_about_tasks = any(
        term in question_lower
        for term in (
            "task", "tasks", "assigned", "assignee",
            "responsible", "pending", "remaining",
            "remain", "deadline", "due date", "due",
            "still working",
        )
    )

    asks_about_deadlines = any(
        term in question_lower
        for term in (
            "deadline", "due date", "pending", "due",
            "remaining", "remain", "left", "still working",
        )
    )

    asks_about_agenda = any(
        term in question_lower
        for term in (
            "agenda", "purpose of this meeting",
            "objective of this meeting",
            "goal of this meeting",
            "what is this meeting about",
        )
    )

    asks_about_topics = any(
        term in question_lower
        for term in (
            "topic", "topics", "subject", "subjects",
            "what was discussed", "what did they discuss",
        )
    )

    asks_about_decisions = any(
        term in question_lower
        for term in (
            "decision", "decisions",
            "what was decided", "what did we agree",
        )
    )

    asks_about_overview = any(
        term in question_lower
        for term in (
            "what happened", "summarize", "summary",
            "overview", "discussed in", "meeting summary",
            "what was discussed",
        )
    )

    # 3. Retrieve action items when required.

    actions = []

    if asks_about_tasks:
        actions = db.scalars(
            select(ActionItem)
            .options(selectinload(ActionItem.assignee))
            .where(ActionItem.meeting_id.in_(selected_ids))
            .order_by(ActionItem.meeting_id, ActionItem.id)
        ).all()

    # 4. Retrieve transcript when required.
    # This happens before combined-question handling.

    needs_transcript = (
        asks_about_agenda
        or asks_about_topics
        or asks_about_overview
        or not asks_about_decisions
    )

    transcript_sources = (
        collect_meeting_transcript(db, selected_meetings)
        if needs_transcript else []
    )

    # 5. COMBINED QUESTION HANDLING.
    # This is the important fix.
    # Discussion and task results are assembled together.
    # Neither result is allowed to return early.

    asks_about_discussion_and_tasks = (
        asks_about_tasks
        and (
            asks_about_agenda
            or asks_about_topics
            or asks_about_overview
        )
    )

    if asks_about_discussion_and_tasks:
        answer_parts = []
        sources = []

        if transcript_sources:
            discussion_sources = select_timeline_sources(
                transcript_sources,
                limit=12,
            )

            answer_parts.append("Meeting discussion:")

            for source in discussion_sources:
                timestamp = source["start_seconds"]

                timestamp_text = (
                    f"[{timestamp:.1f}s] "
                    if timestamp is not None else ""
                )

                answer_parts.append(
                    f"- {timestamp_text}{source['evidence_text']}"
                )

            sources.extend(discussion_sources)

        else:
            answer_parts.append(
                "No transcript discussion evidence was found "
                "in the selected meeting scope."
            )

        if asks_about_deadlines:
            relevant_actions = [
                item for item in actions
                if (item.status or "").lower()
                not in ("completed", "cancelled")
            ]
            relevant_actions = filter_actions_by_question(
                relevant_actions,
                question_tokens,
            )
        else:
            relevant_actions = actions

        if relevant_actions:
            answer_parts.append(
                "\nPending tasks and their deadlines:"
                if asks_about_deadlines
                else "\nAction items:"
            )

            for item in relevant_actions:
                meeting = meeting_by_id[item.meeting_id]

                duration = (
                    f"{item.estimated_duration_minutes} minutes"
                    if item.estimated_duration_minutes is not None
                    else "Not specified"
                )

                answer_parts.append(
                    f"- {item.task_description}. "
                    f"Assignee: {format_action_assignee(item)}. "
                    f"Deadline: {format_deadline(item.due_date)}. "
                    f"Estimated duration: {duration}. "
                    f"Meeting: {meeting.title}."
                )

                sources.append(make_action_source(item, meeting))

        else:
            answer_parts.append(
                "\nNo pending tasks were found in the selected meeting scope."
                if asks_about_deadlines
                else "\nNo action items were found in the selected meeting scope."
            )

        return {
            "answer": "\n".join(answer_parts),
            "sources": sources,
        }

    # 6. Task-only questions.

    if asks_about_tasks:
        named_people = {
            item.assignee_name.strip().lower()
            for item in actions
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

                    duration = (
                        f"{item.estimated_duration_minutes} minutes"
                        if item.estimated_duration_minutes is not None
                        else "Not specified"
                    )

                    answer_parts.append(
                        f"- {item.task_description}. "
                        f"Deadline: {format_deadline(item.due_date)}. "
                        f"Estimated duration: {duration}. "
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
            pending = filter_actions_by_question(
                pending,
                question_tokens,
            )

            if not pending:
                return {
                    "answer": (
                        "No pending tasks or deadlines were found "
                        "in the selected meeting scope."
                    ),
                    "sources": [],
                }

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

        if actions:
            sources = [
                make_action_source(
                    item,
                    meeting_by_id[item.meeting_id],
                )
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

        return {
            "answer": (
                "No action items were found in the selected meeting scope."
            ),
            "sources": [],
        }

    # 7. Agenda questions.

    if asks_about_agenda:
        agenda_sources = [
            source for source in transcript_sources
            if is_agenda_statement(source["evidence_text"])
        ]

        if agenda_sources:
            return {
                "answer": make_transcript_answer(
                    "Explicit meeting agenda statements found:",
                    agenda_sources[:5],
                ),
                "sources": agenda_sources[:5],
            }

        topic_groups = make_topic_results(transcript_sources)

        if topic_groups:
            answer_parts = [
                "No explicit agenda statement was found. "
                "Inferred discussion focus areas:"
            ]

            sources = []

            for group in topic_groups[:8]:
                answer_parts.append(f"- {group['label'].title()}")
                sources.extend(group["sources"])

            return {
                "answer": "\n".join(answer_parts),
                "sources": sources,
            }

        return {
            "answer": (
                "No explicit agenda or sufficiently clear "
                "discussion topics were found in the selected meeting."
            ),
            "sources": [],
        }

    # 8. Discussion-topic questions.

    if asks_about_topics:
        topic_groups = make_topic_results(transcript_sources)

        if topic_groups:
            answer_parts = [
                "Main discussion topics identified from transcript evidence:"
            ]

            sources = []

            for group in topic_groups[:10]:
                answer_parts.append(f"- {group['label'].title()}")
                sources.extend(group["sources"])

            return {
                "answer": "\n".join(answer_parts),
                "sources": sources,
            }

        return {
            "answer": (
                "No recognized discussion topics were identified "
                "in the selected meeting scope."
            ),
            "sources": [],
        }

    # 9. Decision questions.

    if asks_about_decisions:
        decisions = db.scalars(
            select(Decision)
            .where(Decision.meeting_id.in_(selected_ids))
            .order_by(Decision.meeting_id, Decision.id)
        ).all()

        if decisions:
            sources = [
                make_decision_source(
                    decision,
                    meeting_by_id[decision.meeting_id],
                )
                for decision in decisions
            ]

            answer_parts = ["Decisions recorded in the selected scope:"]

            for decision in decisions:
                meeting = meeting_by_id[decision.meeting_id]

                answer_parts.append(
                    f"- {decision.title}. "
                    f"{decision.description or ''} "
                    f"(Meeting: {meeting.title})"
                )

            return {
                "answer": "\n".join(answer_parts),
                "sources": sources,
            }

        return {
            "answer": (
                "No recorded decisions were found in the selected scope."
            ),
            "sources": [],
        }

    # 10. Meeting overview questions.

    if asks_about_overview:
        if not transcript_sources:
            return {
                "answer": (
                    "No transcript content was found in the selected "
                    "meeting scope."
                ),
                "sources": [],
            }

        overview_sources = select_timeline_sources(
            transcript_sources,
            limit=12,
        )

        answer_parts = [
            "Meeting overview based on transcript evidence:"
        ]

        for source in overview_sources:
            timestamp = source["start_seconds"]

            timestamp_text = (
                f"[{timestamp:.1f}s] "
                if timestamp is not None else ""
            )

            answer_parts.append(
                f"- {timestamp_text}{source['evidence_text']} "
                f"(Meeting: {source['meeting_title']})"
            )

        return {
            "answer": "\n".join(answer_parts),
            "sources": overview_sources,
        }

    # 11. General transcript retrieval.

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
        segments_by_meeting.setdefault(
            segment.meeting_id, []
        ).append(segment)

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

    # 12. Include relevant decisions.

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
            sources.append(make_decision_source(decision, meeting))

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

    # 13. No supporting evidence.

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