# main.py
import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from .schemas import SurveyCreateRequest, SurveyResponse
from .services.survey_service import get_or_create_survey
from .security import require_token

app = FastAPI(title="BoundaryAI Backend")
Base.metadata.create_all(bind=engine)

# CORS
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Too many requests"})

@app.get("/")
def health():
    return {"message": "Backend is running!"}

@app.post("/api/surveys/generate", response_model=SurveyResponse)
@limiter.limit(os.getenv("RATE_LIMIT", "10/minute"))
async def generate(
    request: Request,                             # <-- REQUIRED by slowapi
    req: SurveyCreateRequest,
    db: Session = Depends(get_db),
    _: str = Depends(require_token),
):
    survey = get_or_create_survey(db, req.description.strip())
    return SurveyResponse(id=survey.id, title=survey.title, questions=survey.questions)
