from app.langgraph.state import AgentState


def intent_detection_node(state: AgentState) -> AgentState:
    text = state.get("normalized_message", "").lower()
    if any(word in text for word in ["edit", "update", "change", "correct", "actually", "sorry"]):
        intent = "edit_interaction"
    elif "search" in text or "find" in text:
        intent = "search_hcp"
    elif "summary" in text or "previous" in text:
        intent = "interaction_summary"
    elif "recommend" in text or "best follow" in text or "suggest" in text:
        intent = "followup_recommendation"
    else:
        intent = "log_interaction"
    state["intent"] = intent
    state.setdefault("logs", []).append({"node": "intent_detection", "intent": intent})
    return state
