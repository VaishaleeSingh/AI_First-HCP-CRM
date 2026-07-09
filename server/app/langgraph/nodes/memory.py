from app.langgraph.state import AgentState
from app.models import ChatHistory


def memory_node(state: AgentState) -> AgentState:
    db = state.get("db")
    if db is not None:
        db.add(
            ChatHistory(
                interaction_id=state.get("saved_interaction_id"),
                user_id=state.get("user_id", 1),
                role="representative",
                message=state.get("normalized_message", ""),
                extracted_payload=state.get("extraction"),
            ),
        )
        db.commit()
    state.setdefault("logs", []).append({"node": "memory", "status": "success" if db else "skipped"})
    return state

