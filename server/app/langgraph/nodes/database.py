from datetime import date

from app.langgraph.state import AgentState
from app.langgraph.tools.edit_interaction import EditInteractionTool
from app.langgraph.tools.followup_tool import FollowUpRecommendationTool
from app.langgraph.tools.log_interaction import LogInteractionTool
from app.langgraph.tools.search_hcp import SearchHCPTool
from app.langgraph.tools.summary_tool import InteractionSummaryTool
from app.repositories.doctor_repository import DoctorRepository


def database_node(state: AgentState) -> AgentState:
    selected_tool = state.get("selected_tool")
    extraction = state.get("extraction", {})
    state["form_patch"] = build_form_patch(
        state,
        edit_only=selected_tool == "edit_interaction",
    )
    state["tool_results"] = {}

    if selected_tool == "preview_interaction":
        state["tool_results"] = {
            "logInteraction": {
                "mode": "preview",
                "structuredJson": extraction,
                "message": "AI populated the interaction details form.",
            },
            "followUpRecommendation": FollowUpRecommendationTool().run(extraction),
        }
        state["saved_interaction_id"] = None
        state.setdefault("logs", []).append(
            {"node": "tool_execution", "status": "preview", "tool": selected_tool},
        )
        return state

    db = state.get("db")
    if db is None:
        state["validation_errors"] = [*state.get("validation_errors", []), "db"]
        state.setdefault("logs", []).append(
            {
                "node": "tool_execution",
                "status": "failed",
                "error": "Missing db session",
            },
        )
        return state

    if selected_tool == "log_interaction":
        result = LogInteractionTool(db).run(state)
        state["saved_interaction_id"] = result.get("interactionId")
        state["tool_results"] = {
            "logInteraction": result,
            "followUpRecommendation": FollowUpRecommendationTool().run(extraction),
        }
    elif selected_tool == "edit_interaction":
        interaction_id = state.get("interaction_id")
        if interaction_id:
            updates = build_interaction_updates(db, state["form_patch"])
            result = EditInteractionTool(db).run(
                interaction_id=interaction_id,
                updates=updates,
                user_id=state.get("user_id", 1),
            )
            result["formPatch"] = state["form_patch"]
            result["appliedUpdates"] = updates
            state["saved_interaction_id"] = result.get("interactionId")
        else:
            result = {
                "success": True,
                "formPatch": state["form_patch"],
                "message": "Updated only the fields mentioned in the representative's correction.",
            }
            state["saved_interaction_id"] = None
        state["tool_results"] = {"editInteraction": result}
    elif selected_tool == "search_hcp":
        state["saved_interaction_id"] = None
        state["tool_results"] = {
            "searchHcp": SearchHCPTool(db).run(
                query=state.get("normalized_message"),
                doctor_id=state.get("doctor_id"),
            ),
        }
    elif selected_tool == "interaction_summary":
        doctor_id = state.get("doctor_id") or state.get("context", {}).get("doctorId")
        state["saved_interaction_id"] = None
        state["tool_results"] = {
            "interactionSummary": (
                InteractionSummaryTool(db).run(doctor_id)
                if doctor_id
                else {"summary": "No doctor selected."}
            ),
        }
    elif selected_tool == "followup_recommendation":
        state["saved_interaction_id"] = None
        state["tool_results"] = {
            "followUpRecommendation": FollowUpRecommendationTool().run(extraction),
        }
    else:
        state["saved_interaction_id"] = None

    state.setdefault("logs", []).append(
        {
            "node": "tool_execution",
            "status": "success",
            "tool": selected_tool,
            "result": state["tool_results"],
        },
    )
    return state


def build_form_patch(state: AgentState, edit_only: bool = False) -> dict:
    extraction = state.get("extraction", {})
    text = state.get("normalized_message", "").lower()
    patch = {
        "doctorName": extraction.get("doctorName"),
        "hospital": extraction.get("hospital"),
        "productsDiscussed": extraction.get("products", []),
        "discussion": extraction.get("summary"),
        "doctorFeedback": extraction.get("sentiment"),
        "interestLevel": interest_from_sentiment(extraction.get("sentiment", "neutral")),
        "samplesProvided": materials_from_text(text, extraction),
        "nextFollowUp": extraction.get("followUpDate"),
        "additionalNotes": (
            f"Keywords: {', '.join(extraction.get('keywords', []))}. "
            f"Medical entities: {', '.join(extraction.get('medicalEntities', []))}."
        ),
        "meetingDate": date.today().isoformat(),
        "purpose": "AI-assisted HCP interaction",
        "visitStatus": "completed",
    }

    if not edit_only:
        return {
            key: value
            for key, value in patch.items()
            if value not in [None, "", []]
        }

    allowed_keys = set()
    if "name" in text or "dr" in text:
        allowed_keys.add("doctorName")
    if "hospital" in text:
        allowed_keys.add("hospital")
    if "product" in text or "medicine" in text:
        allowed_keys.add("productsDiscussed")
    if "sentiment" in text or "positive" in text or "negative" in text or "neutral" in text:
        allowed_keys.update({"doctorFeedback", "interestLevel"})
    if "sample" in text or "brochure" in text:
        allowed_keys.add("samplesProvided")
    if "follow" in text or "visit" in text or "next" in text:
        allowed_keys.add("nextFollowUp")
    if "summary" in text or "discussion" in text:
        allowed_keys.add("discussion")

    return {
        key: value
        for key, value in patch.items()
        if key in allowed_keys and value not in [None, "", []]
    }


def build_interaction_updates(db, form_patch: dict) -> dict:
    field_map = {
        "purpose": "purpose",
        "discussion": "discussion",
        "productsDiscussed": "products_discussed",
        "samplesProvided": "samples_provided",
        "doctorFeedback": "doctor_feedback",
        "interestLevel": "interest_level",
        "nextFollowUp": "next_follow_up",
        "additionalNotes": "additional_notes",
        "visitStatus": "visit_status",
        "meetingDate": "meeting_date",
    }
    updates = {
        field_map[key]: value
        for key, value in form_patch.items()
        if key in field_map
    }
    doctor_name = form_patch.get("doctorName")

    if doctor_name:
        doctors, _ = DoctorRepository(db).list_doctors(
            search=str(doctor_name),
            page_size=1,
        )
        if doctors:
            updates["doctor_id"] = doctors[0].id
            updates["hospital_id"] = doctors[0].hospital_id

    return updates


def interest_from_sentiment(sentiment: str) -> str:
    if sentiment == "positive":
        return "high"
    if sentiment == "negative":
        return "low"
    return "medium"


def materials_from_text(text: str, extraction: dict) -> str:
    if "brochure" in text:
        return "Brochures shared"
    if "sample" in text or any(
        "sample" in item.lower()
        for item in extraction.get("actionItems", [])
    ):
        return "Samples requested"
    return ""
