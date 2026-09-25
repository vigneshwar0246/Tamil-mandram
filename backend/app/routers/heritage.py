import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Text, func, or_, select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import get_optional_user, require_admin
from ..models import (
    Bookmark,
    Category,
    HeritageItem,
    HistoricalPeriod,
    Location,
)
from ..schemas import (
    CategoryOut,
    HeritageItemCreate,
    HeritageItemDetail,
    HeritageItemOut,
    LocationOut,
    Page,
    PeriodOut,
)

router = APIRouter(prefix="/heritage", tags=["heritage"])

SORTABLE = {
    "newest": HeritageItem.created_at.desc(),
    "popular": HeritageItem.view_count.desc(),
    "title": HeritageItem.title.asc(),
}


def _filter_query(
    *,
    q: str = "",
    category: str = "",
    item_type: str = "",
    era: str = "",
    location: str = "",
    period: str = "",
    tag: str = "",
    status: str = "published",
):
    query = select(HeritageItem).options(
        joinedload(HeritageItem.category),
        joinedload(HeritageItem.location),
        joinedload(HeritageItem.period),
    )
    if status:
        query = query.where(HeritageItem.status == status)
    if q:
        like = f"%{q.strip()}%"
        query = query.where(
            or_(
                HeritageItem.title.ilike(like),
                HeritageItem.title_ta.ilike(like),
                HeritageItem.summary.ilike(like),
                HeritageItem.description.ilike(like),
                HeritageItem.significance.ilike(like),
            )
        )
    if category:
        query = query.join(Category, HeritageItem.category_id == Category.id).where(Category.slug == category)
    if item_type:
        query = query.where(HeritageItem.item_type == item_type)
    if era:
        query = query.where(HeritageItem.era == era)
    if location:
        query = query.join(Location, HeritageItem.location_id == Location.id).where(Location.slug == location)
    if period:
        query = query.join(HistoricalPeriod, HeritageItem.period_id == HistoricalPeriod.id).where(HistoricalPeriod.slug == period)
    if tag:
        # Portable JSON-array tag match (serialized-cast LIKE) — fine at demo scale;
        # on PostgreSQL switch to a GIN index + @> containment (see README).
        query = query.where(func.lower(func.cast(HeritageItem.tags, Text)).contains(tag.strip().lower()))
    return query


