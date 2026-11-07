
import re
from datetime import datetime


MONTHS = {
    name.lower(): index
    for index, name in enumerate([
        "",
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December",
    ])
    if name
}


# Explicit action commitment patterns.
NAMED_FIRST_PERSON_PATTERN = re.compile(
    r"^\s*"
    r"([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,2})"
    r"\s*:\s*I(?:\s+will|'ll)\s+(.+?)(?:[.!?]|$)"
)

NAMED_COMMA_COMMITMENT_PATTERN = re.compile(
    r"^\s*"
    r"([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,2})"
    r"\s*,\s*I(?:\s+will|'ll)\s+(.+?)(?:[.!?]|$)"
)

NAMED_COMMITMENT_PATTERN = re.compile(
    r"\b([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,2})"
    r"\s+will\s+(.+?)(?:[.!?]|$)"
)

FIRST_PERSON_COMMITMENT_PATTERN = re.compile(
    r"\bI(?:\s+will|'ll)\s+(.+?)(?:[.!?]|$)",
    re.IGNORECASE,
)

# Collective commitments create an action item without assigning it to
# the speaker or to any named participant.
COLLECTIVE_COMMITMENT_PATTERN = re.compile(
    r"\b(?:we|the\s+team)\s+(?:need\s+to|must|should|have\s+to|ought\s+to)\s+(.+?)(?:[.!?]|$)",
    re.IGNORECASE,
)


