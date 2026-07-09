from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import followup_controller
from app.database.session import get_db

router = APIRouter(prefix="/followups", tags=["Follow-ups"])


@router.get("")
def list_followups(db: Session = Depends(get_db)) -> list[dict]:
    return followup_controller.list_followups(db)

