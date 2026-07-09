from app.langgraph.state import AgentState


def input_node(state: AgentState) -> AgentState:
    message = state.get("message", "")
    state["normalized_message"] = " ".join(message.strip().split())
    state.setdefault("logs", []).append({"node": "input", "status": "success"})
    return state

