
import re
from datetime import datetime

MONTHS = {
    name.lower(): index
    for index, name in enumerate([
        "", "January", "February", "March", "April",
        "May", "June", "July", "August", "September",
        "October", "November", "December"
    ])
    if name
}

ACTION_PATTERN = re.compile(
    r"\bI will\s+(.+?)(?:[.!?]|$)",
    re.IGNORECASE,
)

DECISION_PATTERN = re.compile(
    r"\b(?:we decided to|we agreed to|agreed that|"
    r"the decision is to)\s+(.+?)(?:[.!?]|$)",
    re.IGNORECASE,
)

DEADLINE_PATTERN = re.compile(
    r"\bby\s+(January|February|March|April|May|June|"
    r"July|August|September|October|November|December)"
    r"\s+(\d{1,2})(?:st|nd|rd|th)?\b",
    re.IGNORECASE,
)

DURATION_PATTERN = re.compile(
    r"\b(?:will take|should take|estimated duration is)\s+"
    r"(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?)\b",
    re.IGNORECASE,
)

TOPIC_KEYWORDS = (
    "project", "feature", "upload", "integration",
    "recording", "decision", "task", "review",
    "complete", "prepare", "deadline", "meeting",
    "agreed", "decided", "working",
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
    match = DEADLINE_PATTERN.search(text)

    if not match:
        return None

    month = MONTHS[match.group(1).lower()]
    day = int(match.group(2))

    try:
        return datetime(year, month, day)
    except ValueError:
        return None


def parse_duration(text: str):
    match = DURATION_PATTERN.search(text)

    if not match:
        return None

    value = float(match.group(1))
    unit = match.group(2).lower()

    if unit.startswith(("hour", "hr")):
        return value * 60

    return value


def clean_leading_filler(text: str):
    text = text.strip()

    patterns = [
        r"^hello everyone,\s*",
        r"^hello[, ]+[^.!?]*[.!?]\s*",
        r"^welcome to today's project meeting[.!?]?\s*",
    ]

    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.IGNORECASE)

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
    """
    Merge fragments only when the previous segment does not
    end a sentence. Preserve sentence boundaries and speakers.
    """
    utterances = []

    for segment in segments:
        text = (segment.text or "").strip()

        if not text:
            continue

        speaker_id = segment.speaker_id

        speaker_name = (
            segment.speaker.display_name
            if segment.speaker else None
        )

        if utterances:
            previous = utterances[-1]

            gap = segment.start_seconds - previous["end_seconds"]

            same_speaker = (
                speaker_id == previous["speaker_id"]
            )

            previous_text = previous["text"].rstrip()

            sentence_complete = bool(
                re.search(r"[.!?][\"')\]]*$", previous_text)
            )

            if (
                same_speaker
                and 0 <= gap <= max_gap
                and not sentence_complete
            ):
                previous["text"] = (
                    previous_text + " " + text
                )
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


def extract_meeting_intelligence(segments, year: int):
    utterances = build_utterances(segments)

    action_items = []
    decisions = []
    key_points = []

    for utterance in utterances:
        original_text = utterance["text"].strip()
        text = clean_leading_filler(original_text)
        normalized = text.lower()

        if is_filler(text):
            continue

        # Keep relevant discussion sentences.
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

        # Extract explicit first-person commitments.
        action_match = ACTION_PATTERN.search(text)

        if action_match:
            description = (
                action_match.group(1).strip().rstrip(" .!?")
            )

            deadline = parse_deadline(text, year)

            description = DEADLINE_PATTERN.sub(
                "", description
            ).strip().rstrip(" ,")

            if description:
                action_items.append({
                    "task_description": description,
                    "assignee_speaker_id": utterance["speaker_id"],
                    "due_date": deadline,
                    "estimated_duration_minutes": parse_duration(text),
                    "evidence_text": original_text,
                    "start_seconds": utterance["start_seconds"],
                    "end_seconds": utterance["end_seconds"],
                })

        # Only explicit decisions and agreements.
        decision_match = DECISION_PATTERN.search(text)

        if decision_match:
            description = (
                decision_match.group(1).strip().rstrip(" .!?")
            )

            decisions.append({
                "title": description[:500],
                "description": description,
                "speaker_id": utterance["speaker_id"],
                "evidence_text": original_text,
                "start_seconds": utterance["start_seconds"],
                "end_seconds": utterance["end_seconds"],
                "confidence": 0.8,
            })

    # Remove duplicate key points while preserving order.
    unique_points = []
    seen = set()

    for point in key_points:
        key = point["text"].lower()

        if key not in seen:
            seen.add(key)
            unique_points.append(point)

    summary = " ".join(
        point["text"] for point in unique_points[:5]
    )

    return {
        "summary": summary,
        "key_points": unique_points[:10],
        "decisions": decisions,
        "action_items": action_items,
    }
