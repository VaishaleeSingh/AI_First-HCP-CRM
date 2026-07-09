from datetime import UTC, date, datetime, time

from sqlalchemy import (
    JSON,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


def utc_now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=utc_now,
        nullable=False,
        onupdate=utc_now,
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(80), nullable=False, default="field_representative")
    territory: Mapped[str] = mapped_column(String(160), nullable=False, default="Unassigned")

    interactions: Mapped[list["Interaction"]] = relationship(back_populates="user")


class Hospital(TimestampMixin, Base):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    state: Mapped[str | None] = mapped_column(String(120))

    doctors: Mapped[list["Doctor"]] = relationship(back_populates="hospital")

    __table_args__ = (UniqueConstraint("name", "city", name="uq_hospital_name_city"),)


class Doctor(TimestampMixin, Base):
    __tablename__ = "doctors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    specialization: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), nullable=False, index=True)

    hospital: Mapped[Hospital] = relationship(back_populates="doctors")
    interactions: Mapped[list["Interaction"]] = relationship(back_populates="doctor")
    follow_ups: Mapped[list["FollowUp"]] = relationship(back_populates="doctor")


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True, index=True)
    therapeutic_area: Mapped[str] = mapped_column(String(160), nullable=False, index=True)

    interaction_links: Mapped[list["InteractionProduct"]] = relationship(back_populates="product")


class Interaction(TimestampMixin, Base):
    __tablename__ = "interactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False, index=True)
    hospital_id: Mapped[int] = mapped_column(ForeignKey("hospitals.id"), nullable=False, index=True)
    meeting_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    meeting_time: Mapped[time] = mapped_column(Time, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    purpose: Mapped[str] = mapped_column(String(160), nullable=False)
    discussion: Mapped[str] = mapped_column(Text, nullable=False)
    samples_provided: Mapped[str | None] = mapped_column(Text)
    doctor_feedback: Mapped[str | None] = mapped_column(Text)
    interest_level: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    competitor_mentioned: Mapped[str | None] = mapped_column(String(160))
    next_follow_up: Mapped[date | None] = mapped_column(Date, index=True)
    additional_notes: Mapped[str | None] = mapped_column(Text)
    visit_status: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    user: Mapped[User] = relationship(back_populates="interactions")
    doctor: Mapped[Doctor] = relationship(back_populates="interactions")
    hospital: Mapped[Hospital] = relationship()
    products: Mapped[list["InteractionProduct"]] = relationship(
        back_populates="interaction",
        cascade="all, delete-orphan",
    )
    follow_ups: Mapped[list["FollowUp"]] = relationship(back_populates="interaction")
    chat_history: Mapped[list["ChatHistory"]] = relationship(back_populates="interaction")

    __table_args__ = (
        Index("ix_interactions_doctor_date", "doctor_id", "meeting_date"),
        Index("ix_interactions_user_date", "user_id", "meeting_date"),
    )


class InteractionProduct(TimestampMixin, Base):
    __tablename__ = "interaction_products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    interaction_id: Mapped[int] = mapped_column(ForeignKey("interactions.id"), nullable=False, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    sample_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    interaction: Mapped[Interaction] = relationship(back_populates="products")
    product: Mapped[Product] = relationship(back_populates="interaction_links")

    __table_args__ = (UniqueConstraint("interaction_id", "product_id", name="uq_interaction_product"),)


class FollowUp(TimestampMixin, Base):
    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey("doctors.id"), nullable=False, index=True)
    interaction_id: Mapped[int | None] = mapped_column(ForeignKey("interactions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    due_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="pending", index=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_samples: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    suggested_products: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    discussion_topics: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    doctor: Mapped[Doctor] = relationship(back_populates="follow_ups")
    interaction: Mapped[Interaction | None] = relationship(back_populates="follow_ups")


class ChatHistory(TimestampMixin, Base):
    __tablename__ = "chat_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    interaction_id: Mapped[int | None] = mapped_column(ForeignKey("interactions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(40), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_payload: Mapped[dict | None] = mapped_column(JSON)

    interaction: Mapped[Interaction | None] = relationship(back_populates="chat_history")


class AgentLog(TimestampMixin, Base):
    __tablename__ = "agent_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    interaction_id: Mapped[int | None] = mapped_column(ForeignKey("interactions.id"), index=True)
    node_name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    input_payload: Mapped[dict | None] = mapped_column(JSON)
    output_payload: Mapped[dict | None] = mapped_column(JSON)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="success", index=True)
    error_message: Mapped[str | None] = mapped_column(Text)


class AuditLog(TimestampMixin, Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    interaction_id: Mapped[int | None] = mapped_column(ForeignKey("interactions.id"), index=True)
    action: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    entity_name: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_id: Mapped[int | None] = mapped_column(Integer)
    before: Mapped[dict | None] = mapped_column(JSON)
    after: Mapped[dict | None] = mapped_column(JSON)


class Setting(TimestampMixin, Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(160), nullable=False, unique=True, index=True)
    value: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
