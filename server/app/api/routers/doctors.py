from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.controllers import doctor_controller
from app.database.session import get_db
from app.schemas.doctor import DoctorCreate, DoctorListResponse, DoctorRead

router = APIRouter(prefix="/hcp", tags=["HCP"])


@router.get("", response_model=DoctorListResponse)
def list_hcp(
    search: str | None = None,
    city: str | None = None,
    sort: str = "last_visit_desc",
    page: int = Query(default=1, ge=1),
    db: Session = Depends(get_db),
) -> DoctorListResponse:
    return doctor_controller.list_hcp(db, search=search, city=city, sort=sort, page=page)


@router.get("/{doctor_id}", response_model=DoctorRead)
def get_hcp(doctor_id: int, db: Session = Depends(get_db)) -> DoctorRead:
    return doctor_controller.get_hcp(db, doctor_id)


@router.post("", response_model=DoctorRead, status_code=201)
def create_hcp(payload: DoctorCreate, db: Session = Depends(get_db)) -> DoctorRead:
    return doctor_controller.create_hcp(db, payload)

