from sqlalchemy.orm import Session

from app.services.followup_service import FollowUpService


def list_followups(db: Session) -> list[dict]:
    return FollowUpService(db).list_followups()

