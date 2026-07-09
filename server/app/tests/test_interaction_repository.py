from datetime import date, time

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.models import AuditLog, Doctor, Hospital, Product, User
from app.repositories.interaction_repository import InteractionRepository
from app.schemas.interaction import InteractionCreate


def test_delete_interaction_keeps_audit_history_without_fk_error():
    db = build_session()
    user, hospital, doctor = seed_reference_data(db)
    repository = InteractionRepository(db)
    interaction = repository.create(
        InteractionCreate(
            doctor_id=doctor.id,
            hospital_id=hospital.id,
            meeting_date=date(2026, 7, 9),
            meeting_time=time(14, 30),
            duration_minutes=25,
            purpose="Clinical update",
            discussion="Structured form test discussion about adherence and product education.",
            products_discussed=["GlucoZen XR"],
            doctor_feedback="positive",
            interest_level="high",
            visit_status="completed",
        ),
        user_id=user.id,
        summary="Structured form test discussion.",
        sentiment="positive",
        confidence=0.86,
    )

    deleted = repository.delete(interaction.id, user_id=user.id)
    delete_audit = (
        db.query(AuditLog)
        .filter(
            AuditLog.action == "delete",
            AuditLog.entity_id == interaction.id,
        )
        .one()
    )

    assert deleted is True
    assert repository.get_by_id(interaction.id) is None
    assert delete_audit.interaction_id is None


def build_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        future=True,
    )
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(
        bind=engine,
        autoflush=False,
        autocommit=False,
        future=True,
    )
    return testing_session()


def seed_reference_data(db):
    user = User(
        name="Aarav Mehta",
        email="aarav.mehta@example.com",
        hashed_password="development-only",
        role="field_representative",
        territory="Mumbai Central",
    )
    hospital = Hospital(
        name="Apollo Health City",
        city="Mumbai",
        state="Maharashtra",
    )
    product = Product(name="GlucoZen XR", therapeutic_area="Diabetes")
    db.add_all([user, hospital, product])
    db.flush()
    doctor = Doctor(
        full_name="Dr. Kavita Sharma",
        specialization="Endocrinology",
        city="Mumbai",
        hospital_id=hospital.id,
    )
    db.add(doctor)
    db.commit()
    return user, hospital, doctor
