from sqlalchemy.orm import Session

from app.models import Doctor, Hospital, Product, User


def seed_reference_data(db: Session) -> None:
    if db.query(User).first():
        return

    user = User(
        name="Aarav Mehta",
        email="aarav.mehta@pharma.example",
        hashed_password="development-only",
        territory="Mumbai Central",
    )
    hospitals = [
        Hospital(name="Apollo Health City", city="Mumbai", state="Maharashtra"),
        Hospital(name="Fortis Heart Institute", city="Pune", state="Maharashtra"),
        Hospital(name="Sanjeevani Medical Center", city="Bengaluru", state="Karnataka"),
    ]
    products = [
        Product(name="GlucoZen XR", therapeutic_area="Diabetes"),
        Product(name="CardiaPlus", therapeutic_area="Cardiology"),
        Product(name="RespiraClear", therapeutic_area="Pulmonology"),
        Product(name="NeuroCalm", therapeutic_area="Neurology"),
        Product(name="Immunova", therapeutic_area="Immunology"),
    ]
    db.add(user)
    db.add_all(hospitals + products)
    db.flush()
    doctors = [
        Doctor(
            full_name="Dr. Kavita Sharma",
            specialization="Endocrinology",
            city="Mumbai",
            email="kavita.sharma@apollo.example",
            phone="+91 98765 11001",
            hospital_id=hospitals[0].id,
        ),
        Doctor(
            full_name="Dr. Rohan Iyer",
            specialization="Cardiology",
            city="Pune",
            email="rohan.iyer@fortis.example",
            phone="+91 98765 11002",
            hospital_id=hospitals[1].id,
        ),
        Doctor(
            full_name="Dr. Meera Nair",
            specialization="Pulmonology",
            city="Bengaluru",
            email="meera.nair@sanjeevani.example",
            phone="+91 98765 11003",
            hospital_id=hospitals[2].id,
        ),
    ]
    db.add_all(doctors)
    db.commit()

