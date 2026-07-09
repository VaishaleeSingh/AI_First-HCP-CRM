from app.langgraph.state import AgentState


def response_node(state: AgentState) -> AgentState:
    selected_tool = state.get("selected_tool", "preview_interaction")
    if state.get("validation_errors"):
        state["response"] = "I extracted partial CRM fields but need more detail before saving."
    elif state.get("saved_interaction_id"):
        state["response"] = "The interaction was extracted, validated, and saved."
    elif selected_tool == "edit_interaction":
        state["response"] = "I updated only the fields you corrected on the interaction details form."
    elif selected_tool == "search_hcp":
        state["response"] = "I searched the HCP panel and returned the closest doctor context."
    elif selected_tool == "interaction_summary":
        state["response"] = "I summarized the previous interaction history for this HCP."
    elif selected_tool == "followup_recommendation":
        state["response"] = "I generated follow-up recommendations from the interaction context."
    else:
        state["response"] = "The interaction details form was populated from the AI conversation."
    state.setdefault("logs", []).append({"node": "response", "status": "success"})
    return state
