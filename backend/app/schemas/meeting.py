
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MeetingResponse(BaseModel):
    id: int
    project_id: int
    title: str
    original_filename: str
    mime_type: str | None
    file_size_bytes: int | None
    duration_seconds: float | None
    meeting_date: datetime | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
