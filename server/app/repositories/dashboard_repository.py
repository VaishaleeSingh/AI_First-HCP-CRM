from datetime import date

from sqlalchemy.orm import Session

from app.models import FollowUp, Interaction


class DashboardRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def todays_visits(self) -> int:
        return self.db.query(Interaction).filter(Interaction.meeting_date == date.today()).count()

    def upcoming_meetings(self) -> int:
        return self.db.query(FollowUp).filter(FollowUp.due_date >= date.today(), FollowUp.status == "pending").count()

    def pending_follow_ups(self) -> int:
        return self.db.query(FollowUp).filter(FollowUp.status == "pending").count()

    def recent_interactions(self, limit: int = 5) -> list[Interaction]:
        return (
            self.db.query(Interaction)
            .order_by(Interaction.meeting_date.desc(), Interaction.created_at.desc())
            .limit(limit)
            .all()
        )

