from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import get_current_user
from ..models import Bookmark, Collection, HeritageItem, User
from ..schemas import BookmarkCreate, CollectionCreate, CollectionOut, HeritageItemOut

router = APIRouter(prefix="/me", tags=["bookmarks"])


@router.get("/bookmarks")
def my_bookmarks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(Bookmark)
        .options(joinedload(Bookmark.item).joinedload(HeritageItem.category))
        .where(Bookmark.user_id == user.id)
        .order_by(Bookmark.created_at.desc())
    ).all()
    return [HeritageItemOut.model_validate(b.item) for b in rows if b.item]


@router.post("/bookmarks", status_code=201)
def add_bookmark(data: BookmarkCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.scalar(select(HeritageItem).where(HeritageItem.slug == data.slug))
    if not item:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    exists = db.scalar(select(Bookmark).where(Bookmark.user_id == user.id, Bookmark.item_id == item.id))
    if exists:
        return {"status": "already_saved"}
    db.add(Bookmark(user_id=user.id, item_id=item.id))
    db.commit()
    return {"status": "saved"}


@router.delete("/bookmarks/{slug}", status_code=204)
def remove_bookmark(slug: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.scalar(select(HeritageItem).where(HeritageItem.slug == slug))
    if not item:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    bm = db.scalar(select(Bookmark).where(Bookmark.user_id == user.id, Bookmark.item_id == item.id))
    if bm:
        db.delete(bm)
        db.commit()
    return None


@router.get("/collections", response_model=list[CollectionOut])
def my_collections(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.scalars(select(Collection).where(Collection.user_id == user.id).order_by(Collection.created_at.desc())).all()


@router.post("/collections", response_model=CollectionOut, status_code=201)
def create_collection(data: CollectionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    col = Collection(user_id=user.id, name=data.name, description=data.description, item_slugs=[])
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@router.post("/collections/{collection_id}/items", response_model=CollectionOut)
def collection_add(
    collection_id: int,
    data: BookmarkCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    col = db.scalar(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id))
    if not col:
        raise HTTPException(status_code=404, detail="Collection not found")
    item = db.scalar(select(HeritageItem).where(HeritageItem.slug == data.slug))
    if not item:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    slugs = list(col.item_slugs or [])
    if data.slug not in slugs:
        slugs.append(data.slug)
    col.item_slugs = slugs
    db.commit()
    db.refresh(col)
    return col
