from types import SimpleNamespace

from app.services.question_answering import (
    calculate_text_similarity,
    compare_meeting_sources,
    detect_comparison_mode,
    is_comparison_question,
)


def make_meetings():
    return [
        SimpleNamespace(id=1, title="Planning Meeting"),
        SimpleNamespace(id=2, title="Development Meeting"),
        SimpleNamespace(id=3, title="Review Meeting"),
    ]


def make_source(meeting_id, title, text, start=0.0):
    return {
        "meeting_id": meeting_id,
        "meeting_title": title,
        "source_type": "transcript",
        "evidence_text": text,
        "speaker": "Speaker 1",
        "start_seconds": start,
        "end_seconds": start + 10,
    }


def make_sources():
    return [
        make_source(1, "Planning Meeting",
                    "The team discussed backend API integration and testing.", 10),
        make_source(1, "Planning Meeting",
                    "The team reviewed the security audit requirements.", 30),
        make_source(2, "Development Meeting",
                    "The team discussed backend API integration and testing.", 15),
        make_source(2, "Development Meeting",
                    "The team planned frontend dashboard development.", 40),
    ]


def test_text_similarity_detects_matching_discussion():
    assert calculate_text_similarity(
        "The team discussed backend API integration.",
        "The team reviewed backend API integration.",
    ) >= 0.25


def test_text_similarity_rejects_unrelated_discussion():
    assert calculate_text_similarity(
        "The team discussed backend integration.",
        "The finance department reviewed quarterly budgets.",
    ) == 0.0


def test_detect_comparison_mode():
    assert detect_comparison_mode(
        "What topics appeared in both meetings 1 and 2?"
    ) == "shared"
    assert detect_comparison_mode(
        "What was discussed in meeting 1 but not meeting 2?"
    ) == "first_only"
    assert detect_comparison_mode(
        "What new topics appeared in meeting 2 compared with meeting 1?"
    ) == "second_only"
    assert detect_comparison_mode(
        "What changed between meeting 1 and meeting 2?"
    ) == "all"


def test_only_explicit_comparison_questions_are_intercepted():
    assert is_comparison_question(
        "What changed between meeting 1 and meeting 2?"
    )
    assert not is_comparison_question(
        "What tasks were assigned in meeting 1 and meeting 2?"
    )


def test_comparison_finds_shared_and_unmatched_discussion():
    result = compare_meeting_sources(
        "What changed between meeting 1 and meeting 2?",
        make_meetings(),
        make_sources(),
    )
    assert "backend API integration" in result["answer"]
    assert "security audit" in result["answer"]
    assert "frontend dashboard" in result["answer"]
    assert {item["meeting_id"] for item in result["sources"]} == {1, 2}


def test_comparison_returns_only_first_meeting_unmatched_evidence():
    result = compare_meeting_sources(
        "What was discussed in meeting 1 but not meeting 2?",
        make_meetings(),
        make_sources(),
    )
    assert "security audit" in result["answer"]
    assert "frontend dashboard" not in result["answer"]
    assert all(item["meeting_id"] == 1 for item in result["sources"])


def test_comparison_handles_invalid_meeting_number():
    result = compare_meeting_sources(
        "What changed between meeting 1 and meeting 5?",
        make_meetings(),
        make_sources(),
    )
    assert "Meeting 5 was not found" in result["answer"]
    assert result["sources"] == []


def test_comparison_rejects_same_meeting_twice():
    result = compare_meeting_sources(
        "What changed between meeting 1 and meeting 1?",
        make_meetings(),
        make_sources(),
    )
    assert "two different meetings" in result["answer"]
    assert result["sources"] == []


def test_comparison_requires_transcripts_from_both_meetings():
    result = compare_meeting_sources(
        "What changed between meeting 1 and meeting 2?",
        make_meetings(),
        [
            make_source(
                1,
                "Planning Meeting",
                "The team discussed backend integration.",
            )
        ],
    )
    assert "Both meetings need transcript content" in result["answer"]
    assert result["sources"] == []
