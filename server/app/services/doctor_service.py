from sqlalchemy.orm import Session

from app.models import Doctor
from app.repositories.doctor_repository import DoctorRepository
from app.schemas.doctor import DoctorCreate, DoctorListResponse, DoctorRead


class DoctorService:
    def __init__(self, db: Session) -> None:
        self.repository = DoctorRepository(db)

    def list_doctors(
        self,
        search: str | None = None,
        city: str | None = None,
        sort: str = "last_visit_desc",
        page: int = 1,
    ) -> DoctorListResponse:
        doctors, total = self.repository.list_doctors(search=search, city=city, sort=sort, page=page)
        return DoctorListResponse(items=[self._to_read(doctor) for doctor in doctors], page=page, total=total)

    def get_doctor(self, doctor_id: int) -> DoctorRead | None:
        doctor = self.repository.get_by_id(doctor_id)
        return self._to_read(doctor) if doctor else None

    def create_doctor(self, payload: DoctorCreate) -> DoctorRead:
        return self._to_read(self.repository.create(payload))

    def _to_read(self, doctor: Doctor) -> DoctorRead:
        products = []
        for interaction in doctor.interactions:
            for link in interaction.products:
                products.append(link.product)

        unique_products = {product.id: product for product in products}.values()
        last_visit = max((item.meeting_date.isoformat() for item in doctor.interactions), default=None)
        next_follow_up = min(
            (item.next_follow_up.isoformat() for item in doctor.interactions if item.next_follow_up),
            default=None,
        )
        return DoctorRead(
            id=doctor.id,
            full_name=doctor.full_name,
            specialization=doctor.specialization,
            city=doctor.city,
            hospital=doctor.hospital,
            email=doctor.email,
            phone=doctor.phone,
            last_visit_at=last_visit,
            next_follow_up_at=next_follow_up,
            products_prescribed=list(unique_products),
        )

