
from types import SimpleNamespace

from app.services.diarization import match_segments_to_speakers


def test_segment_matches_speaker_with_greatest_overlap():
    segments = [
        SimpleNamespace(start_seconds=0.0, end_seconds=5.0)
    ]

    turns = [
        {
            "start_seconds": 0.0,
            "end_seconds": 2.0,
            "speaker_label": "SPEAKER_00",
        },
        {
            "start_seconds": 2.0,
            "end_seconds": 5.0,
            "speaker_label": "SPEAKER_01",
        },
    ]

    result = match_segments_to_speakers(segments, turns)

    assert result == ["SPEAKER_01"]


def test_segment_without_speaker_overlap_is_unassigned():
    segments = [
        SimpleNamespace(start_seconds=10.0, end_seconds=12.0)
    ]

    turns = [
        {
            "start_seconds": 0.0,
            "end_seconds": 5.0,
            "speaker_label": "SPEAKER_00",
        }
    ]

    result = match_segments_to_speakers(segments, turns)

    assert result == [None]


def test_equal_speaker_overlap_is_unassigned():
    segments = [
        SimpleNamespace(start_seconds=0.0, end_seconds=4.0)
    ]

    turns = [
        {
            "start_seconds": 0.0,
            "end_seconds": 2.0,
            "speaker_label": "SPEAKER_00",
        },
        {
            "start_seconds": 2.0,
            "end_seconds": 4.0,
            "speaker_label": "SPEAKER_01",
        },
    ]

    result = match_segments_to_speakers(segments, turns)

    assert result == [None]
