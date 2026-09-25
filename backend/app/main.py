import os

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .database import Base, engine
from .routers import admin, auth, bookmarks, content, heritage, submissions

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="Public platform for preserving, discovering and sharing Tamil heritage.",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self)"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": "Please check the submitted fields", "errors": exc.errors()[:5]})


# routers — all mounted under /api
api_prefix = "/api"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(heritage.router, prefix=api_prefix)
app.include_router(content.router, prefix=api_prefix)
app.include_router(bookmarks.router, prefix=api_prefix)
app.include_router(submissions.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

media_dir = os.path.abspath(settings.MEDIA_DIR)
os.makedirs(media_dir, exist_ok=True)
app.mount(f"{api_prefix}/media", StaticFiles(directory=media_dir), name="media")


@app.get(f"{api_prefix}/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    from .seed import run_seed_if_empty

    run_seed_if_empty()
