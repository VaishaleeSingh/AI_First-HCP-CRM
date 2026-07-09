from datetime import date, time

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.langgraph.nodes.database import database_node
from app.models import Doctor, Hospital, Product, User
from app.repositories.interaction_repository import InteractionRepository
from app.schemas.interaction import InteractionCreate


def test_database_node_uses_edit_tool_for_saved_interaction():
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
    db = testing_session()

    user = User(
        name="Aarav Mehta",
        email="aarav.mehta@example.com",
        hashed_password="development-only",
        territory="Mumbai Central",
    )
    hospital = Hospital(
        name="Apollo Health City",
        city="Mumbai",
        state="Maharashtra",
    )
    products = [
        Product(name="GlucoZen XR", therapeutic_area="Diabetes"),
        Product(name="CardiaPlus", therapeutic_area="Cardiology"),
    ]
    db.add_all([user, hospital, *products])
    db.flush()

    doctor = Doctor(
        full_name="Dr. Kavita Sharma",
        specialization="Endocrinology",
        city="Mumbai",
        hospital_id=hospital.id,
    )
    db.add(doctor)
    db.commit()

    repository = InteractionRepository(db)
    interaction = repository.create(
        InteractionCreate(
            doctor_id=doctor.id,
            hospital_id=hospital.id,
            meeting_date=date(2026, 7, 9),
            meeting_time=time(10, 30),
            duration_minutes=30,
            purpose="AI conversation",
            discussion="Original positive discussion about diabetes therapy.",
            products_discussed=["GlucoZen XR"],
            doctor_feedback="positive",
            interest_level="high",
            visit_status="completed",
        ),
        user_id=user.id,
        summary="Original positive discussion about diabetes therapy.",
        sentiment="positive",
        confidence=0.9,
    )

    result = database_node(
        {
            "db": db,
            "extraction": {
                "doctorName": "Dr. Kavita Sharma",
                "hospital": "Apollo Health City",
                "products": ["CardiaPlus"],
                "summary": "Updated summary says the HCP raised access concerns.",
                "sentiment": "negative",
                "actionItems": [],
                "followUpDate": "2026-07-20",
                "keywords": ["access"],
                "medicalEntities": [],
                "confidenceScore": 0.86,
            },
            "interaction_id": interaction.id,
            "logs": [],
            "normalized_message": (
                "Actually change the product, sentiment, summary, "
                "and follow-up date."
            ),
            "selected_tool": "edit_interaction",
            "user_id": user.id,
        },
    )

    updated = repository.get_by_id(interaction.id)

    assert result["tool_results"]["editInteraction"]["success"] is True
    assert result["saved_interaction_id"] == interaction.id
    assert updated is not None
    assert updated.sentiment == "negative"
    assert updated.interest_level == "low"
    assert updated.next_follow_up == date(2026, 7, 20)
    assert [link.product.name for link in updated.products] == ["CardiaPlus"]