@router.get("", response_model=Page)
def list_heritage(
    q: str = "",
    category: str = "",
    item_type: str = "",
    era: str = "",
    location: str = "",
    period: str = "",
    tag: str = "",
    featured: bool | None = None,
    sort: str = Query("newest", pattern="^(newest|popular|title)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
):
    query = _filter_query(q=q, category=category, item_type=item_type, era=era, location=location, period=period, tag=tag)
    if featured is not None:
        query = query.where(HeritageItem.featured == featured)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    query = query.order_by(SORTABLE[sort])
    rows = db.scalars(query.limit(page_size).offset((page - 1) * page_size)).unique().all()
    return Page(
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
        items=[HeritageItemOut.model_validate(r) for r in rows],
    )


@router.get("/suggestions")
def suggestions(q: str = Query(..., min_length=1), limit: int = 6, db: Session = Depends(get_db)):
    like = f"%{q.strip()}%"
    rows = db.scalars(
        select(HeritageItem)
        .where(HeritageItem.status == "published")
        .where(or_(HeritageItem.title.ilike(like), HeritageItem.title_ta.ilike(like)))
        .order_by(HeritageItem.view_count.desc())
        .limit(limit)
    ).all()
    return [
        {"slug": r.slug, "title": r.title, "title_ta": r.title_ta, "item_type": r.item_type}
        for r in rows
    ]


@router.get("/filters")
def filter_aggregates(db: Session = Depends(get_db)):
    categories = db.scalars(select(Category).order_by(Category.name_en)).all()
    counts = dict(
        db.execute(
            select(HeritageItem.category_id, func.count())
            .where(HeritageItem.status == "published")
            .group_by(HeritageItem.category_id)
        ).all()
    )
    locations = db.scalars(select(Location).order_by(Location.name)).all()
    periods = db.scalars(select(HistoricalPeriod).order_by(HistoricalPeriod.start_year)).all()
    types = db.execute(
        select(HeritageItem.item_type, func.count())
        .where(HeritageItem.status == "published")
        .group_by(HeritageItem.item_type)
        .order_by(func.count().desc())
    ).all()
    return {
        "categories": [
            {**CategoryOut.model_validate(c).model_dump(), "item_count": counts.get(c.id, 0)}
            for c in categories
        ],
        "locations": [LocationOut.model_validate(l) for l in locations],
        "periods": [PeriodOut.model_validate(p) for p in periods],
        "item_types": [{"type": t, "count": n} for t, n in types],
    }


def _serialize_detail(row: HeritageItem, user, db: Session) -> HeritageItemDetail:
    out = HeritageItemDetail.model_validate(row)
    extras = []
    if row.related_slugs:
        related = db.scalars(
            select(HeritageItem)
            .options(joinedload(HeritageItem.category))
            .where(HeritageItem.slug.in_(row.related_slugs))
            .where(HeritageItem.status == "published")
        ).all()
        extras.append({"label": "__related__", "value": [HeritageItemOut.model_validate(r) for r in related]})
    if user:
        extras.append({"label": "__bookmarked__", "value": db.scalar(
            select(Bookmark).where(Bookmark.user_id == user.id, Bookmark.item_id == row.id)
        ) is not None})
    out.facts = list(out.facts) + extras
    return out


@router.get("/{slug}", response_model=HeritageItemDetail)
def get_heritage(slug: str, db: Session = Depends(get_db), user=Depends(get_optional_user)):
    row = db.scalar(
        select(HeritageItem)
        .options(
            joinedload(HeritageItem.category),
            joinedload(HeritageItem.location),
            joinedload(HeritageItem.period),
        )
        .where(HeritageItem.slug == slug)
    )
    if not row:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    row.view_count += 1
    db.commit()
    db.refresh(row)
    return _serialize_detail(row, user, db)


# ---------------------------------------------------------------- admin CRUD
@router.post("", status_code=201)
def create_heritage(data: HeritageItemCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    if db.scalar(select(HeritageItem).where(HeritageItem.slug == data.slug)):
        raise HTTPException(status_code=409, detail="A record with this slug already exists")
    category = db.scalar(select(Category).where(Category.slug == data.category_slug))
    if not category:
        raise HTTPException(status_code=400, detail="Unknown category")
    location = db.scalar(select(Location).where(Location.slug == data.location_slug)) if data.location_slug else None
    period = db.scalar(select(HistoricalPeriod).where(HistoricalPeriod.slug == data.period_slug)) if data.period_slug else None
    item = HeritageItem(
        slug=data.slug,
        item_type=data.item_type,
        title=data.title,
        title_ta=data.title_ta,
        summary=data.summary,
        description=data.description,
        significance=data.significance,
        category_id=category.id,
        location_id=location.id if location else None,
        period_id=period.id if period else None,
        era=data.era,
        lat=data.lat,
        lng=data.lng,
        image_url=data.image_url,
        image_credit=data.image_credit,
        image_credit_url=data.image_credit_url,
        tags=data.tags,
        facts=data.facts,
        sources=data.sources,
        related_slugs=data.related_slugs,
        featured=data.featured,
        status=data.status,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return HeritageItemDetail.model_validate(item)


@router.put("/{slug}", response_model=HeritageItemDetail)
def update_heritage(slug: str, data: HeritageItemCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    item = db.scalar(select(HeritageItem).where(HeritageItem.slug == slug))
    if not item:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    category = db.scalar(select(Category).where(Category.slug == data.category_slug))
    if not category:
        raise HTTPException(status_code=400, detail="Unknown category")
    if data.slug != slug and db.scalar(select(HeritageItem).where(HeritageItem.slug == data.slug)):
        raise HTTPException(status_code=409, detail="A record with the new slug already exists")
    location = db.scalar(select(Location).where(Location.slug == data.location_slug)) if data.location_slug else None
    period = db.scalar(select(HistoricalPeriod).where(HistoricalPeriod.slug == data.period_slug)) if data.period_slug else None
    if data.slug != slug:
        item.slug = data.slug
    for field in ("item_type", "title", "title_ta", "summary", "description", "significance",
                  "era", "lat", "lng", "image_url", "image_credit", "image_credit_url",
                  "tags", "facts", "sources", "related_slugs", "featured", "status"):
        setattr(item, field, getattr(data, field))
    item.category_id = category.id
    item.location_id = location.id if location else None
    item.period_id = period.id if period else None
    db.commit()
    db.refresh(item)
    return HeritageItemDetail.model_validate(item)


@router.delete("/{slug}", status_code=204)
def delete_heritage(
    slug: str,
    mode: str = Query("archive", pattern="^(archive|delete)$"),
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    item = db.scalar(select(HeritageItem).where(HeritageItem.slug == slug))
    if not item:
        raise HTTPException(status_code=404, detail="Heritage record not found")
    if mode == "delete":
        db.delete(item)
    else:
        item.status = "archived"
        item.featured = False
    db.commit()
