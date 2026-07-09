from app.langgraph.state import AgentState
from app.services.groq_client import GroqClient


def summarization_node(state: AgentState) -> AgentState:
    extraction = state.get("extraction", {})
    if not extraction.get("summary"):
        extraction["summary"] = GroqClient().summarize(state.get("normalized_message", ""))
    state["extraction"] = extraction
    state.setdefault("logs", []).append({"node": "summarization", "status": "success"})
    return state

