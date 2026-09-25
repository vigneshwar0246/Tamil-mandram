from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import ArchiveItem, Category, HeritageItem, HistoricalPeriod, Story, Submission, User
from ..schemas import (
    ArchiveOut,
    MapPoint,
    PublicStats,
    StoryDetail,
    StoryOut,
)

router = APIRouter(tags=["content"])


# ---------------------------------------------------------------- stories
@router.get("/stories")
def list_stories(featured: bool | None = None, db: Session = Depends(get_db)):
    query = select(Story).options(joinedload(Story.period)).where(Story.published == True).order_by(Story.created_at.desc())  # noqa: E712
    if featured is not None:
        query = query.where(Story.featured == featured)
    rows = db.scalars(query).all()
    return [StoryOut.model_validate(s) for s in rows]


@router.get("/stories/{slug}", response_model=StoryDetail)
def get_story(slug: str, db: Session = Depends(get_db)):
    row = db.scalar(select(Story).options(joinedload(Story.period)).where(Story.slug == slug))
    if not row or not row.published:
        raise HTTPException(status_code=404, detail="Story not found")
    return row


# ---------------------------------------------------------------- archive
@router.get("/archive")
def list_archive(
    q: str = "",
    kind: str = "",
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    query = select(ArchiveItem)
    if q:
        like = f"%{q.strip()}%"
        query = query.where(
            (ArchiveItem.title.ilike(like))
            | (ArchiveItem.description.ilike(like))
            | (ArchiveItem.location_name.ilike(like))
        )
    if kind:
        query = query.where(ArchiveItem.kind == kind)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    import math

    rows = db.scalars(query.order_by(ArchiveItem.created_at.desc()).limit(page_size).offset((page - 1) * page_size)).all()
    kinds = db.execute(select(ArchiveItem.kind, func.count()).group_by(ArchiveItem.kind)).all()
    return {
        "total": total,
        "page": page,
        "pages": math.ceil(total / page_size) if total else 0,
        "items": [ArchiveOut.model_validate(r) for r in rows],
        "kinds": [{"kind": k, "count": n} for k, n in kinds],
    }


@router.get("/archive/{slug}", response_model=ArchiveOut)
def get_archive_item(slug: str, db: Session = Depends(get_db)):
    row = db.scalar(select(ArchiveItem).where(ArchiveItem.slug == slug))
    if not row:
        raise HTTPException(status_code=404, detail="Archive item not found")
    return row


# ---------------------------------------------------------------- timeline
@router.get("/timeline")
def timeline(db: Session = Depends(get_db)):
    periods = db.scalars(select(HistoricalPeriod).order_by(HistoricalPeriod.start_year)).all()
    counts = dict(
        db.execute(
            select(HeritageItem.period_id, func.count())
            .where(HeritageItem.status == "published")
            .group_by(HeritageItem.period_id)
        ).all()
    )
    story_periods = dict(
        db.execute(select(Story.period_id, func.count()).group_by(Story.period_id)).all()
    )
    out = []
    for p in periods:
        d = {
            "slug": p.slug,
            "name": p.name,
            "name_ta": p.name_ta,
            "start_year": p.start_year,
            "end_year": p.end_year,
            "era": p.era,
            "summary": p.summary,
            "highlights": p.highlights,
            "item_count": counts.get(p.id, 0),
            "story_count": story_periods.get(p.id, 0),
        }
        out.append(d)
    return out


# ---------------------------------------------------------------- map
@router.get("/map/places")
def map_places(category: str = "", era: str = "", db: Session = Depends(get_db)):
    query = (
        select(HeritageItem)
        .options(joinedload(HeritageItem.category))
        .where(HeritageItem.status == "published")
        .where(HeritageItem.lat.is_not(None))
        .where(HeritageItem.lng.is_not(None))
    )
    if category:
        query = query.join(Category, HeritageItem.category_id == Category.id).where(Category.slug == category)
    if era:
        query = query.where(HeritageItem.era == era)
    rows = db.scalars(query).unique().all()
    return [
        MapPoint(
            slug=r.slug,
            title=r.title,
            item_type=r.item_type,
            era=r.era,
            lat=r.lat,
            lng=r.lng,
            image_url=r.image_url,
            category=r.category.slug if r.category else "other",
            category_color=r.category.color if r.category else "#7a1f2b",
        )
        for r in rows
    ]


# ---------------------------------------------------------------- stats
@router.get("/stats", response_model=PublicStats)
def public_stats(db: Session = Depends(get_db)):
    heritage_records = db.scalar(select(func.count()).select_from(HeritageItem).where(HeritageItem.status == "published")) or 0
    stories = db.scalar(select(func.count()).select_from(Story).where(Story.published == True)) or 0  # noqa: E712
    archive_items = db.scalar(select(func.count()).select_from(ArchiveItem)) or 0
    categories = db.scalar(select(func.count()).select_from(Category)) or 0
    locations = db.scalar(select(func.count()).select_from(HistoricalPeriod)) or 0
    most_viewed = db.scalars(
        select(HeritageItem)
        .where(HeritageItem.status == "published")
        .order_by(HeritageItem.view_count.desc())
        .limit(6)
    ).all()
    by_category = db.execute(
        select(Category.name_en, Category.slug, Category.color, func.count(HeritageItem.id))
        .join(HeritageItem, HeritageItem.category_id == Category.id)
        .where(HeritageItem.status == "published")
        .group_by(Category.id)
        .order_by(func.count(HeritageItem.id).desc())
    ).all()
    return PublicStats(
        heritage_records=heritage_records,
        stories=stories,
        archive_items=archive_items,
        categories=categories,
        locations=locations,
        most_viewed=[HeritageItem_stub(s) for s in most_viewed],
        by_category=[{"name": n, "slug": s, "color": c, "count": n2} for n, s, c, n2 in by_category],
    )


def HeritageItem_stub(item) -> dict:
    return {"slug": item.slug, "title": item.title, "view_count": item.view_count, "image_url": item.image_url}
