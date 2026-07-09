from datetime import date, time

from pydantic import Field

from app.schemas.base import ApiSchema


class InteractionCreate(ApiSchema):
    doctor_id: int
    hospital_id: int
    meeting_date: date
    meeting_time: time
    duration_minutes: int = Field(ge=5, le=240)
    purpose: str
    discussion: str = Field(min_length=20)
    products_discussed: list[str]
    samples_provided: str | None = None
    doctor_feedback: str | None = None
    interest_level: str
    competitor_mentioned: str | None = None
    next_follow_up: date | None = None
    additional_notes: str | None = None
    visit_status: str


class InteractionUpdate(ApiSchema):
    doctor_id: int | None = None
    hospital_id: int | None = None
    meeting_date: date | None = None
    meeting_time: time | None = None
    duration_minutes: int | None = Field(default=None, ge=5, le=240)
    purpose: str | None = None
    discussion: str | None = None
    products_discussed: list[str] | None = None
    samples_provided: str | None = None
    doctor_feedback: str | None = None
    interest_level: str | None = None
    competitor_mentioned: str | None = None
    next_follow_up: date | None = None
    additional_notes: str | None = None
    visit_status: str | None = None


class InteractionRead(ApiSchema):
    id: int
    doctor_id: int
    hospital_id: int
    doctor_name: str
    hospital_name: str
    meeting_date: date
    meeting_time: time
    duration_minutes: int
    purpose: str
    discussion: str
    products_discussed: list[str]
    samples_provided: str | None = None
    doctor_feedback: str | None = None
    interest_level: str
    competitor_mentioned: str | None = None
    next_follow_up: date | None = None
    additional_notes: str | None = None
    visit_status: str
    summary: str
    sentiment: str
    action_items: list[str]
    confidence_score: float
    created_at: str
    updated_at: str
