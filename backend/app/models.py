from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="user")  # user | admin
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    collections: Mapped[list["Collection"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name_en: Mapped[str] = mapped_column(String(120))
    name_ta: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    color: Mapped[str] = mapped_column(String(16), default="#7a1f2b")
    icon: Mapped[str] = mapped_column(String(40), default="archive")

    items: Mapped[list["HeritageItem"]] = relationship(back_populates="category")


class Location(Base):
    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    district: Mapped[str] = mapped_column(String(120), default="")
    region: Mapped[str] = mapped_column(String(80), default="")
    lat: Mapped[float] = mapped_column(Float, nullable=True)
    lng: Mapped[float] = mapped_column(Float, nullable=True)

    items: Mapped[list["HeritageItem"]] = relationship(back_populates="location")


class HistoricalPeriod(Base):
    __tablename__ = "historical_periods"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    name_ta: Mapped[str] = mapped_column(String(120), default="")
    start_year: Mapped[int] = mapped_column(Integer)  # negative = BCE
    end_year: Mapped[int] = mapped_column(Integer)
    era: Mapped[str] = mapped_column(String(20))  # ancient | medieval | colonial | modern
    summary: Mapped[str] = mapped_column(Text, default="")
    highlights: Mapped[list] = mapped_column(JSON, default=list)  # [{title, detail}]

    items: Mapped[list["HeritageItem"]] = relationship(back_populates="period")
    stories: Mapped[list["Story"]] = relationship(back_populates="period")


class HeritageItem(Base):
    __tablename__ = "heritage_items"
    __table_args__ = (
        Index("ix_items_type_era", "item_type", "era"),
        Index("ix_items_category", "category_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    item_type: Mapped[str] = mapped_column(String(40), index=True)
    # place | monument | person | art_form | music | dance | theatre | craft | literature
    # food | festival | event | artifact | manuscript | tradition | language | inscription
    title: Mapped[str] = mapped_column(String(200))
    title_ta: Mapped[str] = mapped_column(String(200), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    significance: Mapped[str] = mapped_column(Text, default="")
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey("locations.id"), nullable=True)
    period_id: Mapped[int] = mapped_column(ForeignKey("historical_periods.id"), nullable=True)
    era: Mapped[str] = mapped_column(String(20), default="ancient")
    lat: Mapped[float] = mapped_column(Float, nullable=True)
    lng: Mapped[float] = mapped_column(Float, nullable=True)
    image_url: Mapped[str] = mapped_column(Text, default="")
    image_credit: Mapped[str] = mapped_column(String(255), default="")
    image_credit_url: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    facts: Mapped[list] = mapped_column(JSON, default=list)  # [{label, value}]
    sources: Mapped[list] = mapped_column(JSON, default=list)
    # [{label, url, nature}] nature: evidence | tradition | legend | interpretation
    related_slugs: Mapped[list] = mapped_column(JSON, default=list)
    featured: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(String(20), default="published")  # published | draft | archived
    view_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    category: Mapped["Category"] = relationship(back_populates="items")
    location: Mapped["Location"] = relationship(back_populates="items")
    period: Mapped["HistoricalPeriod"] = relationship(back_populates="items")
    bookmarks: Mapped[list["Bookmark"]] = relationship(back_populates="item", cascade="all, delete-orphan")


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    title_ta: Mapped[str] = mapped_column(String(200), default="")
    subtitle: Mapped[str] = mapped_column(String(300), default="")
    cover_image: Mapped[str] = mapped_column(Text, default="")
    cover_credit: Mapped[str] = mapped_column(String(255), default="")
    sections: Mapped[list] = mapped_column(JSON, default=list)  # [{heading, body, image?}]
    item_slugs: Mapped[list] = mapped_column(JSON, default=list)  # related heritage slugs
    period_id: Mapped[int] = mapped_column(ForeignKey("historical_periods.id"), nullable=True)
    read_minutes: Mapped[int] = mapped_column(default=5)
    featured: Mapped[bool] = mapped_column(default=False)
    published: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    period: Mapped["HistoricalPeriod"] = relationship(back_populates="stories")


class ArchiveItem(Base):
    __tablename__ = "archive_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    title_ta: Mapped[str] = mapped_column(String(200), default="")
    kind: Mapped[str] = mapped_column(String(40), index=True)
    # photo | manuscript | inscription | document | artifact | map | audio | oral_history
    description: Mapped[str] = mapped_column(Text, default="")
    period_label: Mapped[str] = mapped_column(String(80), default="")
    location_name: Mapped[str] = mapped_column(String(120), default="")
    source_name: Mapped[str] = mapped_column(String(160), default="")
    source_url: Mapped[str] = mapped_column(Text, default="")
    contributor: Mapped[str] = mapped_column(String(120), default="")
    license: Mapped[str] = mapped_column(String(160), default="")
    image_url: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    content_type: Mapped[str] = mapped_column(String(40))
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    location_name: Mapped[str] = mapped_column(String(160), default="")
    source_note: Mapped[str] = mapped_column(String(400), default="")
    files: Mapped[list] = mapped_column(JSON, default=list)  # ["/media/..."]
    permission_confirmed: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    review_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)


class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (UniqueConstraint("user_id", "item_id", name="uq_user_item"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("heritage_items.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="bookmarks")
    item: Mapped["HeritageItem"] = relationship(back_populates="bookmarks")


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text, default="")
    item_slugs: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped["User"] = relationship(back_populates="collections")
