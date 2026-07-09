from sqlalchemy.orm import Session

from app.repositories.doctor_repository import DoctorRepository


class SearchHCPTool:
    name = "search_hcp"

    def __init__(self, db: Session) -> None:
        self.repository = DoctorRepository(db)

    def run(self, query: str | None = None, doctor_id: int | None = None) -> dict:
        if doctor_id:
            doctor = self.repository.get_by_id(doctor_id)
            if doctor:
                return {
                    "doctorName": doctor.full_name,
                    "hospital": doctor.hospital.name,
                    "specialization": doctor.specialization,
                    "city": doctor.city,
                }

        doctors, _ = self.repository.list_doctors(search=query, page_size=5)
        return {
            "matches": [
                {
                    "id": doctor.id,
                    "doctorName": doctor.full_name,
                    "hospital": doctor.hospital.name,
                    "specialization": doctor.specialization,
                }
                for doctor in doctors
            ],
        }

