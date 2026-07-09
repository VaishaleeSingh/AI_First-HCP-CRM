from sqlalchemy.orm import Session

from app.schemas.agent import AgentProcessRequest, AgentProcessResponse, ChatRequest
from app.services.agent_service import AgentService


def process(db: Session, payload: AgentProcessRequest) -> AgentProcessResponse:
    return AgentService(db).process(payload)


def chat(db: Session, payload: ChatRequest) -> AgentProcessResponse:
    request = AgentProcessRequest(message=payload.message, doctor_id=payload.doctor_id, save_requested=False)
    return AgentService(db).process(request)

