from datetime import date, time

from sqlalchemy.orm import Session, joinedload

from app.models import (
    AgentLog,
    AuditLog,
    ChatHistory,
    FollowUp,
    Interaction,
    InteractionProduct,
    Product,
)
from app.models.crm import utc_now
from app.schemas.interaction import InteractionCreate, InteractionUpdate


class InteractionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_interactions(self) -> list[Interaction]:
        return (
            self.db.query(Interaction)
            .options(
                joinedload(Interaction.doctor),
                joinedload(Interaction.hospital),
                joinedload(Interaction.products).joinedload(InteractionProduct.product),
            )
            .order_by(Interaction.meeting_date.desc(), Interaction.created_at.desc())
            .all()
        )

    def get_by_id(self, interaction_id: int) -> Interaction | None:
        return (
            self.db.query(Interaction)
            .options(
                joinedload(Interaction.doctor),
                joinedload(Interaction.hospital),
                joinedload(Interaction.products).joinedload(InteractionProduct.product),
            )
            .filter(Interaction.id == interaction_id)
            .first()
        )

    def create(
        self,
        payload: InteractionCreate,
        user_id: int,
        summary: str,
        sentiment: str,
        confidence: float,
    ) -> Interaction:
        data = payload.model_dump(exclude={"products_discussed"})
        interaction = Interaction(
            **data,
            user_id=user_id,
            summary=summary,
            sentiment=sentiment,
            confidence_score=confidence,
        )
        self.db.add(interaction)
        self.db.flush()
        self._sync_products(interaction, payload.products_discussed)

        if payload.next_follow_up:
            follow_up = FollowUp(
                doctor_id=payload.doctor_id,
                interaction_id=interaction.id,
                user_id=user_id,
                due_date=payload.next_follow_up,
                recommendation="Review discussion outcomes and confirm sample delivery.",
                suggested_samples=payload.products_discussed,
                suggested_products=payload.products_discussed,
                discussion_topics=["Clinical data", "Patient fit", "Sample feedback"],
            )
            self.db.add(follow_up)

        self.db.add(
            AuditLog(
                user_id=user_id,
                interaction_id=interaction.id,
                action="create",
                entity_name="interaction",
                entity_id=interaction.id,
                before=None,
                after={"purpose": interaction.purpose, "doctor_id": interaction.doctor_id},
            ),
        )
        self.db.commit()
        self.db.refresh(interaction)
        return self.get_by_id(interaction.id) or interaction

    def update(
        self,
        interaction_id: int,
        payload: InteractionUpdate,
        user_id: int,
    ) -> Interaction | None:
        interaction = self.get_by_id(interaction_id)
        if interaction is None:
            return None

        before = {
            "doctor_id": interaction.doctor_id,
            "hospital_id": interaction.hospital_id,
            "purpose": interaction.purpose,
            "discussion": interaction.discussion,
            "products_discussed": [link.product.name for link in interaction.products],
            "doctor_feedback": interaction.doctor_feedback,
            "interest_level": interaction.interest_level,
            "next_follow_up": interaction.next_follow_up.isoformat() if interaction.next_follow_up else None,
            "visit_status": interaction.visit_status,
            "sentiment": interaction.sentiment,
        }

        updates = payload.model_dump(exclude_unset=True)
        product_names = updates.pop("products_discussed", None)
        for key, value in updates.items():
            setattr(interaction, key, value)
        if product_names is not None:
            self._sync_products(interaction, product_names)
        if "discussion" in updates and updates["discussion"]:
            interaction.summary = updates["discussion"]
        if updates.get("doctor_feedback") in {"positive", "neutral", "negative"}:
            interaction.sentiment = updates["doctor_feedback"]
        interaction.updated_at = utc_now()
        self.db.add(
            AuditLog(
                user_id=user_id,
                interaction_id=interaction.id,
                action="update",
                entity_name="interaction",
                entity_id=interaction.id,
                before=before,
                after=self._json_safe_updates(
                    {
                        **updates,
                        **(
                            {"products_discussed": product_names}
                            if product_names is not None
                            else {}
                        ),
                    },
                ),
            ),
        )
        self.db.commit()
        self.db.refresh(interaction)
        return self.get_by_id(interaction.id)

    def delete(self, interaction_id: int, user_id: int) -> bool:
        interaction = self.get_by_id(interaction_id)
        if interaction is None:
            return False

        self.db.query(AuditLog).filter(AuditLog.interaction_id == interaction.id).update(
            {AuditLog.interaction_id: None},
            synchronize_session=False,
        )
        self.db.query(AgentLog).filter(AgentLog.interaction_id == interaction.id).update(
            {AgentLog.interaction_id: None},
            synchronize_session=False,
        )
        self.db.query(ChatHistory).filter(ChatHistory.interaction_id == interaction.id).update(
            {ChatHistory.interaction_id: None},
            synchronize_session=False,
        )
        self.db.query(FollowUp).filter(FollowUp.interaction_id == interaction.id).update(
            {FollowUp.interaction_id: None},
            synchronize_session=False,
        )
        self.db.add(
            AuditLog(
                user_id=user_id,
                interaction_id=None,
                action="delete",
                entity_name="interaction",
                entity_id=interaction.id,
                before={"purpose": interaction.purpose},
                after=None,
            ),
        )
        self.db.delete(interaction)
        self.db.commit()
        return True

    def _sync_products(self, interaction: Interaction, product_names: list[str]) -> None:
        interaction.products.clear()
        for name in product_names:
            product = self.db.query(Product).filter(Product.name == name).first()
            if product is None:
                product = Product(name=name, therapeutic_area="Unclassified")
                self.db.add(product)
                self.db.flush()
            interaction.products.append(InteractionProduct(product_id=product.id))

    @staticmethod
    def _json_safe_updates(updates: dict) -> dict:
        return {
            key: value.isoformat() if isinstance(value, (date, time)) else value
            for key, value in updates.items()
        }
