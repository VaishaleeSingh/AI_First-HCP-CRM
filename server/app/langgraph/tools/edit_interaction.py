from sqlalchemy.orm import Session

from app.repositories.interaction_repository import InteractionRepository
from app.schemas.interaction import InteractionUpdate


class EditInteractionTool:
    name = "edit_interaction"

    def __init__(self, db: Session) -> None:
        self.repository = InteractionRepository(db)

    def run(self, interaction_id: int, updates: dict, user_id: int) -> dict:
        payload = InteractionUpdate(**updates)
        interaction = self.repository.update(interaction_id, payload, user_id=user_id)
        if interaction is None:
            return {"success": False, "message": "Interaction not found"}
        return {
            "success": True,
            "interactionId": interaction.id,
            "versionHistory": "Audit log entry created",
            "auditTrail": {"action": "update", "entity": "interaction", "id": interaction.id},
        }

