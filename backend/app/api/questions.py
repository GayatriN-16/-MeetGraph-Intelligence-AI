
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Project
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
    project = db.get(Project, project_id)

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    result = answer_project_question(
        db=db,
        project_id=project_id,
        question=payload.question,
    )

    return {
        "project_id": project_id,
        "question": payload.question,
        "answer": result["answer"],
        "answer_method": "local_evidence_retrieval",
        "sources": result["sources"],
    }
