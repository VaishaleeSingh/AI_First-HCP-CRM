from sqlalchemy.orm import Session

from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService


def get_dashboard(db: Session) -> DashboardResponse:
    return DashboardService(db).get_summary()

