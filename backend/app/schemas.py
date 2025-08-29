from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class SurveyCreateRequest(BaseModel):
    description: str = Field(min_length=5, max_length=500)

class Question(BaseModel):
    type: Literal["multiple_choice", "rating", "open_text"]
    text: str
    choices: Optional[List[str]] = None

class SurveyResponse(BaseModel):
    id: int
    title: str
    questions: List[Question]
