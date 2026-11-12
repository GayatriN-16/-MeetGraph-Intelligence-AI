from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import User, Project, Meeting


def get_owned_project(
    project_id: int,
    db: Session,
    current_user: User,
) -> Project:
    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.owner_id == current_user.id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    return project


def get_owned_meeting(
    meeting_id: int,
    db: Session,
    current_user: User,
) -> Meeting:
    meeting = db.scalar(
        select(Meeting)
        .join(Project, Meeting.project_id == Project.id)
        .where(
            Meeting.id == meeting_id,
            Project.owner_id == current_user.id,
        )
    )

    if meeting is None:
        raise HTTPException(
            status_code=404,
            detail="Meeting not found.",
        )

    return meeting