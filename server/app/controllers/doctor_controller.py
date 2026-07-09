from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.schemas.doctor import DoctorCreate, DoctorListResponse, DoctorRead
from app.services.doctor_service import DoctorService


def list_hcp(
    db: Session,
    search: str | None = None,
    city: str | None = None,
    sort: str = "last_visit_desc",
    page: int = 1,
) -> DoctorListResponse:
    return DoctorService(db).list_doctors(search=search, city=city, sort=sort, page=page)


def get_hcp(db: Session, doctor_id: int) -> DoctorRead:
    doctor = DoctorService(db).get_doctor(doctor_id)
    if doctor is None:
        raise HTTPException(status_code=404, detail="HCP not found")
    return doctor


def create_hcp(db: Session, payload: DoctorCreate) -> DoctorRead:
    return DoctorService(db).create_doctor(payload)

