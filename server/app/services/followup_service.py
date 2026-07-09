from datetime import date

from sqlalchemy.orm import Session

from app.models import FollowUp


class FollowUpService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_followups(self) -> list[dict]:
        followups = (
            self.db.query(FollowUp)
            .filter(FollowUp.due_date >= date.today())
            .order_by(FollowUp.due_date.asc())
            .all()
        )
        return [
            {
                "id": item.id,
                "doctorId": item.doctor_id,
                "doctorName": item.doctor.full_name,
                "dueDate": item.due_date.isoformat(),
                "status": item.status,
                "recommendation": item.recommendation,
                "suggestedSamples": item.suggested_samples,
                "suggestedProducts": item.suggested_products,
                "discussionTopics": item.discussion_topics,
            }
            for item in followups
        ]

