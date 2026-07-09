from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import interaction_controller
from app.database.session import get_db
from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.get("", response_model=list[InteractionRead])
def list_interactions(db: Session = Depends(get_db)) -> list[InteractionRead]:
    return interaction_controller.list_interactions(db)


@router.post("", response_model=InteractionRead, status_code=201)
def create_interaction(payload: InteractionCreate, db: Session = Depends(get_db)) -> InteractionRead:
    return interaction_controller.create_interaction(db, payload)


@router.put("/{interaction_id}", response_model=InteractionRead)
def update_interaction(
    interaction_id: int,
    payload: InteractionUpdate,
    db: Session = Depends(get_db),
) -> InteractionRead:
    return interaction_controller.update_interaction(db, interaction_id, payload)


@router.delete("/{interaction_id}")
def delete_interaction(interaction_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    return interaction_controller.delete_interaction(db, interaction_id)

