from sqlalchemy.orm import Session

from app.models import Interaction


class InteractionSummaryTool:
    name = "interaction_summary"

    def __init__(self, db: Session) -> None:
        self.db = db

    def run(self, doctor_id: int) -> dict:
        interactions = (
            self.db.query(Interaction)
            .filter(Interaction.doctor_id == doctor_id)
            .order_by(Interaction.meeting_date.desc())
            .limit(10)
            .all()
        )
        return {
            "timeline": [
                {
                    "date": item.meeting_date.isoformat(),
                    "summary": item.summary,
                    "sentiment": item.sentiment,
                    "purpose": item.purpose,
                }
                for item in interactions
            ],
            "summary": " ".join(item.summary for item in interactions[:3]) if interactions else "No previous meetings.",
        }

