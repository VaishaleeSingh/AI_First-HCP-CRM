from app.langgraph.state import AgentState
from app.services.groq_client import GroqClient


def entity_extraction_node(state: AgentState) -> AgentState:
    client = GroqClient()
    state["extraction"] = client.extract_interaction(
        state.get("normalized_message", ""),
        state.get("context", {}),
    )
    state.setdefault("logs", []).append({"node": "entity_extraction", "status": "success"})
    return state

