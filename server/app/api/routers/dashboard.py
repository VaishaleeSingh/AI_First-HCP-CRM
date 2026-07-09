from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import dashboard_controller
from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardResponse:
    return dashboard_controller.get_dashboard(db)