# Explicit decision statements.
DECISION_PATTERNS = [
    re.compile(
        r"\bwe decided to\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bwe decided that\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bwe agreed to\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bwe agreed that\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe decision is to\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe team decided to\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bwe have decided to\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
]


# Explicit agenda statements.
AGENDA_PATTERNS = [
    re.compile(
        r"\btoday we will discuss\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\btoday we are going to discuss\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe agenda is\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe agenda includes\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe purpose of this meeting is\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bthe objective of this meeting is\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\bwe are here to discuss\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
    re.compile(
        r"\btoday's meeting will focus on\s+(.+?)(?:[.!?]|$)",
        re.IGNORECASE,
    ),
]


DEADLINE_PATTERN = re.compile(
    r"\bby\s+(January|February|March|April|May|June|"
    r"July|August|September|October|November|December)"
    r"\s+(\d{1,2})(?:st|nd|rd|th)?"
    r"(?:,?\s+(\d{4}))?\b",
    re.IGNORECASE,
)


DURATION_PATTERN = re.compile(
    r"\b(?:will take|should take|estimated duration is|"
    r"estimated to take|will require|within)\s+"
    r"(\d+(?:\.\d+)?)\s*"
    r"(minutes?|mins?|hours?|hrs?|days?)\b",
    re.IGNORECASE,
)


TOPIC_KEYWORDS = (
    "project", "feature", "upload", "integration",
    "recording", "decision", "task", "review",
    "complete", "prepare", "deadline", "meeting",
    "agreed", "decided", "working", "development",
    "dashboard", "backend", "frontend", "implementation",
    "progress", "system", "design", "testing",
    "deployment", "analysis", "requirement",
)


FILLER_PATTERNS = [
    r"^hello\b",
    r"^welcome\b",
    r"^thank you(?:\s+\w+)?[.!]*$",
    r"^thanks[.!]*$",
    r"^great[.!]*$",
    r"^perfect[.!]*$",
    r"^have a great day[.!]*$",
    r"^that's all from my side[.!]*$",
    r"^that's a good suggestion[.!]*$",
]


def parse_deadline(text: str, year: int):
    """Extract an explicitly stated calendar deadline."""

    match = DEADLINE_PATTERN.search(text)

    if not match:
        return None

    month = MONTHS[match.group(1).lower()]
    day = int(match.group(2))
    parsed_year = int(match.group(3)) if match.group(3) else year

    try:
        return datetime(parsed_year, month, day)
    except ValueError:
        return None


def parse_duration(text: str):
    """Convert an explicitly stated duration into minutes."""

    match = DURATION_PATTERN.search(text)

    if not match:
        return None

    value = float(match.group(1))
    unit = match.group(2).lower()

    if unit.startswith(("hour", "hr")):
        return value * 60

    if unit.startswith("day"):
        return value * 1440

    return value


def clean_leading_filler(text: str):
    """Remove common introductory phrases."""

    text = text.strip()

    patterns = [
        r"^hello everyone,\s*",
        r"^hello[, ]+[^.!?]*[.!?]\s*",
        r"^welcome to today's project meeting[.!?]?\s*",
    ]

    for pattern in patterns:
        text = re.sub(
            pattern,
            "",
            text,
            flags=re.IGNORECASE,
        )

    return text.strip()


def is_filler(text: str):
    normalized = text.lower().strip()

    return (
        not normalized
        or any(
            re.fullmatch(pattern, normalized)
            for pattern in FILLER_PATTERNS
        )
    )


def build_utterances(segments, max_gap: float = 1.5):
    """Merge adjacent fragments from the same speaker."""

    utterances = []

    for segment in segments:
        text = (segment.text or "").strip()

        if not text:
            continue

        speaker_id = segment.speaker_id

        speaker_name = (
            segment.speaker.display_name
            if segment.speaker
            else None
        )

        if utterances:
            previous = utterances[-1]

            gap = segment.start_seconds - previous["end_seconds"]

            same_speaker = speaker_id == previous["speaker_id"]

            sentence_complete = bool(
                re.search(
                    r"[.!?][\"')\]]*$",
                    previous["text"].rstrip(),
                )
            )

            if (
                same_speaker
                and 0 <= gap <= max_gap
                and not sentence_complete
            ):
                previous["text"] += " " + text
                previous["end_seconds"] = segment.end_seconds
                continue

        utterances.append({
            "text": text,
            "speaker_id": speaker_id,
            "speaker": speaker_name,
            "start_seconds": segment.start_seconds,
            "end_seconds": segment.end_seconds,
        })

    return utterances


def extract_agenda(text: str):
    """Extract an explicitly stated meeting agenda."""

    for pattern in AGENDA_PATTERNS:
        match = pattern.search(text)

        if match:
            agenda = match.group(1).strip(" ,.!?")

            if agenda:
                return agenda

    return None


def extract_action(
    text: str,
    speaker_id: int | None,
    start: float,
    end: float,
    year: int,
):
    """Extract action commitments, assignees and metadata."""

    assignee_name = None
    description = None

    # 1. Named first-person commitment:
    # Rahul: I will handle the dashboard UI implementation.
    match = NAMED_FIRST_PERSON_PATTERN.search(text)

    if match:
        assignee_name = match.group(1).strip()
        description = match.group(2).strip()

    # 2. Named commitment with comma:
    # Rahul, I will handle the dashboard UI implementation.
    if not description:
        match = NAMED_COMMA_COMMITMENT_PATTERN.search(text)

        if match:
            assignee_name = match.group(1).strip()
            description = match.group(2).strip()

    # 3. Named third-person commitment:
    # Rahul will complete the testing.
    if not description:
        match = NAMED_COMMITMENT_PATTERN.search(text)

        if match:
            assignee_name = match.group(1).strip()
            description = match.group(2).strip()

    # 4. Collective commitment:
    # Vaibhav: We need to complete the dashboard frontend by November 15.
    # This is a team-level task, so do not infer an individual assignee.
    collective_commitment = False

    if not description:
        match = COLLECTIVE_COMMITMENT_PATTERN.search(text)

        if match:
            description = match.group(1).strip()
            collective_commitment = True

    # 5. Generic first-person commitment:
    # I will prepare the project report.
    if not description:
        match = FIRST_PERSON_COMMITMENT_PATTERN.search(text)

        if match:
            description = match.group(1).strip()

    if not description:
        return None

    deadline = parse_deadline(text, year)
    duration = parse_duration(text)

    description = DEADLINE_PATTERN.sub("", description)
    description = DURATION_PATTERN.sub("", description)
    description = description.strip(" ,.!?")

    if not description:
        return None

    return {
        "task_description": description,
        "assignee_name": assignee_name,
        "assignee_speaker_id": None if collective_commitment else speaker_id,
        "due_date": deadline,
        "estimated_duration_minutes": duration,
        "evidence_text": text,
        "start_seconds": start,
        "end_seconds": end,
    }


def extract_decision(utterance):
    """Extract only explicit decision statements."""

    text = utterance["text"].strip()

    for pattern in DECISION_PATTERNS:
        match = pattern.search(text)

        if match:
            description = (
                match.group(1).strip().rstrip(" .!?")
            )

            if not description:
                return None

            return {
                "title": description[:500],
                "description": description,
                "speaker_id": utterance["speaker_id"],
                "evidence_text": text,
                "start_seconds": utterance["start_seconds"],
                "end_seconds": utterance["end_seconds"],
                "confidence": 0.8,
            }

    return None


def extract_meeting_intelligence(segments, year: int):
    """
    Extract agenda, summary, topics, decisions and action items.

    Existing return fields are preserved for backend compatibility.
    """

    utterances = build_utterances(segments)

    action_items = []
    decisions = []
    key_points = []
    agenda_candidates = []

    for utterance in utterances:

        original_text = utterance["text"].strip()
        text = clean_leading_filler(original_text)

        if is_filler(text):
            continue

        # Agenda extraction.
        agenda = extract_agenda(text)

        if agenda:
            agenda_candidates.append({
                "text": agenda,
                "evidence_text": original_text,
                "speaker": utterance["speaker"],
                "start_seconds": utterance["start_seconds"],
                "end_seconds": utterance["end_seconds"],
            })

        # Key discussion points.
        normalized = text.lower()

        if any(
            keyword in normalized
            for keyword in TOPIC_KEYWORDS
        ):
            key_points.append({
                "text": text,
                "speaker": utterance["speaker"],
                "start_seconds": utterance["start_seconds"],
                "end_seconds": utterance["end_seconds"],
            })

        # Action item extraction.
        action = extract_action(
            text,
            utterance["speaker_id"],
            utterance["start_seconds"],
            utterance["end_seconds"],
            year,
        )

        if action:
            action_items.append(action)

        # Decision extraction.
        decision = extract_decision(utterance)

        if decision:
            decisions.append(decision)

    # Remove duplicate discussion points.
    unique_points = []
    seen = set()

    for point in key_points:
        key = re.sub(
            r"\s+",
            " ",
            point["text"].lower().strip(),
        )

        if key not in seen:
            seen.add(key)
            unique_points.append(point)

    # Remove duplicate actions.
    unique_actions = []
    seen_actions = set()

    for action in action_items:
        key = (
            action["task_description"].lower().strip(),
            (action["assignee_name"] or "").lower().strip(),
            action["due_date"],
        )

        if key not in seen_actions:
            seen_actions.add(key)
            unique_actions.append(action)

    # Remove duplicate decisions.
    unique_decisions = []
    seen_decisions = set()

    for decision in decisions:
        key = decision["description"].lower().strip()

        if key not in seen_decisions:
            seen_decisions.add(key)
            unique_decisions.append(decision)

    # Agenda and summary.
    agenda_text = (
        agenda_candidates[0]["text"]
        if agenda_candidates
        else None
    )

    summary_points = unique_points[:5]

    summary = " ".join(
        point["text"]
        for point in summary_points
    )

    if not summary and agenda_text:
        summary = agenda_text

    return {
        # Original fields retained.
        "summary": summary,
        "key_points": unique_points[:10],
        "decisions": unique_decisions,
        "action_items": unique_actions,

        # Additional intelligence fields.
        "agenda": agenda_text,
        "agenda_evidence": agenda_candidates[:5],
        "topics": unique_points[:10],
    }
