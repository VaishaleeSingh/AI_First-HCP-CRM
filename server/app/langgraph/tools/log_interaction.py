from datetime import date, datetime

from sqlalchemy.orm import Session

from app.repositories.interaction_repository import InteractionRepository
from app.schemas.interaction import InteractionCreate


class LogInteractionTool:
    name = "log_interaction"

    def __init__(self, db: Session) -> None:
        self.repository = InteractionRepository(db)

    def run(self, state: dict) -> dict:
        extraction = state["extraction"]
        context = state.get("context", {})
        doctor_id = state.get("doctor_id") or context.get("doctorId")
        hospital_id = context.get("hospitalId")

        if not doctor_id or not hospital_id:
            return {"success": False, "message": "Doctor and hospital context are required before saving."}

        follow_up_date = self._parse_date(extraction.get("followUpDate"))
        materials_text = " ".join(extraction.get("actionItems", [])).lower()
        samples_or_materials = None
        if "sample" in materials_text:
            samples_or_materials = "Samples requested"
        elif "brochure" in materials_text:
            samples_or_materials = "Brochures shared"

        payload = InteractionCreate(
            doctor_id=doctor_id,
            hospital_id=hospital_id,
            meeting_date=date.today(),
            meeting_time=datetime.now().time().replace(microsecond=0),
            duration_minutes=30,
            purpose="AI conversation",
            discussion=extraction["summary"],
            products_discussed=extraction.get("products", []),
            samples_provided=samples_or_materials,
            doctor_feedback=extraction.get("sentiment"),
            interest_level=self._interest_from_sentiment(extraction.get("sentiment", "neutral")),
            next_follow_up=follow_up_date,
            additional_notes=f"Keywords: {', '.join(extraction.get('keywords', []))}",
            visit_status="completed",
        )
        interaction = self.repository.create(
            payload,
            user_id=state.get("user_id", 1),
            summary=extraction["summary"],
            sentiment=extraction.get("sentiment", "neutral"),
            confidence=float(extraction.get("confidenceScore", 0.0)),
        )
        return {
            "success": True,
            "interactionId": interaction.id,
            "structuredJson": extraction,
            "message": "Interaction saved successfully.",
        }

    @staticmethod
    def _parse_date(value: str | None) -> date | None:
        if not value:
            return None
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None

    @staticmethod
    def _interest_from_sentiment(sentiment: str) -> str:
        if sentiment == "positive":
            return "high"
        if sentiment == "negative":
            return "low"
        return "medium"
