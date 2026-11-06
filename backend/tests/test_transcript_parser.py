
import pytest

from app.services.transcript_parser import parse_transcript_content


def test_parse_plain_text_transcript():
    content = (
        b"Welcome to the meeting.\n\n"
        b"We discussed the project timeline."
    )

    result = parse_transcript_content("meeting.txt", content)

    assert len(result) == 2
    assert result[0]["text"] == "Welcome to the meeting."
    assert result[1]["text"] == "We discussed the project timeline."
    assert result[0]["start_seconds"] == 0.0
    assert result[0]["end_seconds"] == 0.0


def test_parse_srt_transcript():
    content = (
        b"1\n"
        b"00:00:01,200 --> 00:00:03,400\n"
        b"Welcome to the meeting.\n\n"
        b"2\n"
        b"00:00:04,000 --> 00:00:06,500\n"
        b"Let's discuss the project."
    )

    result = parse_transcript_content("meeting.srt", content)

    assert len(result) == 2
    assert result[0]["start_seconds"] == pytest.approx(1.2)
    assert result[0]["end_seconds"] == pytest.approx(3.4)
    assert result[1]["text"] == "Let's discuss the project."


def test_parse_vtt_transcript():
    content = (
        b"WEBVTT\n\n"
        b"00:00:02.000 --> 00:00:04.500\n"
        b"Welcome everyone.\n\n"
        b"00:00:05.000 --> 00:00:07.000\n"
        b"Let's begin."
    )

    result = parse_transcript_content("meeting.vtt", content)

    assert len(result) == 2
    assert result[0]["start_seconds"] == pytest.approx(2.0)
    assert result[0]["end_seconds"] == pytest.approx(4.5)
    assert result[1]["text"] == "Let's begin."


def test_parse_vtt_with_cue_identifier():
    content = (
        b"WEBVTT\n\n"
        b"intro\n"
        b"00:00:01.000 --> 00:00:03.000\n"
        b"Meeting started."
    )

    result = parse_transcript_content("meeting.vtt", content)

    assert len(result) == 1
    assert result[0]["text"] == "Meeting started."


def test_reject_unsupported_extension():
    with pytest.raises(ValueError):
        parse_transcript_content("meeting.pdf", b"Some content")


def test_reject_empty_transcript():
    with pytest.raises(ValueError):
        parse_transcript_content("meeting.txt", b"   \n  ")


def test_reject_invalid_timestamp():
    content = (
        b"1\n"
        b"invalid --> timestamp\n"
        b"Some transcript text."
    )

    with pytest.raises(ValueError):
        parse_transcript_content("meeting.srt", content)


def test_reject_invalid_utf8():
    with pytest.raises(ValueError):
        parse_transcript_content("meeting.txt", b"\xff\xfe\xfa")
