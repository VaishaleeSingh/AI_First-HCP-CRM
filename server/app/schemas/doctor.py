from app.schemas.base import ApiSchema


class HospitalRead(ApiSchema):
    id: int
    name: str
    city: str
    state: str | None = None


class ProductRead(ApiSchema):
    id: int
    name: str
    therapeutic_area: str


class DoctorCreate(ApiSchema):
    full_name: str
    specialization: str
    city: str
    hospital_id: int
    email: str | None = None
    phone: str | None = None


class DoctorRead(ApiSchema):
    id: int
    full_name: str
    specialization: str
    city: str
    hospital: HospitalRead
    email: str | None = None
    phone: str | None = None
    last_visit_at: str | None = None
    next_follow_up_at: str | None = None
    products_prescribed: list[ProductRead] = []


class DoctorListResponse(ApiSchema):
    items: list[DoctorRead]
    page: int
    total: int

