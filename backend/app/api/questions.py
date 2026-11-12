
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.authorization import get_owned_project, get_owned_meeting
from app.models import User
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
    current_user: User = Depends(get_current_user),
):
    # Verify that the authenticated user owns this project.
    get_owned_project(
        project_id,
        db,
        current_user,
    )

    # Verify that the selected meeting belongs to the user's project.
    if payload.meeting_id is not None:
        meeting = get_owned_meeting(
            payload.meeting_id,
            db,
            current_user,
        )

        if meeting.project_id != project_id:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=404,
                detail="Selected meeting was not found in this project.",
            )

    # Preserve the existing question-answering service.
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
