from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import agent, auth, dashboard, doctors, followups, interactions
from app.config.settings import get_settings
from app.database.base import Base
from app.database.seed import seed_reference_data
from app.database.session import SessionLocal, engine
from app.middleware.rate_limit import RateLimitMiddleware

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_reference_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI-First CRM HCP module with LangGraph and Groq integration.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(
        {
            settings.client_origin,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        },
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.api_rate_limit_per_minute)

app.include_router(auth.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(agent.router, prefix="/api")
app.include_router(followups.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/health", tags=["System"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
