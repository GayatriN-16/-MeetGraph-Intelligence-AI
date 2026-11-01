
from pydantic import BaseModel, Field


class QuestionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    meeting_id: int | None = None


class QuestionSource(BaseModel):
    meeting_id: int
    meeting_title: str
    source_type: str
    evidence_text: str
    speaker: str | None = None
    start_seconds: float | None = None
    end_seconds: float | None = None


class QuestionResponse(BaseModel):
    project_id: int
    question: str
    answer: str
    answer_method: str
    sources: list[QuestionSource]
