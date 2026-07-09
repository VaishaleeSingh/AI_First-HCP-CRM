from sqlalchemy import asc, desc, or_
from sqlalchemy.orm import Session, joinedload

from app.models import Doctor, Hospital
from app.schemas.doctor import DoctorCreate


class DoctorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_doctors(
        self,
        search: str | None = None,
        city: str | None = None,
        sort: str = "last_visit_desc",
        page: int = 1,
        page_size: int = 25,
    ) -> tuple[list[Doctor], int]:
        query = self.db.query(Doctor).options(joinedload(Doctor.hospital))

        if search:
            term = f"%{search}%"
            query = query.join(Doctor.hospital).filter(
                or_(
                    Doctor.full_name.ilike(term),
                    Doctor.specialization.ilike(term),
                    Doctor.city.ilike(term),
                    Hospital.name.ilike(term),
                ),
            )

        if city:
            query = query.filter(Doctor.city == city)

        total = query.count()

        if sort == "name_asc":
            query = query.order_by(asc(Doctor.full_name))
        elif sort == "follow_up_asc":
            query = query.order_by(asc(Doctor.updated_at))
        else:
            query = query.order_by(desc(Doctor.updated_at))

        items = query.offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_by_id(self, doctor_id: int) -> Doctor | None:
        return (
            self.db.query(Doctor)
            .options(joinedload(Doctor.hospital), joinedload(Doctor.interactions))
            .filter(Doctor.id == doctor_id)
            .first()
        )

    def create(self, payload: DoctorCreate) -> Doctor:
        doctor = Doctor(**payload.model_dump())
        self.db.add(doctor)
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

