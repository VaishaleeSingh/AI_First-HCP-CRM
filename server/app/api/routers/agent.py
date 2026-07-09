from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import agent_controller
from app.database.session import get_db
from app.schemas.agent import AgentProcessRequest, AgentProcessResponse, ChatRequest

router = APIRouter(tags=["Agent"])


@router.post("/agent/process", response_model=AgentProcessResponse)
def process_agent(payload: AgentProcessRequest, db: Session = Depends(get_db)) -> AgentProcessResponse:
    return agent_controller.process(db, payload)


@router.post("/chat", response_model=AgentProcessResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> AgentProcessResponse:
    return agent_controller.chat(db, payload)

