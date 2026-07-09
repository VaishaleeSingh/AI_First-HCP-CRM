from app.langgraph.state import AgentState
from app.models import AgentLog


def logging_node(state: AgentState) -> AgentState:
    db = state.get("db")
    if db is not None:
        for entry in state.get("logs", []):
            db.add(
                AgentLog(
                    interaction_id=state.get("saved_interaction_id"),
                    node_name=entry.get("node", "unknown"),
                    input_payload={"message": state.get("normalized_message")},
                    output_payload=entry,
                    status=entry.get("status", "success"),
                ),
            )
        db.commit()
    state.setdefault("logs", []).append({"node": "logging", "status": "success" if db else "skipped"})
    return state

