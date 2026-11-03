from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Project, Meeting
from app.schemas.question import QuestionRequest, QuestionResponse
from app.services.question_answering import answer_project_question


router = APIRouter(tags=["AI Question Answering"])


@router.post(
    "/projects/{project_id}/ask",
    response_model=QuestionResponse,
)
def ask_project_question(
    project_id: int,
    payload: QuestionRequest,
    db: Session = Depends(get_db),
):
    # Verify that the project exists.
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # Verify that the selected meeting belongs to this project.
    if payload.meeting_id is not None:
        meeting = db.scalar(
            select(Meeting).where(
                Meeting.id == payload.meeting_id,
                Meeting.project_id == project_id,
            )
        )

        if not meeting:
            raise HTTPException(
                status_code=404,
                detail="Selected meeting was not found in this project.",
            )

    # Pass the meeting filter to the question-answering service.
    result = answer_project_question(
        db=db,
        project_id=project_id,
        question=payload.question,
        meeting_id=payload.meeting_id,
    )

    return {
        "project_id": project_id,
        "question": payload.question,
        "answer": result["answer"],
        "answer_method": "local_evidence_retrieval",
        "sources": result["sources"],
    }