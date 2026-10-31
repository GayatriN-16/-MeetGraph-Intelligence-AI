
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, Project
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
):
    existing_user = db.scalar(
        select(User).where(User.email == payload.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="A user with this email already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        role="admin",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
):
    owner = db.get(User, payload.owner_id)

    if not owner or not owner.is_active:
        raise HTTPException(
            status_code=404,
            detail="Active project owner was not found.",
        )

    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=payload.owner_id,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


@router.get("/projects", response_model=list[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.scalars(
        select(Project).order_by(Project.created_at.desc())
    ).all()
