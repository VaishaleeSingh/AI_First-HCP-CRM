from app.schemas.base import ApiSchema
from app.schemas.interaction import InteractionRead


class DashboardResponse(ApiSchema):
    todays_visits: int
    upcoming_meetings: int
    recent_interactions: list[InteractionRead]
    pending_follow_ups: int
    completion_rate: int
    average_confidence: int

