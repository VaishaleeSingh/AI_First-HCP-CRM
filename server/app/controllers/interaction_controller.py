from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate
from app.services.interaction_service import InteractionService


def list_interactions(db: Session) -> list[InteractionRead]:
    return InteractionService(db).list_interactions()


def create_interaction(db: Session, payload: InteractionCreate) -> InteractionRead:
    return InteractionService(db).create_interaction(payload)


def update_interaction(db: Session, interaction_id: int, payload: InteractionUpdate) -> InteractionRead:
    interaction = InteractionService(db).update_interaction(interaction_id, payload)
    if interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return interaction


def delete_interaction(db: Session, interaction_id: int) -> dict[str, bool]:
    deleted = InteractionService(db).delete_interaction(interaction_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {"deleted": True}

