import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..config import get_settings
from ..database import get_db
from ..deps import require_admin
from ..models import ArchiveItem, Category, HeritageItem, Location, Story, Submission, User
from ..schemas import AdminOverview, SubmissionOut, SubmissionReview, UserOut

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/overview", response_model=AdminOverview)
def overview(db: Session = Depends(get_db)):
    heritage_records = db.scalar(select(func.count()).select_from(HeritageItem)) or 0
    pending = db.scalar(select(func.count()).select_from(Submission).where(Submission.status == "pending")) or 0
    stories = db.scalar(select(func.count()).select_from(Story).where(Story.published == True)) or 0  # noqa: E712
    users = db.scalar(select(func.count()).select_from(User)) or 0
    media_files = 0
    settings = get_settings()
    for _, files in os.walk(settings.MEDIA_DIR):
        media_files += len(files)
    most_viewed = db.scalars(
        select(HeritageItem).order_by(HeritageItem.view_count.desc()).limit(6)
    ).all()
    by_category = db.execute(
        select(Category.name_en, Category.color, func.count(HeritageItem.id))
        .join(HeritageItem, HeritageItem.category_id == Category.id)
        .group_by(Category.id)
        .order_by(func.count(HeritageItem.id).desc())
    ).all()
    by_era = db.execute(
        select(HeritageItem.era, func.count()).group_by(HeritageItem.era)
    ).all()
    submissions_by_status = db.execute(
        select(Submission.status, func.count()).group_by(Submission.status)
    ).all()
    recent = db.scalars(select(Submission).order_by(Submission.created_at.desc()).limit(5)).all()
    return AdminOverview(
        heritage_records=heritage_records,
        pending_submissions=pending,
        published_stories=stories,
        users=users,
        media_files=media_files,
        most_viewed=[{"slug": s.slug, "title": s.title, "view_count": s.view_count} for s in most_viewed],
        by_category=[{"name": n, "color": c, "count": n2} for n, c, n2 in by_category],
        by_era=[{"era": e, "count": n} for e, n in by_era],
        submissions_by_status=[{"status": s, "count": n} for s, n in submissions_by_status],
        recent_submissions=[SubmissionOut.model_validate(s) for s in recent],
    )


@router.get("/submissions", response_model=list[SubmissionOut])
def all_submissions(status: str = "", db: Session = Depends(get_db)):
    query = select(Submission).order_by(Submission.created_at.desc())
    if status:
        query = query.where(Submission.status == status)
    return db.scalars(query).all()


@router.post("/submissions/{submission_id}/review", response_model=SubmissionOut)
def review_submission(submission_id: int, data: SubmissionReview, db: Session = Depends(get_db), admin=Depends(require_admin)):
    sub = db.get(Submission, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    if data.status not in ("approved", "rejected", "pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    sub.status = data.status
    sub.review_note = data.review_note
    sub.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/users", response_model=list[UserOut])
def all_users(db: Session = Depends(get_db)):
    return db.scalars(select(User).order_by(User.created_at)).all()


@router.put("/users/{user_id}/role", response_model=UserOut)
def set_role(user_id: int, role: str = Query(..., pattern="^(user|admin)$"), db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role")
    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/active", response_model=UserOut)
def set_active(user_id: int, active: bool, db: Session = Depends(get_db), admin=Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    user.is_active = active
    db.commit()
    db.refresh(user)
    return user


@router.get("/records")
def all_records(
    q: str = "",
    status: str = "",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    from ..schemas import HeritageItemOut

    query = select(HeritageItem).options(joinedload(HeritageItem.category))
    if q:
        like = f"%{q.strip()}%"
        query = query.where((HeritageItem.title.ilike(like)) | (HeritageItem.slug.ilike(like)))
    if status:
        query = query.where(HeritageItem.status == status)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    import math

    rows = db.scalars(query.order_by(HeritageItem.updated_at.desc()).limit(page_size).offset((page - 1) * page_size)).unique().all()
    return {
        "total": total,
        "page": page,
        "pages": math.ceil(total / page_size) if total else 0,
        "items": [HeritageItemOut.model_validate(r) for r in rows],
    }
