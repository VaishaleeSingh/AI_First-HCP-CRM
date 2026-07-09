from app.langgraph.state import AgentState


def router_node(state: AgentState) -> AgentState:
    text = state.get("normalized_message", "").lower()
    if any(word in text for word in ["met", "discussed", "sample", "follow", "visit"]):
        state["route"] = "interaction_logging"
    else:
        state["route"] = "general_chat"
    state.setdefault("logs", []).append({"node": "router", "route": state["route"]})
    return state

