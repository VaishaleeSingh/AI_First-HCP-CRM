from app.langgraph.state import AgentState


REQUIRED_KEYS = ["doctorName", "products", "summary", "sentiment", "actionItems", "followUpDate", "confidenceScore"]


def validation_node(state: AgentState) -> AgentState:
    extraction = state.get("extraction", {})
    errors = [key for key in REQUIRED_KEYS if extraction.get(key) in [None, "", []]]
    confidence = float(extraction.get("confidenceScore", 0.0))
    if confidence < 0.45:
        errors.append("confidenceScore")
    state["validation_errors"] = errors
    state.setdefault("logs", []).append({"node": "validation", "errors": errors})
    return state

