from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from core.database import connect_db, disconnect_db
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.groups import router as groups_router
from routers.expenses import router as expenses_router
from routers.receipts import router as receipts_router
from routers.settlements import router as settlements_router
from routers.activity import router as activity_router
from routers.notifications import router as notifications_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    print("✅ SplitGreen backend ready")
    
    yield
    
    # Shutdown
    await disconnect_db()


# ── App ───────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="SplitGreen — Smart expense splitting API",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers ───────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(groups_router)
app.include_router(expenses_router)
app.include_router(receipts_router)
app.include_router(settlements_router)
app.include_router(activity_router)
app.include_router(notifications_router)


# ── Health check ──────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
    }


# ── Run ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
