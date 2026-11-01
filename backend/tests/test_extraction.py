
from types import SimpleNamespace
from datetime import datetime

from app.services.extraction import (
    extract_meeting_intelligence,
    parse_deadline,
    parse_duration,
    build_utterances,
)


def make_segment(
    text,
    start,
    end,
    speaker_id=1,
    speaker_name="Speaker 1",
):
    speaker = SimpleNamespace(display_name=speaker_name)

    return SimpleNamespace(
        text=text,
        start_seconds=start,
        end_seconds=end,
        speaker_id=speaker_id,
        speaker=speaker,
    )


def test_extract_action_item_and_deadline():
    segments = [
        make_segment(
            "I will complete the back-end integration by November 6.",
            10,
            15,
            speaker_id=3,
            speaker_name="Speaker 2",
        )
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert len(result["action_items"]) == 1

    action = result["action_items"][0]

    assert action["task_description"] == (
        "complete the back-end integration"
    )
    assert action["assignee_speaker_id"] == 3
    assert action["due_date"] == datetime(2026, 11, 6)
    assert action["estimated_duration_minutes"] is None
    assert action["evidence_text"] == segments[0].text


def test_extract_second_action_item():
    segments = [
        make_segment(
            "I will prepare three sample meeting recordings by November 4.",
            20,
            25,
            speaker_id=2,
        )
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert len(result["action_items"]) == 1
    assert result["action_items"][0]["due_date"] == datetime(2026, 11, 4)
    assert result["action_items"][0]["assignee_speaker_id"] == 2


def test_duration_conversion():
    segments = [
        make_segment(
            "I will finish the report. It will take 2 hours.",
            10,
            15,
        )
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert result["action_items"][0]["estimated_duration_minutes"] == 120


def test_combine_incomplete_transcript_segments():
    segments = [
        make_segment("We are currently working on", 0, 2),
        make_segment("back-end integration.", 2, 4),
    ]

    utterances = build_utterances(segments)

    assert len(utterances) == 1
    assert utterances[0]["text"] == (
        "We are currently working on back-end integration."
    )


def test_preserve_sentence_boundaries():
    segments = [
        make_segment("We are discussing the project.", 0, 2),
        make_segment("I will prepare the report.", 2, 4),
    ]

    utterances = build_utterances(segments)

    assert len(utterances) == 2


def test_greetings_do_not_remove_discussion():
    segments = [
        make_segment(
            "Hello everyone, welcome to today's project meeting.",
            0,
            2,
        ),
        make_segment(
            "Today we will discuss the progress of our project.",
            2,
            5,
        ),
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert len(result["key_points"]) == 1
    assert "discuss the progress" in result["summary"]


def test_suggestion_is_not_a_decision():
    segments = [
        make_segment(
            "I suggest adding a multiple recording upload feature.",
            0,
            3,
        )
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert result["decisions"] == []


def test_explicit_decision_is_extracted():
    segments = [
        make_segment(
            "We decided to use PostgreSQL for storage.",
            0,
            3,
        )
    ]

    result = extract_meeting_intelligence(segments, 2026)

    assert len(result["decisions"]) == 1
    assert "PostgreSQL" in result["decisions"][0]["description"]


def test_invalid_deadline_returns_none():
    assert parse_deadline("Complete by November 45", 2026) is None


def test_duration_parser():
    assert parse_duration("This will take 30 minutes.") == 30
    assert parse_duration("This will take 2 hours.") == 120
    assert parse_duration("No duration stated.") is None
