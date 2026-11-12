
from app.core.database import Base
from app.models import (
    User,
    Project,
    Meeting,
    Speaker,
    TranscriptSegment,
    Decision,
    ActionItem,
)


def test_all_expected_tables_are_registered():
    expected_tables = {
        "users",
        "projects",
        "meetings",
        "speakers",
        "transcript_segments",
        "decisions",
        "action_items",
    }

    assert expected_tables.issubset(set(Base.metadata.tables.keys()))


def test_meeting_has_project_relationship():
    assert "project_id" in Meeting.__table__.columns
    assert Meeting.__table__.columns["project_id"].nullable is False


def test_decisions_and_tasks_reference_meetings():
    assert "meeting_id" in Decision.__table__.columns
    assert "meeting_id" in ActionItem.__table__.columns
