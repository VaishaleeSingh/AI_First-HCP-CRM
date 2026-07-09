from app.langgraph.state import AgentState
from app.langgraph.tools.search_hcp import SearchHCPTool
from app.models import Doctor


def context_node(state: AgentState) -> AgentState:
    db = state.get("db")
    context = {}
    if db:
        context = SearchHCPTool(db).run(query=state.get("normalized_message"), doctor_id=state.get("doctor_id"))
        if "matches" not in context and state.get("doctor_id"):
            context["doctorId"] = state.get("doctor_id")
            doctor = db.get(Doctor, state.get("doctor_id"))
            if doctor:
                context["hospitalId"] = doctor.hospital_id
    state["context"] = context
    state.setdefault("logs", []).append({"node": "context", "hasContext": bool(context)})
    return state
