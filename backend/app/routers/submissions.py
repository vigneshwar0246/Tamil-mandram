import os
import secrets
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..config import get_settings
from ..database import get_db
from ..deps import client_ip, get_current_user, rate_limiter
from ..models import Submission, User
from ..schemas import SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/submissions", tags=["submissions"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".pdf", ".mp3", ".wav", ".mp4", ".txt", ".md"}
settings = get_settings()


def _save_upload(upload: UploadFile) -> str | None:
    if not upload or not upload.filename:
        return None
    ext = os.path.splitext(upload.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' is not allowed")
    content = upload.file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_MB:
        raise HTTPException(status_code=400, detail=f"File exceeds the {settings.MAX_UPLOAD_MB} MB limit")
    folder = os.path.join(settings.MEDIA_DIR, datetime.now(timezone.utc).strftime("%Y%m"))
    os.makedirs(folder, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    with open(os.path.join(folder, name), "wb") as fh:
        fh.write(content)
    return f"/media/{os.path.relpath(os.path.join(folder, name), settings.MEDIA_DIR).replace(os.sep, '/')}"


@router.post("", response_model=SubmissionOut, status_code=201)
def create_submission(
    request: Request,
    name: str,
    email: str,
    content_type: str,
    title: str,
    description: str,
    location_name: str = "",
    source_note: str = "",
    permission_confirmed: bool = False,
    files: list[UploadFile] = [],
    db: Session = Depends(get_db),
):
    rate_limiter.check(f"submission:{client_ip(request)}")
    if not permission_confirmed:
        raise HTTPException(status_code=400, detail="You must confirm you have the rights to share this content")
    data = SubmissionCreate(
        name=name, email=email, content_type=content_type, title=title,
        description=description, location_name=location_name,
        source_note=source_note, permission_confirmed=permission_confirmed,
    )
    stored = []
    for f in files[:6]:
        path = _save_upload(f)
        if path:
            stored.append(path)
    sub = Submission(
        public_id=str(uuid.uuid4()),
        name=data.name.strip(),
        email=data.email.lower(),
        content_type=data.content_type,
        title=data.title.strip(),
        description=data.description,
        location_name=data.location_name,
        source_note=data.source_note,
        files=stored,
        permission_confirmed=True,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.get("/mine")
def my_submissions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(select(Submission).where(Submission.user_id == user.id).order_by(Submission.created_at.desc())).all()
    return [SubmissionOut.model_validate(s) for s in rows]
