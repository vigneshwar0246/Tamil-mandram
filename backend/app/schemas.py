from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------------------------------------------------------------- heritage
class CategoryOut(ORMModel):
    id: int
    slug: str
    name_en: str
    name_ta: str
    description: str
    color: str
    icon: str
    item_count: int = 0


class LocationOut(ORMModel):
    id: int
    slug: str
    name: str
    district: str
    region: str


class PeriodOut(ORMModel):
    id: int
    slug: str
    name: str
    name_ta: str
    start_year: int
    end_year: int
    era: str
    summary: str
    highlights: list = []


class HeritageItemOut(ORMModel):
    id: int
    slug: str
    item_type: str
    title: str
    title_ta: str
    summary: str
    era: str
    image_url: str
    image_credit: str
    image_credit_url: str
    tags: list
    featured: bool
    view_count: int
    lat: float | None
    lng: float | None
    category: CategoryOut | None = None
    location: LocationOut | None = None
    period: PeriodOut | None = None


class HeritageItemDetail(HeritageItemOut):
    description: str
    significance: str
    facts: list
    sources: list
    related_slugs: list
    status: str
    created_at: datetime
    updated_at: datetime


class HeritageItemCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=140, pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    item_type: str
    title: str = Field(min_length=2, max_length=200)
    title_ta: str = ""
    summary: str = ""
    description: str = ""
    significance: str = ""
    category_slug: str
    location_slug: str | None = None
    period_slug: str | None = None
    era: str = "ancient"
    lat: float | None = None
    lng: float | None = None
    image_url: str = ""
    image_credit: str = ""
    image_credit_url: str = ""
    tags: list[str] = []
    facts: list = []
    sources: list = []
    related_slugs: list[str] = []
    featured: bool = False
    status: str = "published"


class Page(BaseModel):
    total: int
    page: int
    page_size: int
    pages: int
    items: list


# ---------------------------------------------------------------- stories
class StoryOut(ORMModel):
    id: int
    slug: str
    title: str
    title_ta: str
    subtitle: str
    cover_image: str
    cover_credit: str
    read_minutes: int
    featured: bool
    period: PeriodOut | None = None


class StoryDetail(StoryOut):
    sections: list
    item_slugs: list


# ---------------------------------------------------------------- archive
class ArchiveOut(ORMModel):
    id: int
    slug: str
    title: str
    title_ta: str
    kind: str
    description: str
    period_label: str
    location_name: str
    source_name: str
    source_url: str
    contributor: str
    license: str
    image_url: str
    tags: list


# ---------------------------------------------------------------- submissions
class SubmissionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    content_type: str
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=20, max_length=6000)
    location_name: str = Field(default="", max_length=160)
    source_note: str = Field(default="", max_length=400)
    permission_confirmed: bool


class SubmissionOut(ORMModel):
    id: int
    public_id: str
    name: str
    email: EmailStr
    content_type: str
    title: str
    description: str
    location_name: str
    source_note: str
    files: list
    permission_confirmed: bool
    status: str
    review_note: str
    created_at: datetime


class SubmissionReview(BaseModel):
    status: str  # approved | rejected
    review_note: str = ""


# ---------------------------------------------------------------- misc
class BookmarkCreate(BaseModel):
    slug: str


class CollectionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = ""


class CollectionOut(ORMModel):
    id: int
    name: str
    description: str
    item_slugs: list
    created_at: datetime


class MapPoint(BaseModel):
    slug: str
    title: str
    item_type: str
    era: str
    lat: float
    lng: float
    image_url: str
    category: str
    category_color: str


class PublicStats(BaseModel):
    heritage_records: int
    stories: int
    archive_items: int
    categories: int
    locations: int
    most_viewed: list
    by_category: list


class AdminOverview(BaseModel):
    heritage_records: int
    pending_submissions: int
    published_stories: int
    users: int
    media_files: int
    most_viewed: list
    by_category: list
    by_era: list
    submissions_by_status: list
    recent_submissions: list
