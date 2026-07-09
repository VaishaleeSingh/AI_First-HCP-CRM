from sqlalchemy.orm import Session

from app.langgraph.graph import build_agent_graph
from app.repositories.user_repository import UserRepository
from app.schemas.agent import AgentExtraction, AgentProcessRequest, AgentProcessResponse


class AgentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.graph = build_agent_graph()

    def process(self, payload: AgentProcessRequest) -> AgentProcessResponse:
        user = self.user_repository.get_default_user()
        result = self.graph.invoke(
            {
                "message": payload.message,
                "doctor_id": payload.doctor_id,
                "interaction_id": payload.interaction_id,
                "user_id": user.id,
                "db": self.db,
                "save_requested": payload.save_requested,
                "logs": [],
            },
        )
        extraction = AgentExtraction(**result["extraction"])
        return AgentProcessResponse(
            extraction=extraction,
            response=result.get("response", ""),
            selected_tool=result.get("selected_tool", "preview_interaction"),
            form_patch=result.get("form_patch", {}),
            tool_results=result.get("tool_results", {}),
            saved_interaction_id=result.get("saved_interaction_id"),
            logs=result.get("logs", []),
        )
