from sqlalchemy import Column, Integer, String, JSON, UniqueConstraint
from .db import Base

class Survey(Base):
    __tablename__ = "surveys"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    title = Column(String, nullable=False)
    questions = Column(JSON, nullable=False)

    __table_args__ = (UniqueConstraint("description", name="uq_survey_description"),)
