from app.langgraph.state import AgentState


def tool_router_node(state: AgentState) -> AgentState:
    if state.get("validation_errors"):
        selected_tool = "response"
    elif state.get("save_requested"):
        selected_tool = "log_interaction"
    elif state.get("intent") in {
        "edit_interaction",
        "search_hcp",
        "interaction_summary",
        "followup_recommendation",
    }:
        selected_tool = state["intent"]
    else:
        selected_tool = "preview_interaction"
    state["selected_tool"] = selected_tool
    state.setdefault("logs", []).append({"node": "tool_router", "selectedTool": selected_tool})
    return state
