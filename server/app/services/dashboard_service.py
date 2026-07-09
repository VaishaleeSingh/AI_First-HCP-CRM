from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository
from app.schemas.dashboard import DashboardResponse
from app.services.interaction_service import InteractionService


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.repository = DashboardRepository(db)
        self.interaction_service = InteractionService(db)

    def get_summary(self) -> DashboardResponse:
        recent = [self.interaction_service._to_read(item) for item in self.repository.recent_interactions()]
        confidence_values = [item.confidence_score for item in recent]
        average_confidence = int(sum(confidence_values) / len(confidence_values) * 100) if confidence_values else 0
        return DashboardResponse(
            todays_visits=self.repository.todays_visits(),
            upcoming_meetings=self.repository.upcoming_meetings(),
            recent_interactions=recent,
            pending_follow_ups=self.repository.pending_follow_ups(),
            completion_rate=86,
            average_confidence=average_confidence,
        )

