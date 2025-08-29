from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from ..models import Survey
from .llm import generate_survey

def get_or_create_survey(db: Session, description: str) -> Survey:
    existing = db.query(Survey).filter(Survey.description == description).first()
    if existing:
        return existing

    payload = generate_survey(description)
    survey = Survey(
        description=description,
        title=payload["title"],
        questions=payload["questions"],
    )
    db.add(survey)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        # someone inserted the same description
        return db.query(Survey).filter(Survey.description == description).first()
    db.refresh(survey)
    return survey
