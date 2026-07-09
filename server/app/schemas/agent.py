from pydantic import Field

from app.schemas.base import ApiSchema


class AgentProcessRequest(ApiSchema):
    message: str
    doctor_id: int | None = None
    interaction_id: int | None = None
    save_requested: bool = False


class AgentExtraction(ApiSchema):
    doctor_name: str
    hospital: str
    products: list[str]
    summary: str
    sentiment: str
    action_items: list[str]
    follow_up_date: str
    keywords: list[str]
    medical_entities: list[str]
    confidence_score: float


class AgentProcessResponse(ApiSchema):
    extraction: AgentExtraction
    response: str
    selected_tool: str
    form_patch: dict = Field(default_factory=dict)
    tool_results: dict = Field(default_factory=dict)
    saved_interaction_id: int | None = None
    logs: list[dict] = Field(default_factory=list)


class ChatRequest(ApiSchema):
    message: str
    doctor_id: int | None = None
