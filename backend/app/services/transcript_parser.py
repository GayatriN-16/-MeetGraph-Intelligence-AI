
import html
import re
from pathlib import Path


TIMESTAMP_PATTERN = re.compile(
    r"(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{1,3})"
)

MAX_SEGMENTS = 10000


def _timestamp_to_seconds(value: str) -> float:
    match = TIMESTAMP_PATTERN.fullmatch(value.strip())

    if not match:
        raise ValueError(f"Invalid transcript timestamp: {value}")

    hours = int(match.group(1) or 0)
    minutes = int(match.group(2))
    seconds = int(match.group(3))
    milliseconds = int(match.group(4).ljust(3, "0"))

    if minutes >= 60 or seconds >= 60:
        raise ValueError(f"Invalid transcript timestamp: {value}")

    return (
        hours * 3600
        + minutes * 60
        + seconds
        + milliseconds / 1000
    )


def _clean_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", "", value)
    value = html.unescape(value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def _parse_plain_text(content: str) -> list[dict]:
    paragraphs = re.split(r"\n\s*\n", content)

    segments = []

    for paragraph in paragraphs:
        text = _clean_text(paragraph)

        if not text:
            continue

        segments.append(
            {
                "start_seconds": 0.0,
                "end_seconds": 0.0,
                "text": text,
                "confidence": None,
            }
        )

    return segments


def _parse_timestamped_text(content: str) -> list[dict]:
    segments = []

    blocks = re.split(r"\n\s*\n", content)

    for block in blocks:
        lines = [
            line.strip()
            for line in block.splitlines()
            if line.strip()
        ]

        if not lines:
            continue

        if lines[0].upper().startswith(
            ("WEBVTT", "NOTE", "STYLE", "REGION")
        ):
            continue

        timestamp_index = None

        for index, line in enumerate(lines):
            if "-->" in line:
                timestamp_index = index
                break

        if timestamp_index is None:
            continue

        timestamp_line = lines[timestamp_index]
        start_value, end_value = timestamp_line.split("-->", 1)

        start_value = start_value.strip().split()[0]
        end_value = end_value.strip().split()[0]

        start_seconds = _timestamp_to_seconds(start_value)
        end_seconds = _timestamp_to_seconds(end_value)

        if end_seconds < start_seconds:
            raise ValueError(
                "Transcript cue end time cannot be earlier than its start time."
            )

        text = _clean_text(
            " ".join(lines[timestamp_index + 1:])
        )

        if not text:
            continue

        segments.append(
            {
                "start_seconds": start_seconds,
                "end_seconds": end_seconds,
                "text": text,
                "confidence": None,
            }
        )

        if len(segments) > MAX_SEGMENTS:
            raise ValueError(
                f"Transcript contains more than {MAX_SEGMENTS} cues."
            )

    return segments


def parse_transcript_content(
    filename: str,
    content: bytes,
) -> list[dict]:
    extension = Path(filename).suffix.lower()

    if extension not in {".txt", ".srt", ".vtt"}:
        raise ValueError("Only TXT, SRT, and VTT transcripts are supported.")

    try:
        decoded_content = content.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise ValueError(
            "Transcript must use UTF-8 text encoding."
        ) from exc

    decoded_content = decoded_content.replace("\r\n", "\n").replace("\r", "\n")

    if not decoded_content.strip():
        raise ValueError("Transcript does not contain any text.")

    if extension == ".txt":
        segments = _parse_plain_text(decoded_content)
    else:
        segments = _parse_timestamped_text(decoded_content)

    if not segments:
        raise ValueError(
            "No readable transcript segments were found. "
            "Check the file content and timestamp format."
        )

    if len(segments) > MAX_SEGMENTS:
        raise ValueError(
            f"Transcript contains more than {MAX_SEGMENTS} segments."
        )

    return segments
