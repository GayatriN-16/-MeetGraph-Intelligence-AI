from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.core.authorization import get_owned_project
from app.models import User, Project, Meeting
from app.schemas.project import (
    UserCreate,
    UserResponse,
    ProjectCreate,
    ProjectResponse,
)

router = APIRouter(tags=["Projects and Development Setup"])


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_development_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    email = payload.email.strip().lower()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    user = User(
        name=payload.name.strip(),
        email=email,
        role="member",
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    return user


@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = Project(
        name=payload.name.strip(),
        description=(
            payload.description.strip()
            if payload.description
            else None
        ),
        owner_id=current_user.id,
    )

    try:
        db.add(project)
        db.commit()
        db.refresh(project)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create workspace.",
        )

    return project


@router.get(
    "/projects",
    response_model=list[ProjectResponse],
)
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.scalars(
        select(Project)
        .where(Project.owner_id == current_user.id)
        .order_by(Project.created_at.desc())
    ).all()


@router.get("/projects/{project_id}/meetings")
def get_project_meetings(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = get_owned_project(
        project_id,
        db,
        current_user,
    )

    meetings = db.scalars(
        select(Meeting)
        .where(Meeting.project_id == project_id)
        .order_by(Meeting.created_at.asc())
    ).all()

    return {
        "project_id": project.id,
        "project_name": project.name,
        "total_meetings": len(meetings),
        "meetings": [
            {
                "meeting_id": meeting.id,
                "title": meeting.title,
                "original_filename": meeting.original_filename,
                "status": meeting.status,
                "duration_seconds": meeting.duration_seconds,
                "meeting_date": (
                    meeting.meeting_date.isoformat()
                    if meeting.meeting_date else None
                ),
                "created_at": (
                    meeting.created_at.isoformat()
                    if meeting.created_at else None
                ),
            }
            for meeting in meetings
        ],
    }