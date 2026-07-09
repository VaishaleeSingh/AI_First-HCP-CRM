from sqlalchemy.orm import Session

from app.models import Interaction
from app.repositories.interaction_repository import InteractionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate


class InteractionService:
    def __init__(self, db: Session) -> None:
        self.repository = InteractionRepository(db)
        self.user_repository = UserRepository(db)

    def list_interactions(self) -> list[InteractionRead]:
        return [self._to_read(interaction) for interaction in self.repository.list_interactions()]

    def create_interaction(self, payload: InteractionCreate) -> InteractionRead:
        user = self.user_repository.get_default_user()
        summary = self._build_summary(payload.discussion)
        sentiment = self._derive_sentiment(payload.interest_level, payload.doctor_feedback or "")
        interaction = self.repository.create(payload, user_id=user.id, summary=summary, sentiment=sentiment, confidence=0.86)
        return self._to_read(interaction)

    def update_interaction(self, interaction_id: int, payload: InteractionUpdate) -> InteractionRead | None:
        user = self.user_repository.get_default_user()
        interaction = self.repository.update(interaction_id, payload, user_id=user.id)
        return self._to_read(interaction) if interaction else None

    def delete_interaction(self, interaction_id: int) -> bool:
        user = self.user_repository.get_default_user()
        return self.repository.delete(interaction_id, user_id=user.id)

    def _to_read(self, interaction: Interaction) -> InteractionRead:
        products = [link.product.name for link in interaction.products]
        action_items = []
        if interaction.next_follow_up:
            action_items.append(f"Follow up on {interaction.next_follow_up.isoformat()}")
        if interaction.samples_provided:
            action_items.append("Coordinate sample request")
        if interaction.competitor_mentioned:
            action_items.append(f"Prepare positioning against {interaction.competitor_mentioned}")

        return InteractionRead(
            id=interaction.id,
            doctor_id=interaction.doctor_id,
            hospital_id=interaction.hospital_id,
            doctor_name=interaction.doctor.full_name,
            hospital_name=interaction.hospital.name,
            meeting_date=interaction.meeting_date,
            meeting_time=interaction.meeting_time,
            duration_minutes=interaction.duration_minutes,
            purpose=interaction.purpose,
            discussion=interaction.discussion,
            products_discussed=products,
            samples_provided=interaction.samples_provided,
            doctor_feedback=interaction.doctor_feedback,
            interest_level=interaction.interest_level,
            competitor_mentioned=interaction.competitor_mentioned,
            next_follow_up=interaction.next_follow_up,
            additional_notes=interaction.additional_notes,
            visit_status=interaction.visit_status,
            summary=interaction.summary,
            sentiment=interaction.sentiment,
            action_items=action_items,
            confidence_score=interaction.confidence_score,
            created_at=interaction.created_at.isoformat(),
            updated_at=interaction.updated_at.isoformat(),
        )

    @staticmethod
    def _build_summary(discussion: str) -> str:
        return discussion.strip()[:240]

    @staticmethod
    def _derive_sentiment(interest_level: str, feedback: str) -> str:
        combined = f"{interest_level} {feedback}".lower()
        if "high" in combined or "positive" in combined or "liked" in combined:
            return "positive"
        if "low" in combined or "concern" in combined or "negative" in combined:
            return "negative"
        return "neutral"

